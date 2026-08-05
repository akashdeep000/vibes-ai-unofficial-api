import { VibesClient } from "./src/index.js";
import "dotenv/config";
import { readFileSync } from "node:fs";
import { dimensionsToAspectRatio } from "./src/utils/aspect-ratio.js";

/**
 * One real extend flow through the full library pipeline:
 *   create project -> upload -> attach -> generateAndWait (t2v) ->
 *   extendToDuration (loops extendAndWait until target duration).
 *
 * Deletes all previous vibes-ai-* projects, creates a fresh one, and leaves
 * the result in place so the timeline can be inspected in the UI (delete
 * afterward with projects.delete(id, { deleteAssets: true }) to stay clean).
 * Prints live, do not pipe through `tail`.
 */

const client = new VibesClient({ session: process.env.VIBES_SESSION_COOKIE! });

const IMAGE =
  process.env.VIBES_IMAGE_PATH ??
  "/home/akash/Downloads/images/Gemini_Generated_Image_auclocauclocaucl.png";

async function main(): Promise<void> {
  const { projects } = await client.projects.list({ limit: 50 });
  const mine = projects.filter((p) => p.name.startsWith("vibes-ai-"));
  console.log("existing projects:", projects.length, "| mine to delete:", mine.length);
  for (const p of mine) {
    const res = await client.projects.delete(p.id, { deleteAssets: true });
    console.log("deleted", p.id, p.name, "->", res.success);
  }

  const { project } = await client.projects.create("vibes-ai-extend-" + Date.now());
  console.log("created project:", project.id);

  const png = readFileSync(IMAGE);
  const { upload, attach } = await client.media.uploadToProject(project.id, new Uint8Array(png), {
    filename: "start.png",
  });
  const contentItemId = attach.contentItems[0]!.id;
  console.log("upload:", upload.mediaEntId, JSON.stringify(upload.dimensions), upload.aspectRatio);

  console.time("generateAndWait");
  const t2v = await client.videos.generateAndWait(
    {
      projectId: project.id,
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
    { timeoutMs: 15 * 60_000, stream: true },
  );
  console.timeEnd("generateAndWait");
  console.log("t2v complete:", t2v.batch.isComplete, "| videos:", t2v.videos.length);

  const base = t2v.videos[0]!;
  const dims = base.structuredOutput?.metadata?.dimensions;
  const source = {
    mediaEntId: base.mediaEntId ?? base.id,
    videoUrl: base.videoUrl!,
    ...(base.contentItemId !== null && base.contentItemId !== undefined
      ? { contentItemId: base.contentItemId }
      : {}),
    ...(dims ? { metadata: { dimensions: dims, aspectRatio: dimensionsToAspectRatio(dims) } } : {}),
  };
  console.log("extend source:", JSON.stringify({ ...source, videoUrl: "(cf url)" }));

  const onExtend = (info: {
    video: unknown;
    totalDurationSeconds: number;
    extensions: number;
  }): void => {
    const v = info.video as { videoUrl: string | null; contentItemId: string | null };
    console.log(
      `extension #${info.extensions}: total=${info.totalDurationSeconds}s ci=${v.contentItemId} url=${v.videoUrl?.slice(0, 40)}...`,
    );
  };

  console.time("extendToDuration");
  const target = 30;
  const done = await client.videos.extendToDuration({
    projectId: project.id,
    prompt:
      "continue the aerial dolly push-in over the misty valley, golden light holding, gentle motion",
    targetSeconds: target,
    source,
    onExtend,
    poll: { timeoutMs: 15 * 60_000, stream: true },
  });
  console.timeEnd("extendToDuration");

  console.log("final:", JSON.stringify({ ...done, video: `asset ${done.video.id}` }));
  const { assets } = await client.assets.list(project.id);
  console.log(
    "assets:",
    assets.map((a) => `${a.type} batch=${a.batchId} ci=${a.contentItemId}`).join(" | "),
  );
}

main()
  .then(() => {
    console.log(
      "done (project kept for UI inspection; delete via projects.delete(id,{deleteAssets:true}))",
    );
  })
  .catch((e) => {
    console.error("FAILED:", e);
    process.exitCode = 1;
  });
