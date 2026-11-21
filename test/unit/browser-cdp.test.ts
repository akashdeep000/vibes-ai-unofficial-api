import { EventEmitter } from "node:events";
import type { ChildProcess, spawn } from "node:child_process";
import { describe, expect, it } from "vitest";
import { loginViaBrowser, type BrowserLoginOptions } from "../../src/auth/browser-cdp.js";

/** Minimal in-memory WebSocket speaking just enough CDP for loginViaBrowser. */
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static responses: Record<string, (msg: { id: number; params?: unknown }) => unknown> = {};

  private readonly listeners = new Map<string, Array<(event: { data?: unknown }) => void>>();

  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
    setTimeout(() => this.emit("open"), 0);
  }

  addEventListener(event: string, cb: (event: { data?: unknown }) => void): void {
    const list = this.listeners.get(event) ?? [];
    list.push(cb);
    this.listeners.set(event, list);
  }

  send(data: string): void {
    const msg = JSON.parse(data) as { id: number; method: string; params?: unknown };
    const handler = FakeWebSocket.responses[msg.method];
    if (!handler) return;
    const result = handler(msg);
    if (result === undefined) return;
    if (typeof result === "object" && result !== null && "__event__" in result) {
      const ev = result as { __event__: string; sessionId?: string; params?: unknown };
      this.push({ method: ev.__event__, sessionId: ev.sessionId, params: ev.params });
      return;
    }
    this.push({ id: msg.id, result });
  }

  push(payload: unknown): void {
    this.emit("message", { data: JSON.stringify(payload) });
  }

  emit(event: string, data: { data?: unknown } = {}): void {
    for (const cb of this.listeners.get(event) ?? []) cb(data);
  }

  close(): void {}
}

function fakeSpawn(): typeof spawn {
  return (() => {
    const child = new EventEmitter() as EventEmitter & {
      stderr: EventEmitter;
      exitCode: number | null;
      killed: boolean;
      kill: (signal?: string) => boolean;
    };
    child.stderr = new EventEmitter();
    child.exitCode = null;
    child.killed = false;
    child.kill = () => ((child.killed = true), (child.exitCode = 9), true);
    setTimeout(
      () =>
        child.stderr.emit(
          "data",
          Buffer.from("DevTools listening on ws://127.0.0.1:4321/devtools/browser/FAKE\n"),
        ),
      0,
    );
    return child as unknown as ChildProcess;
  }) as unknown as typeof spawn;
}

function setup(routes: typeof FakeWebSocket.responses): BrowserLoginOptions {
  FakeWebSocket.instances = [];
  FakeWebSocket.responses = routes;
  return {
    startUrl: "https://vibes.ai/api/meta-oidc/start",
    landingUrlPrefix: "https://vibes.ai/",
    cookiesForUrl: "https://vibes.ai/",
    cookies: [{ name: "dbln", value: "v", url: "https://auth.meta.com/" }],
    binary: "fake-chromium",
    spawnProcess: fakeSpawn(),
    webSocketImpl: FakeWebSocket as unknown as NonNullable<BrowserLoginOptions["webSocketImpl"]>,
  };
}

describe("loginViaBrowser", () => {
  it("plants cookies, navigates, and harvests meta_session", async () => {
    const setCookies: unknown[] = [];
    const opts = setup({
      "Target.createTarget": () => ({ targetId: "T1" }),
      "Target.attachToTarget": () => ({ sessionId: "S1" }),
      "Network.enable": () => ({}),
      "Network.setCookies": (msg) => (setCookies.push(msg.params), {}),
      "Page.enable": () => ({}),
      "Page.navigate": () => ({
        __event__: "Page.frameNavigated",
        sessionId: "S1",
        params: { frame: { url: "https://vibes.ai/" } },
      }),
      "Network.getCookies": () => ({
        cookies: [
          { name: "cookie_ack", value: "true" },
          { name: "meta_session", value: "tok123" },
        ],
      }),
    });

    await expect(loginViaBrowser(opts)).resolves.toBe("meta_session=tok123");
    const planted = (setCookies[0] as { cookies: { name: string }[] }).cookies.map((c) => c.name);
    expect(planted).toEqual(["dbln"]);
  });

  it("times out telling the user to sign in when Meta wants interaction", async () => {
    const opts = setup({
      "Target.createTarget": () => ({ targetId: "T1" }),
      "Target.attachToTarget": () => ({ sessionId: "S1" }),
      "Network.enable": () => ({}),
      "Network.setCookies": () => ({}),
      "Page.enable": () => ({}),
      "Page.navigate": () => ({}), // never lands on vibes.ai
      "Network.getCookies": () => ({ cookies: [] }),
    });
    await expect(loginViaBrowser({ ...opts, timeoutMs: 50 })).rejects.toThrow(
      /vibes\.ai did not mint a working meta_session/,
    );
  });
});
