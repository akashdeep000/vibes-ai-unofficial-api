/**
 * Shared test helpers: a tiny route-based fetch mock and fixture loading.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { vi } from "vitest";

export interface FixtureFile {
  source: string;
  requests: Array<{ method: string; url: string; body?: unknown }>;
  responses: unknown[];
}

/** Loads every extracted fixture into a map keyed by source file name. */
export function loadFixtures(): Map<string, FixtureFile> {
  const dir = join(import.meta.dirname, "fixtures");
  const fixtures = new Map<string, FixtureFile>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const fixture = JSON.parse(readFileSync(join(dir, file), "utf8")) as FixtureFile;
    fixtures.set(file, fixture);
  }
  return fixtures;
}

export const FIXTURES = loadFixtures();

export interface MockRequest {
  method: string;
  pathname: string;
  url: URL;
  bodyText: string | null;
  jsonBody: unknown;
  headers: Headers;
}

export type MockHandler = (req: MockRequest) => Response | Promise<Response>;

export class MockServer {
  private readonly routes = new Map<string, MockHandler[]>();
  readonly calls: Array<{ method: string; pathname: string; bodyText: string | null }> = [];

  /** Registers a handler for `METHOD /path`; the path may be a regex. */
  on(method: string, path: string | RegExp, handler: MockHandler): void {
    const key = `${method.toUpperCase()} ${path instanceof RegExp ? path.source : path}`;
    const list = this.routes.get(key) ?? [];
    list.push(handler);
    this.routes.set(key, list);
  }

  /** Registers a handler that serves the given JSON body. */
  json(method: string, path: string | RegExp, body: unknown, status = 200): void {
    this.on(
      method,
      path,
      () =>
        new Response(JSON.stringify(body), {
          status,
          headers: { "content-type": "application/json" },
        }),
    );
  }

  /** Installs this server as the global fetch implementation. */
  install(): void {
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
      this.dispatch(input, init),
    );
  }

  uninstall(): void {
    vi.unstubAllGlobals();
  }

  /** Resets recorded calls (routes are preserved). */
  reset(): void {
    this.calls.length = 0;
  }

  private async dispatch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url =
      typeof input === "string"
        ? new URL(input)
        : input instanceof URL
          ? input
          : new URL(input.url);
    const method = (
      init?.method ?? (typeof input === "object" && "method" in input ? input.method : "GET")
    ).toUpperCase();
    const bodyText =
      typeof init?.body === "string"
        ? init.body
        : init?.body instanceof FormData
          ? "[form-data]"
          : null;
    const jsonBody = typeof init?.body === "string" ? safeParse(init.body) : undefined;

    this.calls.push({ method, pathname: url.pathname, bodyText });

    for (const [key, handlers] of this.routes) {
      const [routeMethod, routePath] = key.split(" ");
      if (routeMethod !== method) continue;
      const matches = routePath!.startsWith("/")
        ? routePath === url.pathname
        : new RegExp(routePath!).test(url.pathname);
      if (!matches) continue;
      for (const handler of handlers) {
        const response = await handler({
          method,
          pathname: url.pathname,
          url,
          bodyText,
          jsonBody,
          headers: new Headers(init?.headers),
        });
        if (response !== undefined) return response;
      }
    }

    return new Response(JSON.stringify({ error: `No mock for ${method} ${url.pathname}` }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
}

/** Creates a fresh MockServer with fetch stubbed. */
export function installMockServer(): MockServer {
  const server = new MockServer();
  server.install();
  return server;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** A tiny valid 1x1 red PNG. */
export function tinyPng(): Buffer {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
}

/** Generates a solid-color PNG of the given pixel dimensions. */
export function solidPng(
  width: number,
  height: number,
  color: [number, number, number] = [128, 128, 128],
): Buffer {
  const crcTable = new Int32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
  });
  const crc32 = (buf: Buffer): number => {
    let c = 0xffffffff;
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff]! ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer): Buffer => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData));
    return Buffer.concat([len, typeAndData, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  const row = Buffer.alloc(1 + width * 3, 0);
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = color[0];
    row[1 + x * 3 + 1] = color[1];
    row[1 + x * 3 + 2] = color[2];
  }
  const idat = deflateSync(Buffer.concat(Array.from({ length: height }, () => row)));

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
