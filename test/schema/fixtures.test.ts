/**
 * Validates every extracted browser trace against the library's Zod schemas.
 *
 * This is the contract test: if the API drifts, one of these assertions
 * fails and the drift becomes visible immediately.
 */
import { describe, expect, it } from "vitest";
import { type z } from "zod";
import {
  AssetsResponseSchema,
  BatchCreateResponseSchema,
  BatchGetResponseSchema,
  BatchListResponseSchema,
  BatchSkeletonSchema,
  BatchStreamEventSchema,
  BatchUpdatePayloadSchema,
  BatchUpdateResponseSchema,
  BulkDeletePayloadSchema,
  BulkDeleteResponseSchema,
  ExtendGenerateRequestSchema,
  GenerateVideosResponseSchema,
  MeResponseSchema,
  ProjectAssetsResponseSchema,
  ProjectCreateResponseSchema,
  ProjectDeleteResponseSchema,
  ProjectListResponseSchema,
  ProjectUploadRequestSchema,
  ProjectUploadResponseSchema,
  SyncResponseSchema,
  T2VGenerateRequestSchema,
  UploadMediaResponseSchema,
} from "../../src/schemas/index.js";
import { FIXTURES } from "../helpers.js";

type SchemaLike = z.ZodType<unknown>;

/**
 * A fixture may capture several different endpoints (e.g. `projects.json`
 * holds both the GET list and the POST create). Every response must parse
 * against at least one of the candidate schemas.
 */
const responseCases: Array<[string, SchemaLike[]]> = [
  ["assets.json", [AssetsResponseSchema]],
  ["auto-extend-generate-videos.json", [GenerateVideosResponseSchema]],
  ["batch-list.json", [BatchListResponseSchema]],
  ["check-token.json", [MeResponseSchema]],
  ["content-bulk-delete.json", [BulkDeleteResponseSchema]],
  ["generate-videos.json", [GenerateVideosResponseSchema, BatchUpdateResponseSchema]],
  ["generation-batches.json", [BatchCreateResponseSchema]],
  ["generation-batch-get.json", [BatchGetResponseSchema]],
  ["extend-batch-response.json", [BatchGetResponseSchema]],
  ["generation-batch-update.json", [BatchUpdateResponseSchema]],
  ["stream.json", [BatchStreamEventSchema]],
  ["manual-extend-generate-videos.json", [GenerateVideosResponseSchema]],
  ["manual-extent-generation-batches.json", [BatchCreateResponseSchema]],
  ["me.json", [MeResponseSchema]],
  ["prompt-only-generation-batches.json", [BatchCreateResponseSchema]],
  ["prompt-only-generate-videos.json", [GenerateVideosResponseSchema]],
  ["project-assets-list.json", [ProjectAssetsResponseSchema]],
  ["project-delete.json", [ProjectDeleteResponseSchema]],
  ["project-sync.json", [SyncResponseSchema]],
  ["project-upload.json", [ProjectUploadResponseSchema]],
  ["projects.json", [ProjectListResponseSchema, ProjectCreateResponseSchema]],
  ["upload-media.json", [UploadMediaResponseSchema]],
];

describe("fixtures match response schemas", () => {
  for (const [file, schemas] of responseCases) {
    it(`${file} response parses`, () => {
      const fixture = FIXTURES.get(file);
      expect(fixture, `fixture ${file} not found`).toBeDefined();
      expect(fixture!.responses.length, `fixture ${file} has no responses`).toBeGreaterThan(0);
      for (const response of fixture!.responses) {
        const parsed = schemas.filter((schema) => schema.safeParse(response).success);
        expect(
          parsed.length > 0,
          `${file}: response matches none of ${schemas.length} candidate schemas: ${JSON.stringify(
            response,
          ).slice(0, 300)}`,
        ).toBe(true);
      }
    });
  }
});

/** Requests are matched to request schemas by method + path suffix. */
const requestCases: Array<[string, string, string, SchemaLike]> = [
  ["generate-videos.json", "POST", "/api/generate/videos", T2VGenerateRequestSchema],
  ["generate-videos.json", "PUT", "/api/generation-batches", BatchUpdatePayloadSchema],
  ["generation-batches.json", "POST", "/api/generation-batches", BatchSkeletonSchema],
  ["generation-batch-update.json", "PUT", "/api/generation-batches", BatchUpdatePayloadSchema],
  ["prompt-only-generate-videos.json", "POST", "/api/generate/videos", T2VGenerateRequestSchema],
  ["prompt-only-generation-batches.json", "POST", "/api/generation-batches", BatchSkeletonSchema],
  ["project-upload.json", "POST", "/api/projects/", ProjectUploadRequestSchema],
  [
    "manual-extend-generate-videos.json",
    "POST",
    "/api/generate/videos",
    ExtendGenerateRequestSchema,
  ],
  ["auto-extend-generate-videos.json", "POST", "/api/generate/videos", ExtendGenerateRequestSchema],
  ["content-bulk-delete.json", "DELETE", "/api/content-items/bulk-delete", BulkDeletePayloadSchema],
];

describe("fixtures match request schemas (the exact wire format)", () => {
  for (const [file, method, path, schema] of requestCases) {
    it(`${file} ${method} ${path}`, () => {
      const fixture = FIXTURES.get(file)!;
      const request = fixture.requests.find((r) => r.method === method && r.url.includes(path));
      expect(request, `request ${method} ${path} not found in ${file}`).toBeDefined();
      const result = schema.safeParse(request!.body);
      expect(
        result.success,
        `${file} ${method} ${path}: body does not match schema: ${JSON.stringify(
          result.success ? "" : result.error.issues,
        )}`,
      ).toBe(true);
    });
  }

  it("every response schema case also has a positive control", () => {
    // Guards against a schema silently accepting garbage (e.g. a `.catch()`
    // eating the whole object) by asserting every listed schema rejects a
    // clearly-wrong payload.
    const controls: Array<[string, SchemaLike, unknown]> = [
      ["AssetsResponseSchema", AssetsResponseSchema, { nope: true }],
      ["BatchListResponseSchema", BatchListResponseSchema, {}],
      ["BulkDeleteResponseSchema", BulkDeleteResponseSchema, {}],
      ["MeResponseSchema", MeResponseSchema, {}],
      ["ProjectDeleteResponseSchema", ProjectDeleteResponseSchema, {}],
      ["UploadMediaResponseSchema", UploadMediaResponseSchema, {}],
    ];
    for (const [name, schema, bad] of controls) {
      expect(schema.safeParse(bad).success, `${name} accepted garbage`).toBe(false);
    }
  });
});

/** A sanity check that fixture extraction preserved both halves. */
describe("fixture extraction integrity", () => {
  it("every fixture with requests has matching responses or vice versa", () => {
    for (const [file, fixture] of FIXTURES) {
      if (fixture.responses.length === 0) {
        expect(file, `${file} has no responses`).toBe("generation-batches.json");
      }
    }
  });

  it("all fixture files are covered by the schema matrix", () => {
    const coveredResponses = new Set(responseCases.map(([f]) => f));
    const coveredRequests = new Set(requestCases.map(([f]) => f));
    const uncovered = [...FIXTURES.keys()].filter(
      (f) => !coveredResponses.has(f) && !coveredRequests.has(f),
    );
    expect(uncovered).toEqual([]);
  });
});
