/**
 * Integration tests for the SSE batch stream: `GET
 * /api/generation-batches/:batchId/stream` surfaces item progress as
 * `data:` frames; `BatchesResource.stream` must parse frames that arrive
 * split across arbitrary network chunks.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { BatchStreamEventSchema, VibesClient, VibesHttpError } from "../../src/index.js";
import { FIXTURES, installMockServer } from "../helpers.js";

const BATCH_ID = "batch-019fcec1-8e34-7944-ab8f-32aa099bd04a";

function sseResponse(frames: Array<Uint8Array | string>, status = 200): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const frame of frames) {
        controller.enqueue(typeof frame === "string" ? new TextEncoder().encode(frame) : frame);
      }
      controller.close();
    },
  });
  return new Response(body, {
    status,
    headers: { "content-type": "text/event-stream" },
  });
}

const EVENTS = FIXTURES.get("stream.json")!.responses;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("batches.stream", () => {
  it("parses SSE events split across arbitrary chunk boundaries, in order", async () => {
    const server = installMockServer();
    const sse = EVENTS.map((event) => `retry: 15000\n\ndata: ${JSON.stringify(event)}\n\n`).join(
      "",
    );
    const encoder = new TextEncoder();
    const splitPoints = [7, 53, 291, sse.length - 42];
    const bytes = encoder.encode(sse);
    const frames: Uint8Array[] = [];
    let start = 0;
    for (const point of splitPoints.sort((a, b) => a - b)) {
      frames.push(bytes.subarray(start, point));
      start = point;
    }
    frames.push(bytes.subarray(start));

    server.on("GET", /\/api\/generation-batches\/[^/]+\/stream/, () => sseResponse(frames));

    const client = new VibesClient();
    const received: unknown[] = [];
    await client.batches.stream(BATCH_ID, {
      onEvent: (event) => {
        received.push(event);
      },
    });

    expect(received.length).toBe(EVENTS.length);
    for (const [idx, event] of received.entries()) {
      expect(BatchStreamEventSchema.safeParse(event).success).toBe(true);
      expect(event).toEqual(EVENTS[idx]);
    }
    expect((received.at(-1) as { isComplete: boolean }).isComplete).toBe(true);
  });

  it("accepts single events that share one frame", async () => {
    const server = installMockServer();
    const joined = EVENTS.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
    server.on("GET", /\/api\/generation-batches\/[^/]+\/stream/, () => sseResponse([joined]));

    const client = new VibesClient();
    const received: unknown[] = [];
    await client.batches.stream(BATCH_ID, {
      onEvent: (event) => {
        received.push(event);
      },
    });

    expect(received.length).toBe(EVENTS.length);
  });

  it("ignores non-data SSE lines (comments, retry, blank)", async () => {
    const server = installMockServer();
    const sse = `: ping\n\nretry: 15000\n\ndata: ${JSON.stringify(EVENTS[0])}\n\n`;
    server.on("GET", /\/api\/generation-batches\/[^/]+\/stream/, () => sseResponse([sse]));

    const client = new VibesClient();
    const received: unknown[] = [];
    await client.batches.stream(BATCH_ID, {
      onEvent: (event) => {
        received.push(event);
      },
    });

    expect(received).toEqual([EVENTS[0]]);
  });

  it("forwards non-2xx statuses as http errors", async () => {
    const server = installMockServer();
    server.on("GET", /\/api\/generation-batches\/[^/]+\/stream/, () => sseResponse([], 401));

    const client = new VibesClient();
    await expect(client.batches.stream(BATCH_ID)).rejects.toThrow(VibesHttpError);
    expect(server.calls.some((c) => c.pathname.includes("/stream"))).toBe(true);
  });

  it("resolves immediately when the stream closes without events", async () => {
    const server = installMockServer();
    server.on("GET", /\/api\/generation-batches\/[^/]+\/stream/, () => sseResponse([""]));

    const client = new VibesClient();
    await expect(client.batches.stream(BATCH_ID)).resolves.toBeUndefined();
  });
});
