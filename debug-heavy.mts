import { VibesClient } from "./src/index.js";
import "dotenv/config";
import { readFileSync } from "node:fs";

/**
 * One real t2v generation through the full library pipeline:
 *   upload -> attach (content item) -> POST /generate/videos -> register
 *   skeleton -> poll GET /generation-batches/:id -> finalize PUT -> resolve.
 *
 * Reuses the project + image created by step1.mts (env-overridable), then
 * DELETES the project to keep the account clean. Prints live, do not pipe
 * through `tail` (it hides streaming output).
 */

const client = new VibesClient({ session: process.env.VIBES_SESSION_COOKIE! });

const PROJECT_ID = process.env.VIBES_PROJECT_ID ?? "2a53458b-a86d-42d2-9127-ef6e05111223";
const IMAGE =
  process.env.VIBES_IMAGE_PATH ??
  "/home/akash/Downloads/images/Gemini_Generated_Image_auclocauclocaucl.png";

async function main(): Promise<void> {
  console.log("project:", PROJECT_ID);

  const png = readFileSync(IMAGE);
  const { upload, attach } = await client.media.uploadToProject(PROJECT_ID, new Uint8Array(png), {
    filename: "start.png",
  });
  const contentItemId = attach.contentItems[0]!.id;
  console.log("upload:", upload.mediaEntId, upload.dimensions, upload.aspectRatio);
  console.log("attached contentItemId:", contentItemId);

  console.time("generateAndWait");
  const result = await client.videos.generateAndWait(
    {
      projectId: PROJECT_ID,
      prompt:
        "cinematic aerial view of a misty valley at golden hour, slow dolly push-in, soft volumetric light",
      startFrame: {
        imageUrl: upload.cdnUrl,
        imageEntId: upload.mediaEntId,
        dimensions: upload.dimensions,
        contentItemId,
      },
      variations: 1,
      videoModel: "midjen-short",
    },
    {
      timeoutMs: 15 * 60_000,
      stream: true,
      onPoll: (state) => console.log("stream:", JSON.stringify(state).slice(0, 120)),
    },
  );
  console.timeEnd("generateAndWait");

  console.log("batch complete:", result.batch.isComplete, "| videos:", result.videos.length);
  for (const v of result.videos) {
    console.log("video:", v.videoUrl ?? "(none)", "| err:", v.error ?? "(none)");
  }

  const { assets } = await client.assets.list(PROJECT_ID);
  console.log(
    "assets:",
    assets.map((a) => `${a.type} batch=${a.batchId} ci=${a.contentItemId}`).join(" | "),
  );
}

main()
  .then(() => {
    console.log("done");
  })
  .catch((e) => {
    console.error("FAILED:", e);
    process.exitCode = 1;
  });
