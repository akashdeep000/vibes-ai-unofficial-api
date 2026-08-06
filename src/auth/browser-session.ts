import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getCookies, type BrowserName, type Cookie } from "@steipete/sweet-cookie";
import { VibesAuthError } from "../errors.js";

/**
 * Browser session sync — reads the vibes.ai session cookie straight from the
 * browser's cookie database via `@steipete/sweet-cookie` (read-only copy of
 * the DB, zero side effects; the browser can stay open).
 *
 * `browserSession()` resolves the session in this order:
 *   1. `VIBES_SESSION_COOKIE` (server/headless: static cookie from the env)
 *   2. helium — a Chromium fork, read through the chrome backend at its
 *      profile dir (sweet-cookie cannot discover it on its own)
 *   3. the known browsers: chrome -> chromium -> brave -> edge -> firefox -> safari
 * The first source with a `meta_session` cookie wins; missing databases are
 * skipped. Explicit choices never fall back.
 *
 * Keyring: as a generic fallback the v11 key is read once from the Secret
 * Service entry "Chromium Safe Storage" (the label Chromium forks use) and
 * passed via sweet-cookie's env override — inert when no such entry exists.
 *
 * Env overrides:
 *   VIBES_SESSION_COOKIE  static session cookie (takes precedence)
 *   VIBES_BROWSER         browser name (helium|chrome|chromium|brave|edge|firefox|safari)
 *   VIBES_PROFILE_DIR     explicit profile dir
 */

const SESSION_URL = "https://vibes.ai/";
const SESSION_NAMES = ["meta_session", "cookie_ack"] as const;

const DEFAULT_THROTTLE_MS = 5_000;

const HELIUM_DB = join(homedir(), ".config", "net.imput.helium", "Default", "Cookies");
const CHROMIUM_DB = join(homedir(), ".config", "chromium", "Default", "Cookies");
const BRAVE_DB = join(homedir(), ".config", "BraveSoftware", "Brave-Browser", "Default", "Cookies");

/** Browsers sweet-cookie knows + Chromium forks read through the chrome backend. */
export type BrowserKind = BrowserName | "helium" | "chromium" | "brave";

export interface BrowserSessionConfig {
  /** Browser name for explicit single-source mode; auto-detect when unset. */
  browser?: BrowserKind;
  /** Chrome-profile dir with Default/Cookies (overrides browser). */
  profileDir?: string;
  /** Static session cookie checked before any browser sync (default: $VIBES_SESSION_COOKIE). */
  sessionFromEnv?: string;
  /** Log resolution steps to stderr. */
  verbose?: boolean;
  /** Cookie names to collect (default: meta_session + cookie_ack). */
  cookieNames?: readonly string[];
  /** Origin used for cookie filtering. Defaults to https://vibes.ai/. */
  url?: string;
  /** Minimum interval between two syncs (default 5000ms). */
  throttleMs?: number;
  /** Injectable cookie reader (used by tests). */
  readCookies?: (opts: {
    url: string;
    names: readonly string[];
    browsers: BrowserName[];
    chromeProfile?: string;
    timeoutMs: number;
  }) => Promise<{ cookies: Cookie[]; warnings: string[] }>;
}

interface Candidate {
  name: string;
  browser: BrowserName;
  dbPath?: string;
}

/** Auto-detect order: first browser with a session cookie wins. */
function autoCandidates(): Candidate[] {
  return [
    // helium: Chromium fork, read through the chrome backend
    { name: "helium", browser: "chrome", dbPath: HELIUM_DB },
    { name: "chrome", browser: "chrome" },
    // chromium/brave: Chromium forks, read through the chrome backend
    { name: "chromium", browser: "chrome", dbPath: CHROMIUM_DB },
    { name: "brave", browser: "chrome", dbPath: BRAVE_DB },
    { name: "edge", browser: "edge" },
    { name: "firefox", browser: "firefox" },
    { name: "safari", browser: "safari" },
  ];
}

/** Explicit non-native browser: resolve its cookie DB through the chrome backend. */
function forkDbPath(kind: BrowserKind): string | undefined {
  if (kind === "helium") return HELIUM_DB;
  if (kind === "chromium") return CHROMIUM_DB;
  if (kind === "brave") return BRAVE_DB;
  return undefined;
}

/**
 * Read the vibes.ai session cookie header straight from a browser's cookie
 * database. Returns e.g. `meta_session=...; cookie_ack=true`.
 *
 * Throws `VibesAuthError` when no browser holds a `meta_session` cookie for
 * vibes.ai — sign in to vibes.ai in your browser and retry.
 */
export async function syncSessionFromBrowser(cfg: BrowserSessionConfig = {}): Promise<string> {
  const kind = (cfg.browser ?? process.env.VIBES_BROWSER) as BrowserKind | undefined;
  const profileDir = cfg.profileDir ?? process.env.VIBES_PROFILE_DIR;
  const readCookies = cfg.readCookies ?? defaultReadCookies;
  const names = cfg.cookieNames ?? SESSION_NAMES;
  const sessionName = names[0] ?? SESSION_NAMES[0];

  let candidates: Candidate[];
  if (profileDir) {
    const dbPath = join(profileDir, "Default", "Cookies");
    if (!existsSync(dbPath)) {
      throw new VibesAuthError(`No cookie database at ${dbPath}.`);
    }
    candidates = [{ name: "profile", browser: "chrome", dbPath }];
  } else if (kind) {
    // explicit browser: single source, no fallback
    const dbPath = forkDbPath(kind);
    if (dbPath && !existsSync(dbPath)) {
      throw new VibesAuthError(`No cookie database at ${dbPath}.`);
    }
    candidates = [
      {
        name: kind,
        browser: kind === "helium" || kind === "chromium" || kind === "brave" ? "chrome" : kind,
        ...(dbPath ? { dbPath } : {}),
      },
    ];
  } else {
    candidates = autoCandidates();
  }
  if (cfg.verbose) {
    const parts = candidates.map((c) => c.name);
    const db = candidates[0]?.dbPath;
    if (db) parts.push(db);
    if (!profileDir && !kind) parts.push("(auto-detect)");
    console.warn(`   [browser] ${parts.join(", ")}`);
  }

  setKeyringPassword();
  let warnings: string[] = [];
  for (const c of candidates) {
    if (c.dbPath && !existsSync(c.dbPath)) {
      warnings.push(`${c.name}: cookie database not found`);
      if (cfg.verbose) console.warn(`   [browser] ${c.name}: cookie database not found`);
      continue;
    }
    const res = await readCookies({
      url: cfg.url ?? SESSION_URL,
      names,
      browsers: [c.browser],
      ...(c.dbPath ? { chromeProfile: c.dbPath } : {}),
      timeoutMs: 15_000,
    });
    warnings = res.warnings;
    if (cfg.verbose && warnings.length) {
      for (const w of warnings) console.warn(`   [browser] ${w}`);
    }
    const picked = res.cookies.filter((c) => c.value.length > 0);
    if (picked.some((c) => c.name === sessionName)) {
      if (cfg.verbose && c.name !== candidates[0]!.name) {
        console.warn(`   [browser] ${c.name} has the session cookie (fallback)`);
      }
      // session cookie first, then the rest (e.g. cookie_ack) in DB order
      const ordered = [
        ...picked.filter((c) => c.name === sessionName),
        ...picked.filter((c) => c.name !== sessionName),
      ];
      return ordered.map((c) => `${c.name}=${c.value}`).join("; ");
    }
  }
  const why = warnings[0] ? ` (${warnings[0]})` : "";
  throw new VibesAuthError(
    `No vibes.ai session cookie (meta_session) in your browser${why}. ` +
      `Tried: ${candidates.map((c) => c.name).join(", ")}. ` +
      "Sign in to vibes.ai in your browser, or pass `session` explicitly.",
  );
}

/**
 * Session provider that resolves the vibes.ai session cookie in order:
 *
 *   1. `sessionFromEnv` / `$VIBES_SESSION_COOKIE` — static cookie for
 *      servers and headless deployments; never re-read from the browser.
 *   2. The browser chain (helium -> chrome -> chromium -> brave -> edge ->
 *      firefox -> safari), refreshed from disk at most every `throttleMs`
 *      (default 5s), so a rotated `meta_session` is picked up without
 *      recreating the client.
 *
 * The same provider works on the server (env cookie) and locally (browser
 * cookie).
 *
 * @example
 * ```ts
 * const client = new VibesClient({ session: browserSession() });
 * ```
 */
export function browserSession(cfg: BrowserSessionConfig = {}): () => Promise<string | undefined> {
  const throttleMs = cfg.throttleMs ?? DEFAULT_THROTTLE_MS;
  let cache: { at: number; header: string } | undefined;

  return async () => {
    // server path: static env cookie wins and is re-checked per call
    const fromEnv = cfg.sessionFromEnv ?? process.env.VIBES_SESSION_COOKIE;
    if (fromEnv) return fromEnv;

    const now = Date.now();
    if (cache && now - cache.at < throttleMs) return cache.header;
    const header = await syncSessionFromBrowser(cfg);
    cache = { at: Date.now(), header };
    return header;
  };
}

const defaultReadCookies: NonNullable<BrowserSessionConfig["readCookies"]> = (opts) =>
  getCookies({
    url: opts.url,
    names: [...opts.names],
    browsers: [...opts.browsers],
    ...(opts.chromeProfile ? { chromeProfile: opts.chromeProfile } : {}),
    timeoutMs: opts.timeoutMs,
  });

/* ------------------------------- keyring (v11) ------------------------------ */

const CHROMIUM_KEYRING_LABEL = "Chromium Safe Storage";
let keyringLoaded = false;

function setKeyringPassword(): void {
  if (keyringLoaded) return;
  keyringLoaded = true;
  const r = spawnSync(
    "secret-tool",
    ["search", "--all", "xdg:schema", "chrome_libsecret_os_crypt_password_v2"],
    { encoding: "utf8", timeout: 15_000 },
  );
  if (r.status !== 0 || !r.stdout) return;
  const block = r.stdout.split(/\[\/\d+\]/).find((b) => b.includes(CHROMIUM_KEYRING_LABEL));
  const secret = block?.match(/secret = (.+)/)?.[1];
  if (secret) process.env.SWEET_COOKIE_CHROME_SAFE_STORAGE_PASSWORD = secret.trim();
}
