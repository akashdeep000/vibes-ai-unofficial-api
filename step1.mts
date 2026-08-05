import { VibesClient } from "./src/index.js";
import "dotenv/config";
import { readFileSync } from "node:fs";

async function main(): Promise<void> {
  const client = new VibesClient({ session: process.env.VIBES_SESSION_COOKIE! });

  // 1) Delete all projects we created previously (prefix vibes-ai-*).
  const { projects } = await client.projects.list({ limit: 50 });
  const mine = projects.filter((p) => p.name.startsWith("vibes-ai-"));
  console.log("existing projects:", projects.length, "| mine to delete:", mine.length);
  for (const p of mine) {
    const res = await client.projects.delete(p.id, { deleteAssets: true });
    console.log("deleted", p.id, p.name, "->", JSON.stringify(res));
  }

  // 2) Create a fresh project.
  const { project } = await client.projects.create("vibes-ai-step-1-" + Date.now());
  console.log("created project:", project.id, JSON.stringify(project.composition));

  // 3) Upload then attach one of the debug photos to the project.
  const png = readFileSync(
    "/home/akash/Downloads/images/Gemini_Generated_Image_auclocauclocaucl.png",
  );
  const { upload, attach } = await client.media.uploadToProject(project.id, new Uint8Array(png), {
    filename: "start.png",
  });
  console.log("upload:", JSON.stringify(upload));
  console.log("attach:", JSON.stringify(attach));
  console.log("contentItemId for start frame:", attach.contentItems[0]?.id);
}

main();
