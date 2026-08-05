import { describe, expect, it, vi } from "vitest";
import { HttpClient, parseFirstJsonObject } from "../../src/http/http-client.js";
import { VibesHttpError, VibesParseError, VibesValidationError } from "../../src/errors.js";
import { z } from "zod";

function stubFetch(
  impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
): void {
  vi.stubGlobal("fetch", impl);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("HttpClient", () => {
  it("builds URLs from base + prefix + path + query", async () => {
    const seen: string[] = [];
    stubFetch(async (input) => {
      seen.push(String(input));
      return jsonResponse({ ok: true });
    });
    const client = new HttpClient({ session: "meta_session=abc" });
    await client.request({ method: "GET", path: "/projects", query: { limit: 5, offset: 0 } });
    expect(seen[0]).toBe("https://vibes.ai/api/projects?limit=5&offset=0");
  });

  it("drops undefined/null query params", async () => {
    const seen: string[] = [];
    stubFetch(async (input) => {
      seen.push(String(input));
      return jsonResponse({ ok: true });
    });
    const client = new HttpClient();
    await client.request({
      method: "GET",
      path: "/projects",
      query: { limit: undefined, offset: null, sort: "newest" },
    });
    expect(seen[0]).toBe("https://vibes.ai/api/projects?sort=newest");
  });

  it("sends the session cookie and JSON body", async () => {
    let headers: Headers | undefined;
    let body: string | undefined;
    stubFetch(async (_input, init) => {
      headers = new Headers(init?.headers);
      body = init?.body as string;
      return jsonResponse({ ok: true });
    });
    const client = new HttpClient({ session: "meta_session=abc; cookie_ack=true" });
    await client.request({ method: "POST", path: "/projects", json: { name: "Test" } });
    expect(headers!.get("cookie")).toBe("meta_session=abc; cookie_ack=true");
    expect(headers!.get("content-type")).toContain("application/json");
    expect(JSON.parse(body!)).toEqual({ name: "Test" });
  });

  it("supports session rotation via a function provider", async () => {
    const seen: string[] = [];
    stubFetch(async (_input, init) => {
      seen.push(new Headers(init?.headers).get("cookie") ?? "");
      return jsonResponse({ ok: true });
    });
    let session = "meta_session=one";
    const client = new HttpClient({ session: () => session });
    await client.request({ method: "GET", path: "/x" });
    session = "meta_session=two";
    await client.request({ method: "GET", path: "/x" });
    expect(seen).toEqual(["meta_session=one", "meta_session=two"]);
  });

  it("validates responses against the provided schema", async () => {
    stubFetch(async () => jsonResponse({ user: { id: "nope" } }));
    const client = new HttpClient();
    const schema = z.object({ user: z.object({ id: z.string().uuid() }) });
    await expect(client.request({ method: "GET", path: "/auth/me", schema })).rejects.toThrow(
      VibesValidationError,
    );
  });

  it("returns the parsed body when no schema is given", async () => {
    stubFetch(async () => jsonResponse({ hello: "world" }));
    const client = new HttpClient();
    await expect(client.request({ method: "GET", path: "/x" })).resolves.toEqual({
      hello: "world",
    });
  });

  it("returns raw text when requested", async () => {
    stubFetch(async () => new Response("plain", { status: 200 }));
    const client = new HttpClient();
    await expect(
      client.request<string>({ method: "GET", path: "/x", rawText: true }),
    ).resolves.toBe("plain");
  });

  it("throws VibesHttpError with parsed body on non-2xx", async () => {
    stubFetch(async () => jsonResponse({ message: "forbidden" }, 403));
    const client = new HttpClient();
    const error = await client.request({ method: "GET", path: "/x" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(VibesHttpError);
    if (error instanceof VibesHttpError) {
      expect(error.status).toBe(403);
      expect(error.body).toEqual({ message: "forbidden" });
      expect(error.url).toContain("/x");
    }
  });

  it("throws VibesParseError when a 2xx body is not JSON", async () => {
    stubFetch(async () => new Response("not json at all", { status: 200 }));
    const client = new HttpClient();
    await expect(client.request({ method: "GET", path: "/x" })).rejects.toThrow(VibesParseError);
  });

  it("retries a 503 before succeeding (integration with retry)", async () => {
    let calls = 0;
    stubFetch(async () => {
      calls += 1;
      if (calls < 3) return jsonResponse({}, 503);
      return jsonResponse({ ok: true });
    });
    const client = new HttpClient({
      retry: { maxRetries: 3, baseDelayMs: 1, maxDelayMs: 10 },
    });
    await expect(client.request({ method: "GET", path: "/x" })).resolves.toEqual({ ok: true });
    expect(calls).toBe(3);
  });
});

describe("parseFirstJsonObject", () => {
  it("parses a single object", () => {
    expect(parseFirstJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses the first object of two concatenated blobs", () => {
    expect(parseFirstJsonObject('{"a":1}{"a":1}')).toEqual({ a: 1 });
  });

  it("handles braces inside strings", () => {
    expect(parseFirstJsonObject('{"prompt":"a {b} c"}')).toEqual({ prompt: "a {b} c" });
  });

  it("handles escaped quotes inside strings", () => {
    expect(parseFirstJsonObject('{"data":"{\\"videoGenEntId\\":\\"1\\"}"}')).toEqual({
      data: '{"videoGenEntId":"1"}',
    });
  });

  it("throws VibesParseError when nothing parseable", () => {
    expect(() => parseFirstJsonObject("[]")).toThrow(VibesParseError);
    expect(() => parseFirstJsonObject("garbage")).toThrow(VibesParseError);
  });
});
