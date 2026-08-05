import { VibesClient } from "./src/index.js";
import "dotenv/config";
import { readFileSync } from "node:fs";

/**
 * Live check: does the last-frame (end) image influence the output aspect
 * ratio, or do the start-frame dimensions win? Start 16:9 + a mismatched
 * 9:16 end frame. Prints the resolved output dimensions.
 */

const client = new VibesClient({ session: process.env.VIBES_SESSION_COOKIE! });
const DIR = "/home/akash/Downloads/images/";

async function main(): Promise<void> {
  const { projects } = await client.projects.list({ limit: 50 });
  const mine = projects.filter((p) => p.name.startsWith("vibes-ai-"));
  for (const p of mine) {
    await client.projects.delete(p.id, { deleteAssets: true });
    console.log("deleted", p.id, p.name);
  }

  const { project } = await client.projects.create("vibes-ai-endframe-" + Date.now());
  console.log("created project:", project.id);

  const startPng = readFileSync(`${DIR}Gemini_Generated_Image_auclocauclocaucl.png`);
  const endPng = readFileSync(`${DIR}Gemini_Generated_Image_bgt6ytbgt6ytbgt6.png`);

  const start = await client.media.uploadToProject(project.id, new Uint8Array(startPng), {
    filename: "start-169.png",
  });
  const end = await client.media.uploadToProject(project.id, new Uint8Array(endPng), {
    filename: "end-916.png",
  });
  console.log("start:", start.upload.mediaEntId, JSON.stringify(start.upload.dimensions));
  console.log("end:  ", end.upload.mediaEntId, JSON.stringify(end.upload.dimensions));

  const result = await client.videos.generateAndWait(
    {
      projectId: project.id,
      prompt:
        "the camera slowly dollies through the scene while the lighting shifts to the end frame",
      startFrame: {
        imageUrl: start.upload.cdnUrl,
        imageEntId: start.upload.mediaEntId,
        dimensions: start.upload.dimensions,
        contentItemId: start.attach.contentItems[0]?.id,
      },
      endFrame: {
        imageUrl: end.upload.cdnUrl,
        imageEntId: end.upload.mediaEntId,
        contentItemId: end.attach.contentItems[0]?.id,
      },
      variations: 1,
    },
    { timeoutMs: 15 * 60_000, stream: true },
  );

  console.log("batch complete:", result.batch.isComplete);
  const v = result.videos[0];
  console.log(
    "output:",
    JSON.stringify({
      dims: v?.structuredOutput?.metadata?.dimensions,
      ratio: v?.structuredOutput?.metadata?.aspectRatio,
    }),
  );
  const { assets } = await client.assets.list(project.id);
  console.log("assets:", assets.map((a) => `${a.type} ci=${a.contentItemId}`).join(" | "));
}

main()
  .then(() => console.log("done (end frame wins? start frame wins?)"))
  .catch((e) => {
    console.error("FAILED:", e);
    process.exitCode = 1;
  });
