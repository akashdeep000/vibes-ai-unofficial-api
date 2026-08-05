/**
 * Integration tests: the two-step upload flow (POST /upload-media, then
 * POST /projects/:projectId/upload to attach the file to a project).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ProjectUploadRequestSchema,
  VibesClient,
  type ProjectUploadRequest,
} from "../../src/index.js";
import { FIXTURES, installMockServer, solidPng } from "../helpers.js";

const PROJECT_ID = "7a0f777a-d069-4b4b-8aa2-7560fe351c4b";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("media.attachToProject", () => {
  it("posts the exact wire format and returns the attached content item", async () => {
    const server = installMockServer();
    const uploadFixture = FIXTURES.get("upload-media.json")!;
    const attachFixture = FIXTURES.get("project-upload.json")!;

    server.on("POST", "/api/upload-media", () => jsonResponse(uploadFixture.responses[0]));
    server.on("POST", "/api/projects/" + PROJECT_ID + "/upload", (req) => {
      expect(req.jsonBody).toEqual(attachFixture.requests[0]!.body);
      expect(ProjectUploadRequestSchema.safeParse(req.jsonBody).success).toBe(true);
      return jsonResponse(attachFixture.responses[0]);
    });

    const client = new VibesClient();
    const body = ProjectUploadRequestSchema.parse(attachFixture.requests[0]!.body);
    const attached = await client.media.attachToProject(PROJECT_ID, body.files);

    expect(attached.success).toBe(true);
    expect(attached.count).toBe(1);
    expect(attached.contentItems[0]?.id).toBeTruthy();
    expect(attached.contentItems[0]?.type).toBe("images");
    expect(server.calls.some((c) => c.pathname === `/api/projects/${PROJECT_ID}/upload`)).toBe(
      true,
    );
  });
});

describe("media.uploadToProject", () => {
  it("uploads the file then attaches it, returning both results", async () => {
    const server = installMockServer();
    const uploadFixture = FIXTURES.get("upload-media.json")!;
    const attachFixture = FIXTURES.get("project-upload.json")!;

    server.on("POST", "/api/upload-media", (req) => {
      expect(req.bodyText).toBe("[form-data]");
      return jsonResponse(uploadFixture.responses[0]);
    });
    server.on("POST", "/api/projects/" + PROJECT_ID + "/upload", () => {
      return jsonResponse(attachFixture.responses[0]);
    });

    const client = new VibesClient();
    const result = await client.media.uploadToProject(PROJECT_ID, solidPng(32, 32), {
      filename: "start.png",
    });

    expect(result.upload.mediaEntId).toBe(
      (uploadFixture.responses[0] as { mediaEntId: string }).mediaEntId,
    );
    expect(result.attach.success).toBe(true);

    // The attach payload uses the upload's mediaEntId/uploadToken/cdnUrl.
    const attachCall = server.calls.find(
      (c) => c.pathname === `/api/projects/${PROJECT_ID}/upload`,
    )!;
    const attachBody = JSON.parse(attachCall.bodyText!) as ProjectUploadRequest;
    expect(attachBody.files[0]!.mediaEntId).toBe(
      (uploadFixture.responses[0] as { mediaEntId: string }).mediaEntId,
    );
    expect(attachBody.files[0]!.filename).toBe("start.png");
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
