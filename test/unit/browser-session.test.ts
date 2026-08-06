import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Cookie } from "@steipete/sweet-cookie";
import { describe, expect, it, vi } from "vitest";
import { browserSession, syncSessionFromBrowser } from "../../src/auth/browser-session.js";
import { VibesAuthError } from "../../src/errors.js";
import { HttpClient } from "../../src/http/http-client.js";

type ReadCookies = NonNullable<
  Parameters<typeof syncSessionFromBrowser>[0] extends { readCookies?: infer R } | undefined
    ? R
    : never
>;

function fakeReadCookies(impl: (opts: Parameters<ReadCookies>[0]) => Cookie[]): ReadCookies {
  return vi.fn(async (opts) => ({
    cookies: impl(opts),
    warnings: [],
  }));
}

const session = (value: string): Cookie => ({ name: "meta_session", value });
const ack = (value = "true"): Cookie => ({ name: "cookie_ack", value });

describe("syncSessionFromBrowser", () => {
  it("returns the cookie header for meta_session + cookie_ack", async () => {
    const read = fakeReadCookies(() => [session("abc"), ack()]);
    const header = await syncSessionFromBrowser({
      browser: "chrome",
      readCookies: read,
      throttleMs: 0,
    });
    expect(header).toBe("meta_session=abc; cookie_ack=true");
  });

  it("treats an empty meta_session as missing and throws", async () => {
    const read = fakeReadCookies(() => [session(""), ack()]);
    await expect(
      syncSessionFromBrowser({ browser: "chrome", readCookies: read, throttleMs: 0 }),
    ).rejects.toThrow(VibesAuthError);
  });

  it("auto-detects: falls through to the next browser when the first lacks the session", async () => {
    const read = fakeReadCookies((opts) =>
      opts.browsers[0] === "chrome" ? [ack()] : [session("edge-session")],
    );
    const header = await syncSessionFromBrowser({ readCookies: read, throttleMs: 0 });
    expect(header).toBe("meta_session=edge-session");
    // chrome-family candidates (chrome/chromium/brave, chrome backend) miss,
    // then edge wins; candidates whose DB is missing are skipped without a call
    const calls = (read as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(calls[calls.length - 1]![0].browsers).toEqual(["edge"]);
  });

  it("explicit chromium resolves through the chrome backend at its profile DB", async () => {
    const read = fakeReadCookies(() => [session("abc")]);
    const header = await syncSessionFromBrowser({ browser: "chromium", readCookies: read });
    expect(header).toBe("meta_session=abc");
    const call = (read as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(call.browsers).toEqual(["chrome"]);
    expect(call.chromeProfile).toContain("chromium");
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("explicit helium resolves through the chrome backend at its profile DB", async () => {
    const read = fakeReadCookies(() => [session("abc")]);
    const header = await syncSessionFromBrowser({ browser: "helium", readCookies: read });
    expect(header).toBe("meta_session=abc");
    const call = (read as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(call.browsers).toEqual(["chrome"]);
    expect(call.chromeProfile).toContain("helium");
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("throws VibesAuthError when no browser has the session", async () => {
    const read = fakeReadCookies(() => [ack()]);
    await expect(syncSessionFromBrowser({ readCookies: read, throttleMs: 0 })).rejects.toThrow(
      VibesAuthError,
    );
  });

  it("explicit browser never falls back", async () => {
    const read = fakeReadCookies(() => [ack()]);
    await expect(
      syncSessionFromBrowser({ browser: "firefox", readCookies: read, throttleMs: 0 }),
    ).rejects.toThrow(VibesAuthError);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("passes the profile dir as chromeProfile", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vibes-session-"));
    mkdirSync(join(dir, "Default"), { recursive: true });
    writeFileSync(join(dir, "Default", "Cookies"), "");
    const read = fakeReadCookies(() => [session("abc")]);
    const header = await syncSessionFromBrowser({ profileDir: dir, readCookies: read });
    expect(header).toBe("meta_session=abc");
    expect((read as ReturnType<typeof vi.fn>).mock.calls[0]![0].chromeProfile).toBe(
      join(dir, "Default", "Cookies"),
    );
  });

  it("throws when the profile dir has no cookie database", async () => {
    const read = fakeReadCookies(() => [session("abc")]);
    await expect(
      syncSessionFromBrowser({ profileDir: "/nonexistent", readCookies: read }),
    ).rejects.toThrow(/No cookie database/);
    expect(read).not.toHaveBeenCalled();
  });
});

describe("browserSession", () => {
  it("serves the cached header within the throttle window", async () => {
    const read = fakeReadCookies(() => [session("abc")]);
    const provider = browserSession({ readCookies: read, throttleMs: 60_000 });
    expect(await provider()).toBe("meta_session=abc");
    expect(await provider()).toBe("meta_session=abc");
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("re-syncs after the throttle window expires", async () => {
    const read = fakeReadCookies(() => [session("abc")]);
    const provider = browserSession({ readCookies: read, throttleMs: 10 });
    expect(await provider()).toBe("meta_session=abc");
    await new Promise((r) => setTimeout(r, 30));
    expect(await provider()).toBe("meta_session=abc");
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("propagates sync failures to the caller", async () => {
    const read = fakeReadCookies(() => []);
    const provider = browserSession({ readCookies: read, throttleMs: 0 });
    await expect(provider()).rejects.toThrow(VibesAuthError);
  });

  it("env cookie wins over the browser chain (server path)", async () => {
    const read = fakeReadCookies(() => [session("browser")]);
    const provider = browserSession({
      sessionFromEnv: "meta_session=env; cookie_ack=true",
      readCookies: read,
    });
    expect(await provider()).toBe("meta_session=env; cookie_ack=true");
    expect(await provider()).toBe("meta_session=env; cookie_ack=true");
    expect(read).not.toHaveBeenCalled();
  });

  it("falls through to the browser chain when no env cookie is set", async () => {
    const read = fakeReadCookies(() => [session("browser")]);
    const provider = browserSession({ sessionFromEnv: "", readCookies: read });
    expect(await provider()).toBe("meta_session=browser");
    expect(read).toHaveBeenCalledTimes(1);
  });
});

describe("HttpClient with an async session provider", () => {
  it("awaits the provider and sends the cookie header", async () => {
    const read = fakeReadCookies(() => [session("abc"), ack()]);
    let cookie: string | null = null;
    vi.stubGlobal("fetch", async (_input: RequestInfo | URL, init?: RequestInit) => {
      cookie = new Headers(init?.headers).get("cookie");
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    const client = new HttpClient({ session: browserSession({ readCookies: read }) });
    await client.request({ method: "GET", path: "/x" });
    expect(cookie).toBe("meta_session=abc; cookie_ack=true");
  });
});
