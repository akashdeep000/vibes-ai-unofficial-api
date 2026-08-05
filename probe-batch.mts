import { VibesClient } from "./src/index.js";
import "dotenv/config";

const client = new VibesClient({ session: process.env.VIBES_SESSION_COOKIE! });
const batchId = process.argv[2];
const raw = await client.http.request<string>({
  method: "GET",
  path: `/generation-batches/${batchId}`,
  rawText: true,
});
console.log(raw);
