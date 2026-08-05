import { VibesClient } from "./src/index.js";
import "dotenv/config";
import { writeFileSync } from "node:fs";

/**
 * Live verification of prompt-only (no reference frame) t2v:
 *   create project -> generateAndWait({ prompt, aspectRatio })
 * and checks the output aspect ratio. Taps raw register/generate responses
 * into /tmp for fixture capture. Leaves the project in place for UI
 * inspection. Prints live, do not pipe through `tail`.
 */

const SESSION = process.env.VIBES_SESSION_COOKIE!;
const client = new VibesClient({ session: SESSION });

const origFetch = globalThis.fetch.bind(globalThis);
let tapCount = 0;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const res = await origFetch(input, init);
  const method = init?.method ?? "GET";
  const url = String(input);
  const isPost = method === "POST" || method === "PUT";
  const isGen = /generate|generation-batches/.test(url) && !url.includes("/stream");
  if (isPost && isGen) {
    const clone = res.clone();
    const text = await clone.text();
    const path = url.includes("/generate/") ? "generate" : "register";
    writeFileSync(`/tmp/prompt-only-${path}.json`, text);
    console.log(`\n[tap] ${method} ${url} -> ${res.status}`);
    console.log(text.slice(0, 300));
    tapCount += 1;
  }
  return res;
}) as typeof fetch;

async function main(): Promise<void> {
  const { projects } = await client.projects.list({ limit: 50 });
  const mine = projects.filter((p) => p.name.startsWith("vibes-ai-"));
  console.log("existing projects:", projects.length, "| mine to delete:", mine.length);
  for (const p of mine) {
    await client.projects.delete(p.id, { deleteAssets: true });
    console.log("deleted", p.id, p.name);
  }

  const { project } = await client.projects.create("vibes-ai-prompt-" + Date.now());
  console.log("created project:", project.id);

  console.time("generateAndWait");
  const result = await client.videos.generateAndWait(
    {
      projectId: project.id,
      prompt: "silver waves of light rippling across a dark ocean at night, cinematic slow motion",
      variations: 1,
      aspectRatio: "16:9",
    },
    { timeoutMs: 15 * 60_000, stream: true },
  );
  console.timeEnd("generateAndWait");

  console.log("batch complete:", result.batch.isComplete, "| videos:", result.videos.length);
  for (const v of result.videos) {
    console.log(
      "video:",
      v.videoUrl ? "yes" : "(none)",
      "| dims:",
      JSON.stringify(v.structuredOutput?.metadata?.dimensions),
      "| ratio:",
      v.structuredOutput?.metadata?.aspectRatio,
      "| err:",
      v.error ?? "(none)",
    );
  }

  const { assets } = await client.assets.list(project.id);
  console.log("assets:", assets.map((a) => `${a.type} ci=${a.contentItemId}`).join(" | "));
  const vidAsset = assets.find((a) => a.type === "videos");
  console.log(
    "video asset:",
    vidAsset
      ? JSON.stringify({
          contentItemId: vidAsset.contentItemId,
          dims: vidAsset.structuredOutput?.metadata?.dimensions,
          ratio: vidAsset.structuredOutput?.metadata?.aspectRatio,
          isLoading: vidAsset.isLoading,
        })
      : "(none)",
  );
  console.log("tapped responses:", tapCount);
}

main()
  .then(() => console.log("done"))
  .catch((e) => {
    console.error("FAILED:", e);
    process.exitCode = 1;
  });
