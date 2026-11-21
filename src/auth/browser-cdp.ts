import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VibesAuthError } from "../errors.js";

/**
 * Headless-Chromium login via the raw DevTools Protocol (CDP) — zero
 * dependencies; rides Node's native `WebSocket` (Node 22+).
 *
 * Why a real browser when the flow is "just" four redirects? Meta's edge
 * rejects non-Chrome TLS/HTTP-2 fingerprints at `auth.meta.com/oidc`
 * (curl and node fetch both get a canned 400 even with valid cookies), so the
 * redirect dance runs inside a headless Chromium instance instead.
 *
 * Lifecycle: launch with a throwaway profile → plant the Meta cookies read by
 * `browser-session.ts` → navigate the OIDC start URL → once the final page
 * loads, take `meta_session` from the jar → close the browser.
 */

export interface PlantedCookie {
  name: string;
  value: string;
  /** Origin the cookie is planted for, e.g. "https://auth.meta.com/". */
  url: string;
}

export interface BrowserLoginOptions {
  /** URL that kicks the flow off (vibes.ai `/api/meta-oidc/start`). */
  startUrl: string;
  /** Navigation is done once the top frame URL starts with this prefix. */
  landingUrlPrefix: string;
  /** Origin whose `meta_session` is harvested after landing. */
  cookiesForUrl: string;
  /** Meta account cookies planted before the first navigation. */
  cookies: PlantedCookie[];
  /** Chromium binary (default: `$VIBES_BROWSER_BINARY` or PATH autodetect). */
  binary?: string;
  /** Overall timeout (default 90s). */
  timeoutMs?: number;
  /**
   * Validates a harvested `meta_session=…` cookie before accepting it.
   *
   * The jar can hold a transient token for a few hundred ms after landing
   * (the web app re-anchors the session client-side), so each candidate is
   * validated — the first one the platform itself accepts wins.
   */
  validateCookie?: (cookie: string) => Promise<boolean>;
  /** Test seams: alternative process and WebSocket factories. */
  spawnProcess?: typeof spawn;
  webSocketImpl?: WebSocketCtor;
}

/** Structural subset of a WebSocket (Node's native or a test fake). */
interface WebSocketLike {
  addEventListener(event: "open" | "message" | "error" | "close", cb: (event: never) => void): void;
  send(data: string): void;
  close(): void;
}
type WebSocketCtor = new (url: string) => WebSocketLike;

const DEFAULT_TIMEOUT_MS = 90_000;
const CHROMIUM_BINARIES = [
  "chromium",
  "google-chrome",
  "google-chrome-stable",
  "brave-browser",
  "brave",
  "helium-browser",
  "helium",
  "microsoft-edge",
] as const;

/** Mint `meta_session` by replaying the OIDC flow in headless Chromium. */
export async function loginViaBrowser(opts: BrowserLoginOptions): Promise<string> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const binary = opts.binary ?? process.env.VIBES_BROWSER_BINARY ?? findChromiumBinary();
  if (!binary) {
    throw new VibesAuthError(
      "Auto-login needs a Chromium-family browser binary. Install one, " +
        "set VIBES_BROWSER_BINARY, or set VIBES_SESSION_COOKIE directly.",
    );
  }

  const deadline = Date.now() + timeoutMs;
  const profile = mkdtempSync(join(tmpdir(), "vibes-login-"));
  let proc: ChildProcess | undefined;
  let cdp: Cdp | undefined;
  try {
    proc = (opts.spawnProcess ?? spawn)(
      binary,
      [
        "--headless=new",
        `--user-data-dir=${profile}`,
        "--remote-debugging-port=0",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-gpu",
        "--mute-audio",
        "about:blank",
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    const wsUrl = await devToolsUrl(proc, timeoutMs);
    cdp = await Cdp.connect(wsUrl, opts.webSocketImpl ?? (WebSocket as unknown as WebSocketCtor));

    const { targetId } = await cdp.send<{ targetId: string }>("Target.createTarget", {
      url: "about:blank",
    });
    const { sessionId } = await cdp.send<{ sessionId: string }>("Target.attachToTarget", {
      targetId,
      flatten: true,
    });
    const page = <T>(method: string, params?: object) => cdp!.send<T>(method, params, sessionId);

    await page("Network.enable");
    if (opts.cookies.length > 0) await page("Network.setCookies", { cookies: opts.cookies });
    await page("Page.enable");

    interface FrameNavigated {
      frame?: { url?: string; parentId?: string };
    }
    const landed = cdp.waitEvent<FrameNavigated>(
      "Page.frameNavigated",
      sessionId,
      (p) =>
        p.frame?.parentId === undefined && (p.frame?.url ?? "").startsWith(opts.landingUrlPrefix),
    );
    // the outcome is observed via events, not this response — swallow rejections
    void page("Page.navigate", { url: opts.startUrl }).catch(() => {});
    if (!(await Promise.race([landed.then(() => true), timeoutAt(deadline)]))) {
      throw new VibesAuthError(
        "Meta asked for interaction instead of bouncing back to vibes.ai. " +
          "Sign in to vibes.ai in your browser once to (re)link the Meta account.",
      );
    }

    // The jar may briefly hold a transient meta_session; poll until a
    // candidate validates (or appears, when no validator is given).
    for (;;) {
      const { cookies } = await page<{ cookies: { name: string; value: string }[] }>(
        "Network.getCookies",
        { urls: [opts.cookiesForUrl] },
      );
      const candidates = cookies
        .filter((c) => c.name === "meta_session" && c.value.length > 0)
        .map((c) => `${c.name}=${c.value}`)
        .reverse();
      for (const candidate of candidates) {
        if (!opts.validateCookie || (await opts.validateCookie(candidate))) return candidate;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new VibesAuthError("vibes.ai did not mint a working meta_session (API drift?).");
      }
      await wait(Math.min(400, remaining));
    }
  } finally {
    cdp?.close();
    if (proc && proc.exitCode === null && !proc.killed) proc.kill("SIGKILL");
    rmSync(profile, { recursive: true, force: true });
  }
}

/** `--headless=new` prints the ws endpoint on stderr. */
function devToolsUrl(proc: ChildProcess, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(
      () => reject(new VibesAuthError("Browser did not expose DevTools in time.")),
      timeoutMs,
    );
    proc.stderr!.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]!);
      }
    });
    proc.on("exit", (code) => {
      clearTimeout(timer);
      reject(new VibesAuthError(`Browser exited early (code ${code}) before login completed.`));
    });
    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(new VibesAuthError(`Failed to launch browser: ${err.message}`));
    });
  });
}

/** Races `deadline` (ms since epoch) — rejects once the deadline passes. */
function timeoutAt(deadline: number): Promise<boolean> {
  return new Promise((resolve) => {
    const ms = deadline - Date.now();
    if (ms <= 0) return resolve(false);
    setTimeout(() => resolve(true), ms);
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findChromiumBinary(): string | undefined {
  for (const name of CHROMIUM_BINARIES) {
    const probe = spawnSync("which", [name], { encoding: "utf8" });
    if (probe.status === 0 && probe.stdout.trim()) return probe.stdout.trim().split("\n")[0]!;
  }
  return undefined;
}

/* --------------------------- minimal CDP client -------------------------- */

interface CdpMessage {
  id?: number;
  result?: unknown;
  error?: { message?: string };
  method?: string;
  params?: unknown;
  sessionId?: string;
}

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

interface EventWaiter<T> {
  method: string;
  sessionId: string;
  match: (params: T) => boolean;
  resolve: (params: T) => void;
  reject: (error: Error) => void;
}

class Cdp {
  readonly #ws: WebSocketLike;
  readonly #pending = new Map<number, PendingCall>();
  readonly #waiters = new Set<EventWaiter<never>>();
  #nextId = 1;

  private constructor(ws: WebSocketLike) {
    this.#ws = ws;
    ws.addEventListener("message", (event) => this.#onMessage(event));
    const drop = () => this.#fatal(new VibesAuthError("CDP socket closed"));
    ws.addEventListener("error", drop);
    ws.addEventListener("close", drop);
  }

  static connect(url: string, ctor: WebSocketCtor): Promise<Cdp> {
    return new Promise((resolve, reject) => {
      const ws = new ctor(url);
      const cdp = new Cdp(ws);
      ws.addEventListener("open", () => resolve(cdp));
      ws.addEventListener("error", () =>
        reject(new VibesAuthError(`Cannot reach browser CDP at ${url}`)),
      );
    });
  }

  send<T = unknown>(method: string, params?: object, sessionId?: string): Promise<T> {
    const id = this.#nextId++;
    const message = {
      id,
      method,
      ...(params ? { params } : {}),
      ...(sessionId ? { sessionId } : {}),
    };
    return new Promise<T>((resolve, reject) => {
      this.#pending.set(id, {
        resolve: (v) => resolve(v as T),
        reject,
      });
      this.#ws.send(JSON.stringify(message));
    });
  }

  waitEvent<T>(method: string, sessionId: string, match: (params: T) => boolean): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const waiter: EventWaiter<T> = { method, sessionId, match, resolve, reject };
      this.#waiters.add(waiter as EventWaiter<never>);
    });
  }

  close(): void {
    this.#fatal(new VibesAuthError("CDP client closed"));
    try {
      this.#ws.close();
    } catch {
      // already closed
    }
  }

  #onMessage(event: unknown): void {
    const data = JSON.parse(String((event as { data: unknown }).data)) as CdpMessage;
    if (data.id !== undefined) {
      const entry = this.#pending.get(data.id);
      if (!entry) return;
      this.#pending.delete(data.id);
      if (data.error) {
        entry.reject(new VibesAuthError(`CDP ${data.error.message ?? "error"}`));
      } else {
        entry.resolve(data.result);
      }
      return;
    }
    if (data.method) {
      for (const waiter of this.#waiters) {
        const w = waiter as EventWaiter<unknown>;
        if (w.method === data.method && w.sessionId === data.sessionId && w.match(data.params)) {
          this.#waiters.delete(waiter);
          w.resolve(data.params);
        }
      }
    }
    return;
  }

  #fatal(error: Error): void {
    for (const entry of this.#pending.values()) entry.reject(error);
    this.#pending.clear();
    for (const waiter of this.#waiters) waiter.reject(error);
    this.#waiters.clear();
  }
}
