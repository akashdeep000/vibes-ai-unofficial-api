import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { API_BASE_URL } from "../constants.js";
import { VibesAuthError, VibesValidationError } from "../errors.js";
import { MeResponseSchema, type User } from "../schemas/auth.js";
import { safeJsonParse } from "../utils/json.js";
import { loginViaBrowser, type PlantedCookie } from "./browser-cdp.js";
import {
  readCookiesFromBrowser,
  type BrowserKind,
  type BrowserSessionConfig,
} from "./browser-session.js";

/**
 * Auto-login — mint and maintain a vibes.ai session without manual cookie
 * copying (see `requests/vibes.ai-reference-auth.har`):
 *
 *   1. vibes.ai/api/meta-oidc/start  -> auth.meta.com/oidc -> auth.meta.ai/ecto
 *      -> vibes.ai/api/meta-oidc/callback -> Set-Cookie: meta_session=…
 *
 * Meta's edge rejects non-Chrome TLS fingerprints, so the redirect dance runs
 * in a headless Chromium driven over CDP (`browser-cdp.ts`), with your
 * browser's Meta account cookies (`dbln`, `fs`, …) planted into it. Meta sees
 * a completely ordinary browser; one manual sign-in is enough, everything
 * after that refreshes itself.
 *
 * `autoSession()` is the one-liner provider for `VibesClient`:
 *
 *   1. `VIBES_SESSION_COOKIE` (server/headless: static cookie from the env)
 *   2. `./.vibes-session.json` (gitignored) — validated against /auth/me
 *   3. `login()` — the browser flow above, result cached back to the file
 *
 * When the client sees a 401 it calls `provider.refresh()` once and retries,
 * so a rotated/expired session heals itself instead of failing at runtime.
 *
 * @example
 * ```ts
 * const client = new VibesClient({ session: autoSession() });
 * ```
 */

const META_AUTH_URL = "https://auth.meta.com/";

/** `dbln` is the sentinel — it only exists on a signed-in Meta account. */
const META_AUTH_COOKIES = ["dbln", "fs", "datr", "ps_l", "ps_n", "locale"] as const;

const PROBE_TIMEOUT_MS = 30_000;
export const DEFAULT_SESSION_FILE = ".vibes-session.json";

export interface AutoSessionOptions {
  /** Static session cookie checked before any login (default: $VIBES_SESSION_COOKIE). */
  sessionFromEnv?: string;
  /** Where the minted session is cached (default: $VIBES_SESSION_FILE or ./.vibes-session.json). */
  sessionFile?: string;
  /** Origin, e.g. "https://vibes.ai". Defaults to the platform. */
  baseUrl?: string;
  /** Browser to read Meta cookies from; auto-detect when unset. */
  browser?: BrowserKind;
  /** Chrome-profile dir with Default/Cookies (overrides browser). */
  profileDir?: string;
  /** Chromium binary used for the login flow (default: $VIBES_BROWSER_BINARY or autodetect). */
  browserBinary?: string;
  /** Injectable fetch (used by tests and alternative runtimes). */
  fetchImpl?: typeof fetch;
  /** Injectable cookie reader (used by tests). */
  readCookies?: BrowserSessionConfig["readCookies"];
  /** Injectable browser login (used by tests). */
  loginBrowser?: (opts: {
    startUrl: string;
    landingUrlPrefix: string;
    cookiesForUrl: string;
    cookies: PlantedCookie[];
  }) => Promise<string>;
  /** Log resolution steps to stderr. */
  verbose?: boolean;
}

export interface LoginResult {
  /** Ready-to-send session cookie (`meta_session=…; cookie_ack=true`). */
  cookie: string;
  /** The signed-in user, fetched once to prove the session works. */
  user: User;
}

interface SessionFile {
  cookie: string;
  user?: User;
  savedAt: string;
}

/**
 * A session provider with self-healing: `VibesClient` calls `refresh()` once
 * on a 401 and retries with the fresh cookie.
 */
export type AutoSession = (() => Promise<string>) & { refresh: () => Promise<string> };

/** Mint a fresh vibes.ai session: Meta cookies from the browser -> CDP login. */
export async function login(opts: AutoSessionOptions = {}): Promise<LoginResult> {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const baseUrl = (opts.baseUrl ?? API_BASE_URL).replace(/\/+$/, "");
  const trace = (step: string) => opts.verbose && console.warn(`   [login] ${step}`);

  trace("reading Meta account cookies");
  const meta = await readCookiesFromBrowser({
    url: META_AUTH_URL,
    cookieNames: META_AUTH_COOKIES,
    ...(opts.browser ? { browser: opts.browser } : {}),
    ...(opts.profileDir ? { profileDir: opts.profileDir } : {}),
    ...(opts.readCookies ? { readCookies: opts.readCookies } : {}),
  }).catch((cause) => {
    throw new VibesAuthError(
      "Auto-login needs a signed-in Meta account in your browser. " +
        "Sign in to vibes.ai (Continue with Meta) once — the session stays fresh afterwards.",
      { cause },
    );
  });

  trace("minting session in headless browser");
  const cookies: PlantedCookie[] = meta.cookies.map((c) => ({
    name: c.name,
    value: c.value,
    url: META_AUTH_URL,
  }));
  const metaSession = await (opts.loginBrowser ?? loginViaBrowser)({
    startUrl: `${baseUrl}/api/meta-oidc/start`,
    landingUrlPrefix: `${baseUrl}/`,
    cookiesForUrl: `${baseUrl}/`,
    cookies,
    ...(opts.browserBinary ? { binary: opts.browserBinary } : {}),
  });

  const cookie = `${metaSession}; cookie_ack=true`;
  const user = await validate(cookie, fetchImpl, baseUrl);
  trace(`signed in as ${user.username}`);
  return { cookie, user };
}

/** One-liner self-healing session provider for `VibesClient`. */
export function autoSession(opts: AutoSessionOptions = {}): AutoSession {
  const file = opts.sessionFile ?? process.env.VIBES_SESSION_FILE ?? DEFAULT_SESSION_FILE;
  const fromEnv = () => opts.sessionFromEnv ?? process.env.VIBES_SESSION_COOKIE;
  let cached: string | undefined;

  const refresh = async (): Promise<string> => {
    if (fromEnv()) {
      throw new VibesAuthError(
        "VIBES_SESSION_COOKIE was rejected by vibes.ai. " +
          "Replace it with a fresh cookie (or unset it to let the browser-based auto-login take over).",
      );
    }
    const { cookie, user } = await login(opts);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      file,
      JSON.stringify({ cookie, user, savedAt: new Date().toISOString() } satisfies SessionFile),
      { mode: 0o600 },
    );
    if (opts.verbose) console.warn(`   [login] session cached at ${file}`);
    cached = cookie;
    return cookie;
  };

  const provider = async (): Promise<string> => {
    const env = fromEnv();
    if (env) return env;
    if (cached) return cached;
    const disk = readSessionFile(file);
    if (disk && (await isValid(disk, opts))) {
      if (opts.verbose) console.warn(`   [login] reusing cached session from ${file}`);
      return (cached = disk);
    }
    return refresh();
  };

  provider.refresh = refresh;
  return provider;
}

/** Validate a session cookie by calling `/api/auth/me`. */
async function validate(cookie: string, fetchImpl: typeof fetch, baseUrl: string): Promise<User> {
  const res = await fetchImpl(`${baseUrl}/api/auth/me`, {
    headers: { accept: "application/json", cookie },
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new VibesAuthError(`Fresh login was rejected by /auth/me (status ${res.status}).`);
  }
  const parsed = MeResponseSchema.safeParse(safeJsonParse(await res.text()));
  if (!parsed.success) {
    throw new VibesValidationError(
      parsed.error.issues.map((i) => `- ${i.path.join(".") || "(root)"}: ${i.message}`),
      parsed.data,
    );
  }
  return parsed.data.user;
}

async function isValid(cookie: string, opts: AutoSessionOptions): Promise<boolean> {
  try {
    const res = await (opts.fetchImpl ?? globalThis.fetch)(
      `${(opts.baseUrl ?? API_BASE_URL).replace(/\/+$/, "")}/api/auth/me`,
      { headers: { cookie }, signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) },
    );
    return res.ok;
  } catch {
    return false;
  }
}

function readSessionFile(file: string): string | undefined {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<SessionFile>;
    return typeof parsed.cookie === "string" && parsed.cookie.length > 0
      ? parsed.cookie
      : undefined;
  } catch {
    return undefined;
  }
}
