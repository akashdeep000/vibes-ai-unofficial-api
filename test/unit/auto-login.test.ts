import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Cookie } from "@steipete/sweet-cookie";
import { describe, expect, it, vi } from "vitest";
import { autoSession, login, type AutoSessionOptions } from "../../src/auth/auto-login.js";
import type { BrowserSessionConfig } from "../../src/auth/browser-session.js";
import { VibesAuthError, VibesHttpError } from "../../src/errors.js";
import { HttpClient } from "../../src/http/http-client.js";
import { FIXTURES, installMockServer } from "../helpers.js";

type ReadCookies = NonNullable<BrowserSessionConfig["readCookies"]>;

function fakeMetaCookies(cookies: Cookie[]): ReadCookies {
  return async (opts) => ({
    cookies: cookies.filter((c) => opts.names.includes(c.name)),
    warnings: [],
  });
}

const metaCookies: Cookie[] = [
  { name: "dbln", value: "dbln-val" },
  { name: "fs", value: "fs-val" },
  { name: "datr", value: "datr-val" },
];

const meJson = () =>
  new Response(JSON.stringify(FIXTURES.get("me.json")!.responses[0]), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

/** Options that make login() fully offline: fake browser cookies + fake CDP login. */
function offlineOpts(extra: Partial<AutoSessionOptions> = {}): AutoSessionOptions {
  installMockServer().json("GET", "/api/auth/me", FIXTURES.get("me.json")!.responses[0]);
  return {
    readCookies: fakeMetaCookies(metaCookies),
    loginBrowser: async () => "meta_session=fresh-token",
    ...extra,
  };
}

describe("login", () => {
  it("plants the Meta cookies into the login browser and validates the minted session", async () => {
    const planted: unknown[] = [];
    const result = await login(
      offlineOpts({
        loginBrowser: async (req) => {
          planted.push(...req.cookies.map((c) => `${c.name}@${c.url}`));
          expect(req.startUrl).toBe("https://vibes.ai/api/meta-oidc/start");
          return "meta_session=fresh-token";
        },
      }),
    );
    expect(planted).toContain("dbln@https://auth.meta.com/");
    expect(result.cookie).toBe("meta_session=fresh-token; cookie_ack=true");
    expect(result.user.username).toBe("akashdeep.das.9843");
  });

  it("fails clearly when the browser has no Meta account session", async () => {
    await expect(login(offlineOpts({ readCookies: fakeMetaCookies([]) }))).rejects.toBeInstanceOf(
      VibesAuthError,
    );
  });

  it("propagates browser-reported interaction requirements", async () => {
    await expect(
      login(
        offlineOpts({
          loginBrowser: async () => {
            throw new VibesAuthError("Meta asked for interaction");
          },
        }),
      ),
    ).rejects.toThrow(/Meta asked for interaction/);
  });
});

describe("autoSession", () => {
  const tmpfile = () => join(mkdtempSync(join(tmpdir(), "vibes-")), "session.json");

  it("env cookie wins and never touches the network or disk", async () => {
    const loginBrowser = vi.fn(async () => "meta_session=fresh-token");
    const provider = autoSession(
      offlineOpts({ sessionFromEnv: "meta_session=env", sessionFile: tmpfile(), loginBrowser }),
    );
    expect(await provider()).toBe("meta_session=env");
    expect(loginBrowser).not.toHaveBeenCalled();
    await expect(provider.refresh()).rejects.toThrow(VibesAuthError);
  });

  it("logins once, caches the session, and reuses it across providers", async () => {
    const server = installMockServer();
    server.json("GET", "/api/auth/me", FIXTURES.get("me.json")!.responses[0]);
    const file = tmpfile();
    const opts: AutoSessionOptions = {
      readCookies: fakeMetaCookies(metaCookies),
      loginBrowser: async () => "meta_session=fresh-token",
      sessionFile: file,
    };

    expect(await autoSession(opts)()).toContain("meta_session=fresh-token");
    expect(JSON.parse(readFileSync(file, "utf8")).cookie).toContain("fresh-token");

    // fresh provider, same file: validated via /auth/me, no new login
    server.reset();
    expect(await autoSession(opts)()).toContain("meta_session=fresh-token");
    expect(server.calls.map((c) => c.pathname)).toEqual(["/api/auth/me"]);
  });

  it("re-logins when the cached session is rejected", async () => {
    const file = tmpfile();
    writeFileSync(file, JSON.stringify({ cookie: "meta_session=stale" }));
    // the cached cookie is dead (401) but the login still works
    let meCalls = 0;
    installMockServer().on("GET", "/api/auth/me", () =>
      meCalls++ === 0 ? new Response("{}", { status: 401 }) : meJson(),
    );
    const provider = autoSession({
      readCookies: fakeMetaCookies(metaCookies),
      loginBrowser: async () => "meta_session=fresh-token",
      sessionFile: file,
    });
    expect(await provider()).toContain("meta_session=fresh-token");
    expect(JSON.parse(readFileSync(file, "utf8")).cookie).toContain("fresh-token");
  });
});

describe("HttpClient self-heal on 401", () => {
  it("refreshes the session once and retries", async () => {
    const seen: string[] = [];
    vi.stubGlobal("fetch", async (_input: RequestInfo | URL, init?: RequestInit) => {
      const cookie = new Headers(init?.headers).get("cookie") ?? "";
      seen.push(cookie);
      return cookie === "meta_session=fresh"
        ? new Response(JSON.stringify({ ok: true }), { status: 200 })
        : new Response(JSON.stringify({ error: "expired" }), { status: 401 });
    });
    let cookie = "meta_session=stale";
    const provider = Object.assign(async () => cookie, {
      refresh: async () => (cookie = "meta_session=fresh"),
    });
    const client = new HttpClient({ session: provider });
    await client.request({ method: "GET", path: "/x" });
    expect(seen).toEqual(["meta_session=stale", "meta_session=fresh"]);
  });

  it("does not loop when the refreshed session is still rejected", async () => {
    vi.stubGlobal("fetch", async () => new Response("{}", { status: 401 }));
    const refresh = vi.fn(async () => "meta_session=fresh");
    const client = new HttpClient({
      session: Object.assign(async () => "meta_session=stale", { refresh }),
    });
    await expect(client.request({ method: "GET", path: "/x" })).rejects.toThrow(VibesHttpError);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
