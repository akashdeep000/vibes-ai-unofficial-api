/**
 * Live tests against the real vibes.ai API.
 *
 * These tests are fully self-contained: they create a fresh project, run
 * against it, and delete the project (plus its content items) afterwards.
 * Nothing is left behind in the account.
 *
 * Gating:
 * - Requires `VIBES_SESSION_COOKIE` (the browser session cookie) and
 *   `VIBES_RUN_LIVE=1`.
 * - Heavy tests (video generation / extension) additionally require
 *   `VIBES_RUN_HEAVY=1` since they consume generation quota.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import "dotenv/config";
import {
  EXTEND_VIDEO_DURATION_INCREMENT_S,
  GENERATED_VIDEO_DURATION_S,
  VibesClient,
} from "../../src/index.js";
import { solidPng } from "../helpers.js";

const session = process.env.VIBES_SESSION_COOKIE ?? "";
const runLive = process.env.VIBES_RUN_LIVE === "1" && session.length > 0;
const runHeavy = runLive && process.env.VIBES_RUN_HEAVY === "1";

const HEAVY_TIMEOUT = 15 * 60_000;

describe.skipIf(!runLive)("live API (create project -> test -> delete project)", () => {
  const client = new VibesClient({
    session,
    retry: { maxRetries: 2, baseDelayMs: 500, maxDelayMs: 5_000 },
  });

  let projectId = "";
  const createdContentItemIds: string[] = [];

  beforeAll(async () => {
    const response = await client.projects.create(`vibes-ai-test-${Date.now()}`);
    projectId = response.project.id;
  }, 60_000);

  afterAll(async () => {
    if (!projectId) return;
    try {
      if (createdContentItemIds.length > 0) {
        await client.contentItems.bulkDelete(projectId, createdContentItemIds);
      }
    } finally {
      await client.projects.delete(projectId, { deleteAssets: true });
    }
  }, 60_000);

  it("authenticates: auth.me returns the session user", async () => {
    const me = await client.auth.me();
    expect(me.user).toBeDefined();
    expect(me.user.sessionId).toBeTruthy();
  });

  it("authenticates: checkToken accepts the session", async () => {
    const result = await client.auth.checkToken();
    expect(result.user.sessionId).toBeTruthy();
  });

  it("lists existing projects", async () => {
    const { projects } = await client.projects.list({ limit: 5 });
    expect(projects.length).toBeGreaterThan(0);
  });

  it("uploads an image (media is referenced by mediaEntId, not the asset list)", async () => {
    const upload = await client.media.upload(solidPng(32, 32), { filename: "start.png" });
    expect(upload.mediaEntId).toBeTruthy();
    expect(upload.cdnUrl).toMatch(/^https:\/\//);
    expect(upload.dimensions).toEqual({ width: 32, height: 32 });
    expect(upload.aspectRatio).toBe("1:1");
    // A fresh project has no assets yet; the upload itself is not listed here
    // (the platform attaches media to projects only via generation inputs).
    const { assets } = await client.assets.list(projectId);
    expect(assets).toEqual([]);
  });

  it("lists batches for the project", async () => {
    const { batches } = await client.batches.list(projectId, { limit: 5 });
    expect(Array.isArray(batches)).toBe(true);
    expect(batches).toEqual([]);
  });

  describe.skipIf(!runHeavy)("heavy: generation (VIBES_RUN_HEAVY=1)", () => {
    let startFrame: {
      imageUrl: string;
      imageEntId: string;
      dimensions: { width: number; height: number };
    };
    let generatedMediaEntId = "";
    let generatedContentItemId = "";

    beforeAll(async () => {
      // A true 16:9 start frame: the platform keys the output to these
      // dimensions, so the generated video should come back 16:9 even
      // though the UI only offers 9:16.
      const upload = await client.media.upload(solidPng(1280, 720), {
        filename: "start-16x9.png",
      });
      startFrame = {
        imageUrl: upload.cdnUrl,
        imageEntId: upload.mediaEntId,
        dimensions: upload.dimensions,
      };
    }, 60_000);

    it(
      "generates a 16:9 video from a 1280x720 start frame",
      async () => {
        const result = await client.videos.generateAndWait(
          {
            projectId,
            prompt: "slow push-in on a calm landscape",
            startFrame,
            variations: 1,
          },
          { timeoutMs: 10 * 60_000, intervalMs: 3_000 },
        );

        expect(result.videos.length).toBeGreaterThan(0);
        const video = result.videos[0]!;
        expect(video.videoUrl).toBeTruthy();
        // Track the content items for cleanup (they are meaningful ids only
        // after actual generation).
        for (const item of result.batch.content) {
          if (item.contentItemId) createdContentItemIds.push(item.contentItemId);
        }

        // The output is keyed to the start frame's dimensions, not the
        // config.aspectRatio field.
        const asset = (await client.assets.list(projectId)).assets.find(
          (a) => a.videoUrl === video.videoUrl,
        );
        expect(asset).toBeDefined();
        expect(asset?.structuredOutput?.metadata?.aspectRatio).toBe("16:9");
        expect(asset?.structuredOutput?.metadata?.dimensions).toEqual({ width: 1280, height: 720 });

        generatedMediaEntId = asset!.mediaEntId!;
        generatedContentItemId = asset!.contentItemId!;
      },
      HEAVY_TIMEOUT,
    );

    it(
      "extends the generated video (+4s)",
      async () => {
        expect(generatedMediaEntId).toBeTruthy();
        const result = await client.videos.extendAndWait(
          {
            projectId,
            prompt: "continue the scene, keep the same camera",
            source: {
              mediaEntId: generatedMediaEntId,
              videoUrl: (await client.assets.list(projectId)).assets.find(
                (a) => a.contentItemId === generatedContentItemId,
              )!.videoUrl!,
            },
          },
          { timeoutMs: 10 * 60_000, intervalMs: 3_000 },
        );

        expect(result.video.videoUrl).toBeTruthy();
        // A fresh 5s video + one extend = 9s total.
        expect(GENERATED_VIDEO_DURATION_S + EXTEND_VIDEO_DURATION_INCREMENT_S).toBe(9);
        if (result.video.contentItemId) createdContentItemIds.push(result.video.contentItemId);
      },
      HEAVY_TIMEOUT,
    );

    it("bulk-deletes the generated content items", async () => {
      const unique = [...new Set(createdContentItemIds)];
      expect(unique.length).toBeGreaterThan(0);
      const result = await client.contentItems.bulkDelete(projectId, unique);
      expect(result.deletedItems).toBeGreaterThanOrEqual(1);
    }, 60_000);
  });
});
