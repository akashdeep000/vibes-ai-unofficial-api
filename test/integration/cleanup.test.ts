/**
 * Integration tests for the self-contained testing lifecycle:
 * create project -> test -> bulk-delete content items -> delete project.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BulkDeletePayloadSchema,
  VibesClient,
  type BulkDeleteResponse,
  type ProjectDeleteResponse,
} from "../../src/index.js";
import { installMockServer } from "../helpers.js";

const PROJECT_ID = "7a0f777a-d069-4b4b-8aa2-7560fe351c4b";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("projects.delete", () => {
  it("deletes the project with deleteAssets=true by default", async () => {
    const server = installMockServer();
    let seenUrl = "";
    server.on("DELETE", /\/projects\/[0-9a-f-]+$/, (req) => {
      seenUrl = req.url.toString();
      return jsonResponse({
        success: true,
        message: "Project deleted successfully",
        deletedOrphanCount: 9,
      });
    });

    const client = new VibesClient();
    const result: ProjectDeleteResponse = await client.projects.delete(PROJECT_ID);

    expect(seenUrl).toBe(`https://vibes.ai/api/projects/${PROJECT_ID}?deleteAssets=true`);
    expect(result.success).toBe(true);
    expect(result.deletedOrphanCount).toBe(9);
  });

  it("honors deleteAssets: false", async () => {
    const server = installMockServer();
    let seenUrl = "";
    server.on("DELETE", /\/projects\/[0-9a-f-]+$/, (req) => {
      seenUrl = req.url.toString();
      return jsonResponse({ success: true, message: "ok", deletedOrphanCount: 0 });
    });

    const client = new VibesClient();
    await client.projects.delete(PROJECT_ID, { deleteAssets: false });
    expect(seenUrl).toBe(`https://vibes.ai/api/projects/${PROJECT_ID}?deleteAssets=false`);
  });
});

describe("contentItems.bulkDelete", () => {
  it("sends the exact payload and returns the deleted counts", async () => {
    const server = installMockServer();
    let seen: { method: string; path: string; body: unknown } | undefined;
    server.on("DELETE", "/api/content-items/bulk-delete", (req) => {
      seen = { method: req.method, path: req.pathname, body: req.jsonBody };
      return jsonResponse({ deletedItems: 2, removedFromProject: 2 });
    });

    const client = new VibesClient();
    const result: BulkDeleteResponse = await client.contentItems.bulkDelete(PROJECT_ID, [
      "batch-x-content-0",
      "batch-x-content-1",
    ]);

    const payload = BulkDeletePayloadSchema.parse(seen?.body);
    expect(payload).toEqual({
      projectId: PROJECT_ID,
      contentItemIds: ["batch-x-content-0", "batch-x-content-1"],
    });
    expect(seen?.method).toBe("DELETE");
    expect(result).toEqual({ deletedItems: 2, removedFromProject: 2 });
  });

  it("rejects an empty id list at the payload boundary", async () => {
    const server = installMockServer();
    server.on("DELETE", "/api/content-items/bulk-delete", () => jsonResponse({}));
    const client = new VibesClient();
    await expect(client.contentItems.bulkDelete(PROJECT_ID, [])).rejects.toThrow();
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
