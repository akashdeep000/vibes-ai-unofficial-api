/**
 * Integration tests: full generate -> register -> poll -> finalize (PUT)
 * flows against a mocked fetch that reproduces the wire format captured in
 * the browser traces.
 */
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EXTEND_VIDEO_DURATION_INCREMENT_S,
  GENERATED_VIDEO_DURATION_S,
  T2VGenerateRequestSchema,
  VibesClient,
  type T2VGenerateRequest,
} from "../../src/index.js";
import { contentItemId } from "../../src/ids.js";
import { installMockServer, FIXTURES } from "../helpers.js";

const PROJECT_ID = "7a0f777a-d069-4b4b-8aa2-7560fe351c4b";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("videos.generateAndWait (t2v)", () => {
  it("submits the exact wire format, polls /generation-batches and PUTs the result", async () => {
    const server = installMockServer();
    const generateFixture = FIXTURES.get("generate-videos.json")!.responses[0];

    let captured: T2VGenerateRequest | undefined;
    let capturedBatchId = "";
    let getPolls = 0;
    const puts: unknown[] = [];

    server.on("POST", "/api/generate/videos", (req) => {
      captured = req.jsonBody as T2VGenerateRequest;
      expect(T2VGenerateRequestSchema.safeParse(captured).success).toBe(true);
      return jsonResponse({
        ...(generateFixture as Record<string, unknown>),
        batchId: captured.batchId,
      });
    });
    server.on("POST", "/api/generation-batches", (req) => {
      capturedBatchId = (req.jsonBody as { id: string }).id;
      return jsonResponse({ batch: null, id: capturedBatchId });
    });
    server.on("GET", /generation-batches\/[^/]+$/, () => {
      getPolls += 1;
      // First poll: pending. Subsequent polls: complete.
      const done = getPolls > 1;
      return jsonResponse({
        batch: fullBatch(captured!.batchId, {
          items: captured!.inputs.map((_, i) =>
            contentItem(captured!.batchId, i, {
              videoUrl: done ? `https://vibes.ai/cdn/out-${i}.mp4` : null,
              done,
            }),
          ),
          isComplete: done,
        }),
      });
    });
    server.on("PUT", "/api/generation-batches", (req) => {
      puts.push(req.jsonBody);
      return jsonResponse({ batch: fullBatch(captured!.batchId, {}) });
    });

    const client = new VibesClient();
    const result = await client.videos.generateAndWait(
      {
        projectId: PROJECT_ID,
        prompt: "a river at dawn",
        startFrame: {
          imageUrl: "https://vibes.ai/cdn/start.png",
          imageEntId: "1166369879902864",
          dimensions: { width: 1280, height: 720 },
          contentItemId: "some-uploaded-item",
        },
        variations: 2,
      },
      { timeoutMs: 1_000, intervalMs: 5 },
    );

    // Wire-format assertions: the request matches the captured trace shape.
    const body = captured!;
    expect(body.inputs).toHaveLength(2);
    for (const input of body.inputs) {
      expect(input.type).toBe("image");
      if (input.type !== "image") {
        throw new Error(`unexpected input type: ${input.type}`);
      }
      expect(input.config.aspectRatio).toBe("16:9");
      expect(input.config.directGeneration).toBe(true);
      expect(input.config.directPromptImageHandle).toEqual({
        image_url: "https://vibes.ai/cdn/start.png",
        image_ent_id: "1166369879902864",
        source: "asset",
      });
      expect(input.config.sourceContentItemIds).toEqual([
        { id: "some-uploaded-item", source: "start_frame" },
      ]);
    }
    expect(body.batchId).toMatch(/^batch-/);
    expect(body.mg_request_id).toMatch(/^www-/);
    expect(body.projectId).toBe(PROJECT_ID);

    // The skeleton is registered *before* the generation is submitted: a
    // generation for an unregistered batch ends up detached (epoch-suffixed
    // media + "pending" timeline item), which is what the browser avoids.
    const callOrder = server.calls.map((c) => c.pathname);
    expect(callOrder.indexOf("/api/generation-batches")).toBeLessThan(
      callOrder.indexOf("/api/generate/videos"),
    );

    // The skeleton registered for tracking carries projectId + models and
    // one content slot per variation.
    const skeleton = JSON.parse(
      server.calls.find((c) => c.pathname === "/api/generation-batches")!.bodyText!,
    ) as { content: unknown[]; projectId: string; promptModel: string };
    expect(skeleton.content).toHaveLength(2);
    expect(skeleton.projectId).toBe(PROJECT_ID);
    expect(skeleton.promptModel).toBeTruthy();

    expect(getPolls).toBeGreaterThan(1);
    expect(result.batch.isComplete).toBe(true);

    // The final PUT finalized the batch with the finished video items.
    expect(puts.length).toBe(1);
    const putPayload = puts[0] as {
      isComplete: boolean;
      content: Array<{ videoUrl: string | null }>;
    };
    expect(putPayload.isComplete).toBe(true);
    expect(putPayload.content.some((c) => c.videoUrl !== null)).toBe(true);

    expect(result.videos.length).toBeGreaterThan(0);
    for (const video of result.videos) {
      expect(video.videoUrl).toBeTruthy();
      expect(video.error).toBeNull();
    }
  });

  it("finalizes from the SSE stream when poll.stream is set", async () => {
    const server = installMockServer();
    const generateFixture = FIXTURES.get("generate-videos.json")!.responses[0];

    let capturedBatchId = "";
    const streamCalls: string[] = [];
    const puts: unknown[] = [];

    const sseEvents = (batchId: string): string => {
      const base = contentItemId(batchId, 0);
      const slot = (
        id: string,
        opts: { isLoading: boolean; videoUrl?: string | null; data?: unknown },
      ) => ({
        id,
        imageUrl: null,
        imageHandle: null,
        videoHandle: null,
        error: null,
        ...opts,
      });
      const placeholder = slot(base, {
        isLoading: true,
        videoUrl: null,
        data: null,
      });
      const resolved = slot(`${base}-1785882833768`, {
        isLoading: false,
        videoUrl: "https://vibes.ai/cdn/s1.mp4",
        data: { videoGenEntId: "ent-1" },
      });
      return [
        `retry: 15000\n\ndata: ${JSON.stringify({ success: true, isComplete: false, items: [placeholder] })}\n\n`,
        `retry: 15000\n\ndata: ${JSON.stringify({ success: true, isComplete: false, items: [placeholder, resolved] })}\n\n`,
        `data: ${JSON.stringify({ success: true, isComplete: true, items: [placeholder, resolved] })}\n\n`,
      ].join("");
    };

    server.on("POST", "/api/generate/videos", (req) => {
      const body = req.jsonBody as { batchId: string };
      capturedBatchId = body.batchId;
      return jsonResponse({
        ...(generateFixture as Record<string, unknown>),
        batchId: body.batchId,
      });
    });
    server.on("POST", "/api/generation-batches", (req) =>
      jsonResponse({ batch: null, id: (req.jsonBody as { id: string }).id }),
    );
    server.on("GET", /generation-batches\/[^/]+\/stream/, (req) => {
      streamCalls.push(req.pathname);
      return new Response(sseEvents(capturedBatchId), {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      });
    });
    server.on("PUT", "/api/generation-batches", (req) => {
      puts.push(req.jsonBody);
      return jsonResponse({ batch: fullBatch(capturedBatchId, {}) });
    });
    server.on("GET", /generation-batches\/[^/]+$/, () =>
      jsonResponse({
        batch: fullBatch(capturedBatchId, {
          isComplete: true,
          items: [
            contentItem(capturedBatchId, 0, {
              videoUrl: "https://vibes.ai/cdn/s1.mp4",
              done: true,
            }),
          ],
        }),
      }),
    );

    const client = new VibesClient();
    const result = await client.videos.generateAndWait(
      {
        projectId: PROJECT_ID,
        prompt: "a river at dawn",
        startFrame: {
          imageUrl: "https://vibes.ai/cdn/start.png",
          imageEntId: "1166369879902864",
        },
        variations: 1,
      },
      { timeoutMs: 2_000, stream: true, intervalMs: 5 },
    );

    // The stream was consumed and the batch GET after the PUT resolved the
    // finished video (no per-item polling happened).
    expect(streamCalls.length).toBe(1);
    expect(puts.length).toBe(1);
    const putPayload = puts[0] as {
      isComplete: boolean;
      content: Array<{
        id: string;
        isLoading: boolean;
        videoUrl: string | null;
        data: unknown;
      }>;
    };
    // The PUT was built from the stream's final event, with `data` stringified
    // and the epoch-suffixed resolved id collapsed onto the base content slot,
    // marked `isLoading: false` (a loading placeholder would stay "pending").
    expect(putPayload.isComplete).toBe(true);
    expect(putPayload.content).toHaveLength(1);
    expect(putPayload.content[0]?.id).toBe(contentItemId(capturedBatchId, 0));
    expect(putPayload.content[0]?.isLoading).toBe(false);
    expect(putPayload.content[0]?.videoUrl).toBe("https://vibes.ai/cdn/s1.mp4");
    expect(putPayload.content[0]?.data).toBe(JSON.stringify({ videoGenEntId: "ent-1" }));

    expect(result.batch.isComplete).toBe(true);
    expect(result.videos).toHaveLength(1);
    expect(result.videos[0]?.videoUrl).toBe("https://vibes.ai/cdn/s1.mp4");
  });

  it("throws an error when the batch fails", async () => {
    const server = installMockServer();
    let capturedBatchId = "";
    server.on("POST", "/api/generate/videos", (req) => {
      const body = req.jsonBody as { batchId: string };
      capturedBatchId = body.batchId;
      return jsonResponse({
        success: true,
        batchId: body.batchId,
        videoGenEntIds: [],
        needsPolling: false,
        hasPartialErrors: false,
        items: [],
      });
    });
    server.on("POST", "/api/generation-batches", () => jsonResponse({ batch: null, id: "x" }));
    server.on("GET", /generation-batches\/[^/]+$/, () =>
      jsonResponse({
        batch: fullBatch(capturedBatchId, {
          isComplete: false,
          hasError: true,
          error: "model timed out",
          items: [],
        }),
      }),
    );

    const client = new VibesClient();
    await expect(
      client.videos.generateAndWait(
        {
          projectId: PROJECT_ID,
          prompt: "x",
          startFrame: {
            imageUrl: "https://vibes.ai/cdn/start.png",
            imageEntId: "1166369879902864",
          },
          variations: 1,
        },
        { timeoutMs: 1_000, intervalMs: 3 },
      ),
    ).rejects.toThrow(/model timed out/);
  });

  it("generates from a bare prompt when no start frame is provided (prompt-only shape)", async () => {
    const server = installMockServer();
    let captured: T2VGenerateRequest | undefined;

    server.on("POST", "/api/generate/videos", (req) => {
      captured = req.jsonBody as T2VGenerateRequest;
      expect(T2VGenerateRequestSchema.safeParse(captured).success).toBe(true);
      return jsonResponse({
        success: true,
        batchId: captured.batchId,
        videoGenEntIds: [],
        needsPolling: false,
        hasPartialErrors: false,
        items: [],
      });
    });
    server.on("POST", "/api/generation-batches", () => jsonResponse({ batch: null, id: "x" }));
    server.on("GET", /generation-batches\/[^/]+$/, () =>
      jsonResponse({
        batch: fullBatch(captured!.batchId, {
          items: captured!.inputs.map((_, i) => contentItem(captured!.batchId, i, { done: true })),
          isComplete: true,
        }),
      }),
    );
    server.on("PUT", "/api/generation-batches", () =>
      jsonResponse({ batch: fullBatch(captured!.batchId) }),
    );

    const client = new VibesClient();
    await client.videos.generateAndWait(
      {
        projectId: PROJECT_ID,
        prompt: "test text prompt only",
        variations: 2,
        aspectRatio: "16:9",
      },
      { timeoutMs: 1_000, intervalMs: 3 },
    );

    const body = captured!;
    expect(body.inputs).toHaveLength(2);
    for (const input of body.inputs) {
      expect(input.type).toBe("prompt");
      if (input.type !== "prompt") {
        throw new Error(`unexpected input type: ${input.type}`);
      }
      expect(input.value).toBe("test text prompt only");
      expect(input.original_prompt).toBe("test text prompt only");
      expect(input.config.aspectRatio).toBe("16:9");
      expect(input.config.directGeneration).toBe(true);
      expect((input.config as Record<string, unknown>).directPromptImageHandle).toBeUndefined();
      expect((input.config as Record<string, unknown>).sourceContentItemIds).toBeUndefined();
    }
    // No frame fields on the top-level config either.
    const config = body.config as Record<string, unknown>;
    expect(config.sourceContentItemIds).toBeUndefined();
    expect(config.directPromptImageHandle).toBeUndefined();
    expect(config.generationType).toBe("t2v");
  });
});

describe("videos.generateExtend / extendAndWait", () => {
  it("extends a video: polls the batch, PUTs, then resolves the asset", async () => {
    const server = installMockServer();
    const assetTemplate = FIXTURES.get("assets.json")!.responses[0] as {
      assets: Record<string, unknown>[];
    };

    let capturedBatchId = "";
    let done = false;
    const liveAssets: Record<string, unknown>[] = [];

    server.on("POST", "/api/generate/videos", (req) => {
      const body = req.jsonBody as { batchId: string; inputs: Array<{ type: string }> };
      capturedBatchId = body.batchId;
      expect(body.inputs[0]?.type).toBe("extend");
      liveAssets.push({
        ...assetTemplate.assets[0]!,
        id: randomUUID(),
        batchId: capturedBatchId,
        videoUrl: "https://vibes.ai/cdn/extended.mp4",
      });
      done = false;
      return jsonResponse({
        success: true,
        batchId: capturedBatchId,
        videoGenEntIds: ["ent-1"],
        needsPolling: false,
        hasPartialErrors: false,
        items: [],
      });
    });
    server.on("POST", "/api/generation-batches", (req) =>
      jsonResponse({ batch: null, id: (req.jsonBody as { id: string }).id }),
    );
    server.on("GET", /generation-batches\/[^/]+$/, () => {
      if (!done) {
        done = true;
        return jsonResponse({ batch: fullBatch(capturedBatchId, {}) });
      }
      return jsonResponse({
        batch: fullBatch(capturedBatchId, {
          items: [
            contentItem(capturedBatchId, 0, {
              videoUrl: "https://vibes.ai/cdn/extended.mp4",
              done: true,
            }),
          ],
        }),
      });
    });
    server.on("PUT", "/api/generation-batches", () =>
      jsonResponse({ batch: fullBatch(capturedBatchId, {}) }),
    );
    server.on("GET", /\/projects\/.+\/assets$/, () =>
      jsonResponse({ success: true, assets: [...liveAssets], count: liveAssets.length }),
    );

    const client = new VibesClient();
    const result = await client.videos.extendAndWait(
      {
        projectId: PROJECT_ID,
        prompt: "continue the scene",
        source: {
          mediaEntId: "1166391013234084",
          videoUrl: "https://vibes.ai/cdn/source.mp4",
          contentItemId: "source-content-item",
        },
      },
      { timeoutMs: 1_000, intervalMs: 5 },
    );

    expect(capturedBatchId).toMatch(/^extend-/);
    expect(result.video.videoUrl).toBe("https://vibes.ai/cdn/extended.mp4");
  });
});

describe("videos.extendToDuration", () => {
  it("repeatedly extends a 5s video until it reaches 10s (+4s per extend)", async () => {
    const server = installMockServer();
    const assetTemplate = FIXTURES.get("assets.json")!.responses[0] as {
      assets: Record<string, unknown>[];
    };

    let captures = 0;
    const liveAssets: Record<string, unknown>[] = [];

    server.on("POST", "/api/generate/videos", (req) => {
      const body = req.jsonBody as { batchId: string };
      captures += 1;
      liveAssets.push({
        ...assetTemplate.assets[0]!,
        id: randomUUID(),
        batchId: body.batchId,
        mediaEntId: `m-${captures}`,
        contentItemId: `ci-${captures}`,
        videoUrl: `https://vibes.ai/cdn/video-${captures}.mp4`,
      });
      return jsonResponse({
        success: true,
        batchId: body.batchId,
        videoGenEntIds: [`m-${captures}`],
        needsPolling: false,
        hasPartialErrors: false,
        items: [],
      });
    });
    server.on("POST", "/api/generation-batches", () => jsonResponse({ batch: null, id: "x" }));
    server.on("GET", /generation-batches\/[^/]+$/, () => {
      const last = liveAssets[liveAssets.length - 1]!;
      return jsonResponse({
        batch: fullBatch(last.batchId as string, {
          items: [
            contentItem(last.batchId as string, 0, {
              videoUrl: last.videoUrl as string,
              done: true,
            }),
          ],
        }),
      });
    });
    server.on("PUT", "/api/generation-batches", (req) => {
      const id = (req.jsonBody as { id: string }).id;
      return jsonResponse({ batch: fullBatch(id, {}) });
    });
    server.on("GET", /\/projects\/.+\/assets$/, () =>
      jsonResponse({ success: true, assets: [...liveAssets], count: liveAssets.length }),
    );

    const client = new VibesClient();
    const durations: number[] = [];
    const result = await client.videos.extendToDuration({
      projectId: PROJECT_ID,
      prompt: "keep going",
      source: { mediaEntId: "m1", videoUrl: "https://vibes.ai/cdn/a.mp4" },
      targetSeconds: 10,
      poll: { timeoutMs: 1_000, intervalMs: 5 },
      onExtend: ({ totalDurationSeconds }) => durations.push(totalDurationSeconds),
    });

    // 5s -> 9s -> 13s: two extensions needed to clear 10s.
    expect(captures).toBe(2);
    expect(result.extensions).toBe(2);
    expect(result.totalDurationSeconds).toBe(
      GENERATED_VIDEO_DURATION_S + EXTEND_VIDEO_DURATION_INCREMENT_S * 2,
    );
    expect(result.totalDurationSeconds).toBe(13);
    expect(durations).toEqual([9, 13]);
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function contentItem(
  batchId: string,
  index: number,
  opts: { videoUrl?: string | null; done?: boolean } = {},
): Record<string, unknown> {
  const videoUrl = opts.videoUrl ?? null;
  return {
    id: contentItemId(batchId, index),
    batchId,
    type: "videos",
    imageUrl: null,
    videoUrl,
    imageHandle: null,
    videoHandle: null,
    mediaEntId: videoUrl ? `ent-${index}` : null,
    prompt: "p",
    imagePrompt: null,
    videoPrompt: null,
    isFavorited: false,
    isLoading: !opts.done,
    error: null,
    createdAt: "2026-08-04T18:00:00.000Z",
    structuredOutput: null,
    orderIndex: index,
    srefValues: null,
    data: null,
    canRetry: true,
    updatedAt: "2026-08-04T18:00:00.000Z",
    hasUploadedAncestor: false,
    contentItemId: contentItemId(batchId, index),
    projectId: PROJECT_ID,
    relationship: "created",
    isInTimeline: false,
    sourceProjectId: null,
    addedAt: "2026-08-04T18:00:00.000Z",
  };
}

function fullBatch(
  batchId: string,
  opts: {
    isComplete?: boolean;
    hasError?: boolean;
    error?: string | null;
    items?: Array<Record<string, unknown>>;
  } = {},
): Record<string, unknown> {
  const isComplete = opts.isComplete ?? true;
  const items = opts.items ?? [];
  return {
    id: batchId,
    userId: "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
    projectId: PROJECT_ID,
    type: "videos",
    prompt: "p",
    timestamp: "2026-08-04T18:00:00.000Z",
    isComplete,
    hasError: opts.hasError ?? false,
    error: opts.error ?? null,
    canRetry: false,
    config: { directGeneration: true },
    systemPrompt: null,
    promptModel: "gemini-2.5-flash",
    imageModel: "midjen-base",
    videoModel: "midjen-short",
    bulkGenId: null,
    generationStartTime: "2026-08-04T18:00:00.000Z",
    generationEndTime: "2026-08-04T18:00:20.000Z",
    creationContext: "legacy",
    createdAt: "2026-08-04T18:00:00.000Z",
    updatedAt: "2026-08-04T18:00:20.000Z",
    needsPolling: false,
    content: items,
  };
}
