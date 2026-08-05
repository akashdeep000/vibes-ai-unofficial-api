"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API_BASE_URL: () => API_BASE_URL,
  API_PREFIX: () => API_PREFIX,
  ASPECT_RATIO: () => ASPECT_RATIO,
  AspectRatioSchema: () => AspectRatioSchema,
  AssetSchema: () => AssetSchema,
  AssetsResource: () => AssetsResource,
  AssetsResponseSchema: () => AssetsResponseSchema,
  AuthResource: () => AuthResource,
  BatchContentItemSchema: () => BatchContentItemSchema,
  BatchCreateResponseSchema: () => BatchCreateResponseSchema,
  BatchGetResponseSchema: () => BatchGetResponseSchema,
  BatchListResponseSchema: () => BatchListResponseSchema,
  BatchSkeletonSchema: () => BatchSkeletonSchema,
  BatchStreamEventSchema: () => BatchStreamEventSchema,
  BatchStreamItemSchema: () => BatchStreamItemSchema,
  BatchUpdatePayloadSchema: () => BatchUpdatePayloadSchema,
  BatchUpdateResponseSchema: () => BatchUpdateResponseSchema,
  BatchesResource: () => BatchesResource,
  BulkDeletePayloadSchema: () => BulkDeletePayloadSchema,
  BulkDeleteResponseSchema: () => BulkDeleteResponseSchema,
  CompositionSchema: () => CompositionSchema,
  ContentItemIdSchema: () => ContentItemIdSchema,
  ContentItemsResource: () => ContentItemsResource,
  DEFAULT_RETRY_OPTIONS: () => DEFAULT_RETRY_OPTIONS,
  DEFAULT_VARIATION_COUNT: () => DEFAULT_VARIATION_COUNT,
  DimensionsSchema: () => DimensionsSchema,
  DirectPromptImageHandleSchema: () => DirectPromptImageHandleSchema,
  EXTEND_VIDEO_DURATION_INCREMENT_S: () => EXTEND_VIDEO_DURATION_INCREMENT_S,
  ExtendGenerateInputSchema: () => ExtendGenerateInputSchema,
  ExtendGenerateRequestSchema: () => ExtendGenerateRequestSchema,
  GENERATED_VIDEO_DURATION_S: () => GENERATED_VIDEO_DURATION_S,
  GENERATION_TYPE: () => GENERATION_TYPE,
  GenerateVideosResponseSchema: () => GenerateVideosResponseSchema,
  GenerationBatchSchema: () => GenerationBatchSchema,
  GenerationConfigSchema: () => GenerationConfigSchema,
  HttpClient: () => HttpClient,
  IMAGE_MODEL: () => IMAGE_MODEL,
  MeResponseSchema: () => MeResponseSchema,
  MediaEntIdSchema: () => MediaEntIdSchema,
  MediaReferenceSchema: () => MediaReferenceSchema,
  MediaResource: () => MediaResource,
  POLL_DEFAULTS: () => POLL_DEFAULTS,
  PROMPT_MODEL: () => PROMPT_MODEL,
  ProjectAssetItemSchema: () => ProjectAssetItemSchema,
  ProjectAssetsResponseSchema: () => ProjectAssetsResponseSchema,
  ProjectCreateResponseSchema: () => ProjectCreateResponseSchema,
  ProjectDeleteResponseSchema: () => ProjectDeleteResponseSchema,
  ProjectListResponseSchema: () => ProjectListResponseSchema,
  ProjectPageSchema: () => ProjectPageSchema,
  ProjectSchema: () => ProjectSchema,
  ProjectSummarySchema: () => ProjectSummarySchema,
  ProjectUploadFileSchema: () => ProjectUploadFileSchema,
  ProjectUploadRequestSchema: () => ProjectUploadRequestSchema,
  ProjectUploadResponseSchema: () => ProjectUploadResponseSchema,
  ProjectUploadedContentItemSchema: () => ProjectUploadedContentItemSchema,
  ProjectsResource: () => ProjectsResource,
  RESOLUTION: () => RESOLUTION,
  RETRY_DEFAULTS: () => RETRY_DEFAULTS,
  SOURCE_ROLE: () => SOURCE_ROLE,
  SourceContentItemIdSchema: () => SourceContentItemIdSchema,
  StructuredOutputSchema: () => StructuredOutputSchema,
  SyncResponseSchema: () => SyncResponseSchema,
  T2VBaseConfigSchema: () => T2VBaseConfigSchema,
  T2VFrameConfigSchema: () => T2VFrameConfigSchema,
  T2VGenerateInputSchema: () => T2VGenerateInputSchema,
  T2VGenerateRequestSchema: () => T2VGenerateRequestSchema,
  UploadMediaResponseSchema: () => UploadMediaResponseSchema,
  UserSchema: () => UserSchema,
  UuidSchema: () => UuidSchema,
  VIDEO_MODEL: () => VIDEO_MODEL,
  VibesClient: () => VibesClient,
  VibesError: () => VibesError,
  VibesHttpError: () => VibesHttpError,
  VibesParseError: () => VibesParseError,
  VibesPollTimeoutError: () => VibesPollTimeoutError,
  VibesValidationError: () => VibesValidationError,
  VideosResource: () => VideosResource,
  batchId: () => batchId,
  contentItemId: () => contentItemId,
  dimensionsToAspectRatio: () => dimensionsToAspectRatio,
  extendBatchId: () => extendBatchId,
  mgRequestId: () => mgRequestId,
  parseFirstJsonObject: () => parseFirstJsonObject,
  resolveAspectRatio: () => resolveAspectRatio,
  uuidv7: () => uuidv7,
  waitFor: () => waitFor,
  withRetry: () => withRetry
});
module.exports = __toCommonJS(index_exports);

// src/http/http-client.ts
var import_zod = require("zod");

// src/constants.ts
var API_BASE_URL = "https://vibes.ai";
var API_PREFIX = "/api";
var GENERATED_VIDEO_DURATION_S = 5;
var EXTEND_VIDEO_DURATION_INCREMENT_S = 4;
var VIDEO_MODEL = {
  SHORT: "midjen-short",
  EXTEND: "midjen-extend"
};
var IMAGE_MODEL = "midjen-base";
var PROMPT_MODEL = "gemini-2.5-flash";
var RESOLUTION = "720p";
var DEFAULT_VARIATION_COUNT = 4;
var SOURCE_ROLE = {
  START_FRAME: "start_frame",
  END_FRAME: "end_frame",
  EXTEND_VIDEO: "extend_video"
};
var ASPECT_RATIO = {
  "16:9": "16:9",
  "9:16": "9:16",
  "1:1": "1:1"
};
var GENERATION_TYPE = {
  T2V: "t2v",
  T2I: "t2i",
  EXTEND: "extend"
};
var POLL_DEFAULTS = {
  intervalMs: 3e3,
  timeoutMs: 15 * 60 * 1e3,
  jitterMs: 500
};
var RETRY_DEFAULTS = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 8e3,
  /** Which status codes trigger a retry. */
  retryStatuses: [408, 429, 500, 502, 503, 504]
};

// src/errors.ts
var VibesError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = new.target.name;
  }
};
var VibesHttpError = class extends VibesError {
  method;
  url;
  status;
  statusText;
  /** Raw response body, when it could be parsed as JSON. */
  body;
  constructor(method, url, status, statusText, body) {
    super(
      `vibes.ai ${method} ${url} failed with status ${status} ${statusText}` + (body !== void 0 ? `: ${JSON.stringify(body)}` : "")
    );
    this.method = method;
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
};
var VibesValidationError = class extends VibesError {
  issues;
  payload;
  constructor(issues, payload) {
    super(
      `vibes.ai response did not match the expected schema (API drift?):
` + issues.join("\n")
    );
    this.issues = issues;
    this.payload = payload;
  }
};
var VibesParseError = class extends VibesError {
  constructor(message, raw) {
    super(message);
    this.raw = raw;
  }
  raw;
};
var VibesPollTimeoutError = class extends VibesError {
  batchId;
  elapsedMs;
  lastState;
  constructor(elapsedMs, lastState, batchId2) {
    super(
      `Polling for batch ${batchId2 ?? "(unknown)"} timed out after ${elapsedMs}ms without reaching the expected state.`
    );
    this.elapsedMs = elapsedMs;
    this.lastState = lastState;
    this.batchId = batchId2;
  }
};

// src/utils/json.ts
function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new VibesParseError(`Failed to parse response body as JSON`, raw);
  }
}

// src/utils/sleep.ts
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function jitter(maxJitter) {
  return Math.random() * maxJitter;
}

// src/utils/retry.ts
var DEFAULT_RETRY_OPTIONS = {
  maxRetries: RETRY_DEFAULTS.maxRetries,
  baseDelayMs: RETRY_DEFAULTS.baseDelayMs,
  maxDelayMs: RETRY_DEFAULTS.maxDelayMs,
  retryStatuses: RETRY_DEFAULTS.retryStatuses
};
function isTransientNetworkError(error) {
  if (error instanceof VibesError) return false;
  return error instanceof Error && error.name === "TypeError";
}
function shouldRetry(error, retryStatuses) {
  if (error instanceof Error && "status" in error && typeof error.status === "number") {
    const status = error.status;
    return { retry: retryStatuses.includes(status), status };
  }
  return { retry: isTransientNetworkError(error) };
}
async function withRetry(fn, options = DEFAULT_RETRY_OPTIONS) {
  let attempt = 0;
  for (; ; ) {
    try {
      return await fn();
    } catch (error) {
      const { retry } = shouldRetry(error, options.retryStatuses);
      if (!retry || attempt >= options.maxRetries) {
        throw error;
      }
      const backoff = Math.min(
        options.baseDelayMs * 2 ** attempt + jitter(options.baseDelayMs),
        options.maxDelayMs
      );
      await sleep(backoff);
      attempt += 1;
    }
  }
}

// src/http/http-client.ts
var isSuccessfulStatus = (status) => status >= 200 && status < 300;
var HttpClient = class {
  #baseUrl;
  #apiPrefix;
  #session;
  #fetch;
  #retry;
  #signal;
  #headers;
  #requestTimeoutMs;
  constructor(options = {}) {
    this.#baseUrl = (options.baseUrl ?? API_BASE_URL).replace(/\/+$/, "");
    this.#apiPrefix = (options.apiPrefix ?? API_PREFIX).replace(/\/+$/, "");
    this.#session = options.session;
    this.#fetch = options.fetchImpl ?? globalThis.fetch;
    this.#signal = options.signal;
    this.#headers = options.headers;
    this.#requestTimeoutMs = options.requestTimeoutMs ?? 6e4;
    this.#retry = {
      maxRetries: options.retry?.maxRetries ?? RETRY_DEFAULTS.maxRetries,
      baseDelayMs: options.retry?.baseDelayMs ?? RETRY_DEFAULTS.baseDelayMs,
      maxDelayMs: options.retry?.maxDelayMs ?? RETRY_DEFAULTS.maxDelayMs,
      retryStatuses: options.retry?.retryStatuses ?? RETRY_DEFAULTS.retryStatuses
    };
  }
  get baseUrl() {
    return this.#baseUrl;
  }
  get apiPrefix() {
    return this.#apiPrefix;
  }
  resolveUrl(path, query) {
    const url = new URL(`${this.#baseUrl}${this.#apiPrefix}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === void 0 || value === null || value === "") continue;
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }
  sessionCookie() {
    if (typeof this.#session === "function") return this.#session();
    return this.#session;
  }
  async request(options) {
    const url = this.resolveUrl(options.path, options.query);
    const headers = {
      accept: "application/json",
      ...this.#headers,
      ...options.headers
    };
    const cookie = this.sessionCookie();
    if (cookie) headers.cookie = cookie;
    if (options.json !== void 0) {
      headers["content-type"] = "application/json";
    }
    const signal = options.signal ?? this.#signal;
    const timeoutMs = options.requestTimeoutMs ?? this.#requestTimeoutMs;
    const timeoutSignal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : void 0;
    const combined = combineSignals(signal, timeoutSignal);
    const body = options.formData !== void 0 ? options.formData : options.json !== void 0 ? JSON.stringify(options.json) : void 0;
    const result = await withRetry(async () => {
      const res = await this.#fetch(url, {
        method: options.method,
        headers,
        ...body !== void 0 ? { body } : {},
        ...combined !== void 0 ? { signal: combined } : {}
      });
      return this.handleResponse(res, options, url);
    }, this.#retry);
    return result;
  }
  /**
   * Opens a GET and hands every `Uint8Array` chunk of the body to
   * `onChunk` as it arrives. Used by the SSE batch-stream endpoint.
   *
   * Resolves once the response body completes (or the signal aborts).
   */
  async stream(options) {
    const url = this.resolveUrl(options.path);
    const headers = {
      accept: "text/event-stream",
      ...this.#headers
    };
    const cookie = this.sessionCookie();
    if (cookie) headers.cookie = cookie;
    const expected = options.expectedStatus ?? isSuccessfulStatus;
    const signal = options.signal ?? this.#signal;
    const timeoutMs = options.requestTimeoutMs ?? 0;
    const timeoutSignal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : void 0;
    const combined = combineSignals(signal, timeoutSignal);
    const res = await this.#fetch(url, {
      method: "GET",
      headers,
      ...combined !== void 0 ? { signal: combined } : {}
    });
    const ok = typeof expected === "function" ? expected(res.status) : res.status === expected;
    if (!ok) {
      const text = await res.text();
      throw new VibesHttpError("GET", url, res.status, res.statusText, this.tryJson(text));
    }
    const body = res.body;
    if (body === null) return;
    const reader = body.getReader();
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) await options.onChunk(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  async handleResponse(res, options, url) {
    const expected = options.expectedStatus ?? isSuccessfulStatus;
    const ok = typeof expected === "function" ? expected(res.status) : res.status === expected;
    const text = await res.text();
    if (!ok) {
      throw new VibesHttpError(options.method, url, res.status, res.statusText, this.tryJson(text));
    }
    if (options.rawText) {
      return text;
    }
    const parsed = safeJsonParse(text);
    if (options.schema) {
      const result = options.schema.safeParse(parsed);
      if (!result.success) {
        throw new VibesValidationError(
          result.error.issues.map(
            (issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`
          ),
          parsed
        );
      }
      return result.data;
    }
    return parsed;
  }
  tryJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      return void 0;
    }
  }
};
function combineSignals(...signals) {
  const active = signals.filter((s) => s !== void 0);
  if (active.length === 0) return void 0;
  if (active.length === 1) return active[0];
  return AbortSignal.any(active);
}
function parseFirstJsonObject(text) {
  const stripped = text.trimStart();
  if (stripped.startsWith("{")) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < stripped.length; i++) {
      const ch = stripped[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const first = stripped.slice(0, i + 1);
          return safeJsonParse(first);
        }
      }
    }
  }
  throw new VibesParseError("No complete JSON object found in response", text);
}

// src/schemas/assets.ts
var import_zod3 = require("zod");

// src/schemas/common.ts
var import_zod2 = require("zod");
var UuidSchema = import_zod2.z.string().uuid({ message: "expected a UUID string" });
var MediaEntIdSchema = import_zod2.z.string().min(1, { message: "expected a media entity id" });
var ContentItemIdSchema = import_zod2.z.string().min(1);
var AspectRatioSchema = import_zod2.z.enum(["16:9", "9:16", "1:1", "4:3", "3:4"]);
var DimensionsSchema = import_zod2.z.object({
  width: import_zod2.z.number().int().positive(),
  height: import_zod2.z.number().int().positive()
});
var MediaReferenceSchema = import_zod2.z.object({
  mediaEntId: MediaEntIdSchema,
  imageEntId: MediaEntIdSchema.nullable(),
  videoUrl: import_zod2.z.string().url().nullable(),
  imageUrl: import_zod2.z.string().url().nullable()
});

// src/schemas/assets.ts
var AssetSchema = import_zod3.z.object({
  id: UuidSchema,
  projectId: UuidSchema,
  contentItemId: import_zod3.z.string().nullable(),
  relationship: import_zod3.z.enum(["created", "uploaded", "extended"]).catch("created"),
  sourceProjectId: UuidSchema.nullable(),
  isInTimeline: import_zod3.z.boolean(),
  addedAt: import_zod3.z.string(),
  type: import_zod3.z.enum(["videos", "images"]),
  imageUrl: import_zod3.z.string().url().nullable(),
  videoUrl: import_zod3.z.string().url().nullable(),
  imageHandle: import_zod3.z.null().nullable(),
  videoHandle: import_zod3.z.null().nullable(),
  prompt: import_zod3.z.string().nullable(),
  imagePrompt: import_zod3.z.string().nullable(),
  videoPrompt: import_zod3.z.string().nullable(),
  isFavorited: import_zod3.z.boolean(),
  isLoading: import_zod3.z.boolean(),
  error: import_zod3.z.string().nullable(),
  createdAt: import_zod3.z.string(),
  batchId: import_zod3.z.string().nullable().optional(),
  structuredOutput: import_zod3.z.object({
    config: import_zod3.z.unknown().nullable().optional(),
    metadata: import_zod3.z.object({
      dimensions: import_zod3.z.object({
        width: import_zod3.z.number().int().positive(),
        height: import_zod3.z.number().int().positive()
      }),
      aspectRatio: import_zod3.z.string()
    }).nullable().optional()
  }).nullable().optional(),
  orderIndex: import_zod3.z.number().int().nonnegative(),
  hasUploadedAncestor: import_zod3.z.boolean(),
  mediaEntId: MediaEntIdSchema.nullable(),
  data: import_zod3.z.object({
    videoGenEntId: MediaEntIdSchema.optional(),
    requestId: import_zod3.z.string(),
    imageEntId: MediaEntIdSchema.optional()
  }).nullable().optional()
});
var AssetsResponseSchema = import_zod3.z.object({
  success: import_zod3.z.boolean(),
  assets: import_zod3.z.array(AssetSchema),
  count: import_zod3.z.number().int().nonnegative()
});
var ProjectAssetItemSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  imageUrl: import_zod3.z.string().url().nullable(),
  videoUrl: import_zod3.z.string().url().nullable(),
  imageHandle: import_zod3.z.null().nullable(),
  videoHandle: import_zod3.z.null().nullable(),
  mediaEntId: MediaEntIdSchema,
  imageEntId: MediaEntIdSchema,
  prompt: import_zod3.z.string().nullable(),
  createdAt: import_zod3.z.string(),
  isFavorited: import_zod3.z.boolean(),
  projectId: UuidSchema,
  projectName: import_zod3.z.string(),
  projectThumbnailUrl: import_zod3.z.string().url().nullable(),
  relationship: import_zod3.z.string(),
  hasUploadedAncestor: import_zod3.z.boolean(),
  fromIngredientId: import_zod3.z.unknown().nullable()
});
var ProjectAssetsResponseSchema = import_zod3.z.object({
  projects: import_zod3.z.unknown().nullable(),
  items: import_zod3.z.array(ProjectAssetItemSchema)
});
var SyncResponseSchema = import_zod3.z.object({
  updatedAt: import_zod3.z.string()
});

// src/resources/assets.ts
var AssetsResource = class {
  constructor(http) {
    this.http = http;
  }
  http;
  /**
   * Rich asset list for a project (`GET /api/projects/:projectId/assets`).
   * The web app uses this endpoint to check extend status.
   */
  async list(projectId) {
    return this.http.request({
      method: "GET",
      path: `/projects/${projectId}/assets`,
      schema: AssetsResponseSchema
    });
  }
  /**
   * Flat, project-scoped asset items (`GET /api/project-assets`).
   */
  async listByProjectId(projectId, options = {}) {
    return this.http.request({
      method: "GET",
      path: "/project-assets",
      query: {
        project_id: projectId,
        limit: options.limit ?? 50,
        offset: options.offset ?? 0
      },
      schema: ProjectAssetsResponseSchema
    });
  }
  /**
   * Last-modified stamp for an entity (`GET /api/sync`).
   * Returns an opaque pipe-separated timestamp string.
   */
  async sync(entityType, entityId) {
    return this.http.request({
      method: "GET",
      path: "/sync",
      query: { entityType, entityId },
      schema: SyncResponseSchema
    });
  }
};

// src/schemas/auth.ts
var import_zod4 = require("zod");
var UserSchema = import_zod4.z.object({
  id: UuidSchema,
  username: import_zod4.z.string(),
  accountStatus: import_zod4.z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"]).catch("ACTIVE"),
  roles: import_zod4.z.array(import_zod4.z.string()),
  createdAt: import_zod4.z.string(),
  updatedAt: import_zod4.z.string(),
  abraUserId: import_zod4.z.string(),
  sessionId: UuidSchema.nullable(),
  kadabraProfile: import_zod4.z.object({
    id: UuidSchema,
    userId: UuidSchema,
    kadabraUserId: import_zod4.z.string(),
    incognitoAccess: import_zod4.z.enum(["NONE", "ALLOWED"]).catch("NONE"),
    kadabraProfileId: import_zod4.z.string(),
    kadabraProfileUsername: import_zod4.z.string().nullable(),
    kadabraProfilePictureURL: import_zod4.z.string().url().nullable(),
    createdAt: import_zod4.z.string(),
    updatedAt: import_zod4.z.string(),
    syncedAt: import_zod4.z.string().nullable(),
    dataSyncedAt: import_zod4.z.string().nullable()
  }).nullable()
});
var MeResponseSchema = import_zod4.z.object({
  user: UserSchema
});

// src/resources/auth.ts
var AuthResource = class {
  constructor(http) {
    this.http = http;
  }
  http;
  /** Returns the signed-in user (`GET /api/auth/me`). */
  async me() {
    return this.http.request({
      method: "GET",
      path: "/auth/me",
      schema: MeResponseSchema
    });
  }
  /** Validates the session token (`GET /api/auth/check-token`). */
  async checkToken() {
    return this.http.request({
      method: "GET",
      path: "/auth/check-token",
      schema: MeResponseSchema
    });
  }
};

// src/schemas/batches.ts
var import_zod5 = require("zod");
var SourceContentItemIdSchema = import_zod5.z.object({
  id: ContentItemIdSchema,
  source: import_zod5.z.string()
});
var DirectPromptImageHandleSchema = import_zod5.z.object({
  image_url: import_zod5.z.string().url(),
  image_ent_id: MediaEntIdSchema,
  source: import_zod5.z.string().optional()
});
var GenerationConfigSchema = import_zod5.z.object({
  directGeneration: import_zod5.z.boolean().optional(),
  promptModel: import_zod5.z.string().optional(),
  aspectRatio: AspectRatioSchema.optional(),
  imageModel: import_zod5.z.string().optional(),
  videoModel: import_zod5.z.string().optional(),
  resolution: import_zod5.z.string().optional(),
  batchVariation: import_zod5.z.boolean().optional(),
  generationType: import_zod5.z.string().optional(),
  sourceContentItemIds: import_zod5.z.array(SourceContentItemIdSchema).optional(),
  directPromptImageHandle: DirectPromptImageHandleSchema.nullable().optional(),
  lastFrameImageUrl: import_zod5.z.string().url().nullable().optional(),
  lastFrameImageEntId: MediaEntIdSchema.nullable().optional(),
  metadata: import_zod5.z.object({
    dimensions: DimensionsSchema,
    aspectRatio: AspectRatioSchema
  }).nullable().optional(),
  sourceVideoUrl: import_zod5.z.string().url().nullable().optional(),
  audioSourceUrl: import_zod5.z.string().url().nullable().optional(),
  extendDirective: import_zod5.z.string().nullable().optional()
});
var StructuredOutputSchema = import_zod5.z.object({
  config: GenerationConfigSchema.nullable().optional(),
  metadata: import_zod5.z.object({
    dimensions: DimensionsSchema,
    aspectRatio: AspectRatioSchema
  }).nullable().optional()
});
var BatchContentItemSchema = import_zod5.z.object({
  id: ContentItemIdSchema,
  batchId: import_zod5.z.string(),
  type: import_zod5.z.enum(["videos", "images"]),
  imageUrl: import_zod5.z.string().url().nullable(),
  videoUrl: import_zod5.z.string().url().nullable(),
  imageHandle: import_zod5.z.null().nullable(),
  videoHandle: import_zod5.z.null().nullable(),
  mediaEntId: MediaEntIdSchema.nullable(),
  prompt: import_zod5.z.string().nullable(),
  imagePrompt: import_zod5.z.string().nullable(),
  videoPrompt: import_zod5.z.string().nullable(),
  isFavorited: import_zod5.z.boolean(),
  isLoading: import_zod5.z.boolean(),
  error: import_zod5.z.string().nullable(),
  createdAt: import_zod5.z.string(),
  structuredOutput: StructuredOutputSchema.nullable(),
  orderIndex: import_zod5.z.number().int().nonnegative(),
  srefValues: import_zod5.z.unknown().nullable(),
  data: import_zod5.z.unknown().nullable(),
  canRetry: import_zod5.z.boolean().optional(),
  updatedAt: import_zod5.z.string(),
  hasUploadedAncestor: import_zod5.z.boolean(),
  // Rich association fields are only populated once the batch completes /
  // is listed; in-flight `GET /generation-batches/:id` responses omit them.
  contentItemId: import_zod5.z.string().nullable().optional(),
  projectId: UuidSchema.nullable().optional(),
  relationship: import_zod5.z.string().optional(),
  isInTimeline: import_zod5.z.boolean().optional(),
  sourceProjectId: UuidSchema.nullable().optional(),
  addedAt: import_zod5.z.string().optional(),
  // In-flight content items carry a few extra fields the list shape lacks.
  originProjectId: UuidSchema.nullable().optional(),
  thumbnailUrl: import_zod5.z.string().url().nullable().optional(),
  aspectRatio: import_zod5.z.number().nullable().optional(),
  // Completed extend batches report this as `null` on content items.
  sourceContentItemIds: import_zod5.z.array(SourceContentItemIdSchema).nullable().optional()
});
var GenerationBatchSchema = import_zod5.z.object({
  id: import_zod5.z.string(),
  userId: UuidSchema,
  projectId: UuidSchema.nullable(),
  type: import_zod5.z.enum(["videos", "images"]),
  prompt: import_zod5.z.string().nullable(),
  timestamp: import_zod5.z.string(),
  isComplete: import_zod5.z.boolean(),
  hasError: import_zod5.z.boolean(),
  error: import_zod5.z.string().nullable(),
  canRetry: import_zod5.z.boolean(),
  /** In-flight batches report `config: null`; completed ones carry the object. */
  config: GenerationConfigSchema.nullable(),
  systemPrompt: import_zod5.z.string().nullable(),
  promptModel: import_zod5.z.string().nullable(),
  imageModel: import_zod5.z.string().nullable(),
  videoModel: import_zod5.z.string().nullable(),
  bulkGenId: import_zod5.z.string().nullable(),
  generationStartTime: import_zod5.z.string().nullable(),
  generationEndTime: import_zod5.z.string().nullable(),
  creationContext: import_zod5.z.string(),
  createdAt: import_zod5.z.string(),
  updatedAt: import_zod5.z.string(),
  content: import_zod5.z.array(BatchContentItemSchema),
  /** Present in list responses; absent in PUT responses. */
  needsPolling: import_zod5.z.boolean().optional()
});
var BatchListResponseSchema = import_zod5.z.object({
  batches: import_zod5.z.array(GenerationBatchSchema),
  nextOffset: import_zod5.z.number().int().nonnegative().nullable()
});
var BatchCreateResponseSchema = import_zod5.z.object({
  batch: import_zod5.z.unknown().nullable(),
  id: import_zod5.z.string()
});
var BatchUpdateResponseSchema = import_zod5.z.object({
  batch: GenerationBatchSchema.extend({
    content: import_zod5.z.array(BatchContentItemSchema).optional()
  }).nullable()
});
var BatchGetResponseSchema = import_zod5.z.object({
  batch: GenerationBatchSchema.nullable()
});
var BatchStreamItemSchema = import_zod5.z.object({
  id: ContentItemIdSchema,
  /** Not always present; defaults to `videos` for generation batches. */
  type: import_zod5.z.enum(["videos", "images"]).optional(),
  isLoading: import_zod5.z.boolean(),
  videoUrl: import_zod5.z.string().url().nullable(),
  videoHandle: import_zod5.z.null().nullable(),
  imageUrl: import_zod5.z.string().url().nullable(),
  imageHandle: import_zod5.z.null().nullable(),
  /** `data` is an object early on, then becomes a JSON string. */
  data: import_zod5.z.unknown().nullable(),
  error: import_zod5.z.string().nullable()
});
var BatchStreamEventSchema = import_zod5.z.object({
  success: import_zod5.z.boolean(),
  isComplete: import_zod5.z.boolean(),
  items: import_zod5.z.array(BatchStreamItemSchema)
});

// src/resources/batches.ts
var BatchesResource = class {
  constructor(http) {
    this.http = http;
  }
  http;
  /** Lists batches for a project (`GET /api/projects/:projectId/batches`). */
  async list(projectId, options = {}) {
    return this.http.request({
      method: "GET",
      path: `/projects/${projectId}/batches`,
      query: { limit: options.limit ?? 25, offset: options.offset ?? 0 },
      schema: BatchListResponseSchema
    });
  }
  /** Fetches a single tracked batch (`GET /api/generation-batches/:batchId`). */
  async get(batchId2) {
    return this.http.request({
      method: "GET",
      path: `/generation-batches/${batchId2}`,
      schema: BatchGetResponseSchema
    });
  }
  /**
   * Streams batch progress over SSE (`GET /api/generation-batches/:batchId/stream`).
   *
   * The endpoint emits `data:` lines that repeat the full item state each
   * time something changes, ending with `isComplete: true` once every item
   * has resolved. Resolves once the stream fully closes.
   */
  async stream(batchId2, options = {}) {
    let buffer = "";
    const onChunk = async (chunk) => {
      buffer += new TextDecoder().decode(chunk);
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice("data:".length).trim();
        const parsed = payload !== "" ? safeJsonParse(payload) : void 0;
        if (parsed === void 0) continue;
        const result = BatchStreamEventSchema.safeParse(parsed);
        if (!result.success) {
          throw new VibesValidationError(
            result.error.issues.map(
              (issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`
            ),
            parsed
          );
        }
        await options.onEvent?.(result.data);
      }
    };
    await this.http.stream({
      path: `/generation-batches/${batchId2}/stream`,
      ...options.signal !== void 0 ? { signal: options.signal } : {},
      onChunk
    });
  }
  /**
   * Registers a batch for tracking (`POST /api/generation-batches`).
   *
   * Called immediately after `POST /api/generate/videos` with the batch
   * skeleton so the server starts reporting progress. The response is
   * sometimes two concatenated JSON blobs; both are parsed defensively.
   */
  async create(skeleton) {
    const text = await this.http.request({
      method: "POST",
      path: "/generation-batches",
      json: skeleton,
      rawText: true
    });
    return this.validateCreate(parseFirstJsonObject(text));
  }
  /** Updates the state of a batch (`PUT /api/generation-batches`). */
  async update(payload) {
    return this.http.request({
      method: "PUT",
      path: "/generation-batches",
      json: payload,
      schema: BatchUpdateResponseSchema
    });
  }
  validateCreate(parsed) {
    const result = BatchCreateResponseSchema.safeParse(parsed);
    if (!result.success) {
      throw new VibesValidationError(
        result.error.issues.map(
          (issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`
        ),
        parsed
      );
    }
    return result.data;
  }
};

// src/schemas/content-items.ts
var import_zod6 = require("zod");
var BulkDeletePayloadSchema = import_zod6.z.object({
  contentItemIds: import_zod6.z.array(ContentItemIdSchema).min(1),
  projectId: UuidSchema
});
var BulkDeleteResponseSchema = import_zod6.z.object({
  deletedItems: import_zod6.z.number().int().nonnegative(),
  removedFromProject: import_zod6.z.number().int().nonnegative()
});

// src/resources/content-items.ts
var ContentItemsResource = class {
  constructor(http) {
    this.http = http;
  }
  http;
  /**
   * Bulk-deletes content items from a project (`DELETE /api/content-items/bulk-delete`).
   *
   * Content item ids are the `contentItemId` values on assets and batch
   * entries (e.g. generated-video content items). Deletion is idempotent.
   */
  async bulkDelete(projectId, contentItemIds) {
    return this.http.request({
      method: "DELETE",
      path: "/content-items/bulk-delete",
      json: BulkDeletePayloadSchema.parse({ projectId, contentItemIds }),
      schema: BulkDeleteResponseSchema
    });
  }
};

// src/schemas/media.ts
var import_zod7 = require("zod");
var UploadMediaResponseSchema = import_zod7.z.object({
  mediaEntId: MediaEntIdSchema,
  cdnUrl: import_zod7.z.string().url(),
  dimensions: DimensionsSchema,
  aspectRatio: AspectRatioSchema,
  uploadToken: import_zod7.z.string()
});
var ProjectUploadFileSchema = import_zod7.z.object({
  mediaEntId: MediaEntIdSchema,
  uploadToken: import_zod7.z.string(),
  cdnUrl: import_zod7.z.string().url(),
  filename: import_zod7.z.string(),
  dimensions: DimensionsSchema,
  aspectRatio: AspectRatioSchema
});
var ProjectUploadRequestSchema = import_zod7.z.object({
  files: import_zod7.z.array(ProjectUploadFileSchema).min(1)
});
var ProjectUploadedContentItemSchema = import_zod7.z.object({
  id: import_zod7.z.string().min(1),
  type: import_zod7.z.literal("images"),
  imageUrl: import_zod7.z.string().url().nullable(),
  videoUrl: import_zod7.z.string().url().nullable()
});
var ProjectUploadResponseSchema = import_zod7.z.object({
  success: import_zod7.z.boolean(),
  contentItems: import_zod7.z.array(ProjectUploadedContentItemSchema),
  count: import_zod7.z.number().int().nonnegative()
});

// src/resources/media.ts
function toBlob(file, contentType) {
  const props = contentType !== void 0 ? { type: contentType } : {};
  if (file instanceof Blob) {
    return contentType ? new Blob([file], props) : file;
  }
  if (file instanceof ArrayBuffer || ArrayBuffer.isView(file)) {
    return new Blob([file], props);
  }
  if (file instanceof ReadableStream) {
    throw new TypeError(
      "ReadableStream uploads are not supported; pass a Blob, Buffer or Uint8Array"
    );
  }
  return new Blob([file], props);
}
function defaultContentType(filename) {
  if (!filename) return void 0;
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    default:
      return void 0;
  }
}
var MediaResource = class {
  constructor(http) {
    this.http = http;
  }
  http;
  /**
   * Uploads an image or video. The returned `mediaEntId` / `cdnUrl` are the
   * start-frame inputs for t2v generation.
   */
  async upload(file, options = {}) {
    const contentType = options.contentType ?? defaultContentType(options.filename);
    const form = new FormData();
    form.append("file", toBlob(file, contentType), options.filename);
    return this.http.request({
      method: "POST",
      path: "/upload-media",
      formData: form,
      schema: UploadMediaResponseSchema,
      // Uploads are larger and slower; give them a generous default.
      requestTimeoutMs: 5 * 6e4
    });
  }
  /**
   * Associates uploaded media with a project (`POST /api/projects/:id/upload`).
   *
   * This is the second half of the upload flow: after `upload()` returns a
   * media reference, calling this attaches the file to the project so it
   * becomes a project content item (the `contentItems[].id` returned here is
   * the value to pass as the start frame's `contentItemId` for t2v).
   */
  async attachToProject(projectId, files) {
    const body = ProjectUploadRequestSchema.parse({ files });
    return this.http.request({
      method: "POST",
      path: `/projects/${projectId}/upload`,
      json: body,
      schema: ProjectUploadResponseSchema
    });
  }
  /**
   * Uploads a file and attaches it to a project in one call.
   *
   * Returns both the raw upload result and the attached content items. The
   * first content item's `id` is the start-frame `contentItemId` to pass to
   * `videos.generateAndWait` / `videos.extendAndWait`.
   */
  async uploadToProject(projectId, file, options = {}) {
    const upload = await this.upload(file, options);
    const attach = await this.attachToProject(projectId, [
      {
        mediaEntId: upload.mediaEntId,
        uploadToken: upload.uploadToken,
        cdnUrl: upload.cdnUrl,
        filename: options.filename ?? `upload-${Date.now()}.png`,
        dimensions: upload.dimensions,
        aspectRatio: upload.aspectRatio
      }
    ]);
    return { upload, attach };
  }
};

// src/schemas/projects.ts
var import_zod8 = require("zod");
var ProjectSummarySchema = import_zod8.z.object({
  id: UuidSchema,
  name: import_zod8.z.string(),
  thumbnailUrl: import_zod8.z.string().url().nullable(),
  exportStatus: import_zod8.z.string(),
  createdAt: import_zod8.z.string(),
  updatedAt: import_zod8.z.string(),
  isShared: import_zod8.z.boolean()
});
var ProjectPageSchema = import_zod8.z.object({
  count: import_zod8.z.number().int().nonnegative(),
  hasMore: import_zod8.z.boolean(),
  nextOffset: import_zod8.z.number().int().nonnegative().nullable()
});
var ProjectListResponseSchema = import_zod8.z.object({
  success: import_zod8.z.boolean(),
  projects: import_zod8.z.array(ProjectSummarySchema),
  page: ProjectPageSchema
});
var CompositionSchema = import_zod8.z.object({
  id: import_zod8.z.string(),
  tracks: import_zod8.z.array(import_zod8.z.unknown()),
  duration: import_zod8.z.number()
});
var ProjectSchema = import_zod8.z.object({
  id: UuidSchema,
  userId: UuidSchema,
  name: import_zod8.z.string(),
  composition: CompositionSchema,
  exportStatus: import_zod8.z.string(),
  createdAt: import_zod8.z.string(),
  updatedAt: import_zod8.z.string()
});
var ProjectCreateResponseSchema = import_zod8.z.object({
  success: import_zod8.z.boolean(),
  project: ProjectSchema
});
var ProjectDeleteResponseSchema = import_zod8.z.object({
  success: import_zod8.z.boolean(),
  message: import_zod8.z.string(),
  deletedOrphanCount: import_zod8.z.number().int().nonnegative()
});

// src/resources/projects.ts
var ProjectsResource = class {
  constructor(http) {
    this.http = http;
  }
  http;
  /** Lists the signed-in user's projects. */
  async list(options = {}) {
    return this.http.request({
      method: "GET",
      path: "/projects",
      query: {
        limit: options.limit ?? 25,
        offset: options.offset ?? 0,
        sort: options.sort ?? "newest"
      },
      schema: ProjectListResponseSchema
    });
  }
  /** Creates a new project. */
  async create(name) {
    return this.http.request({
      method: "POST",
      path: "/projects",
      json: { name },
      schema: ProjectCreateResponseSchema
    });
  }
  /**
   * Deletes a project (`DELETE /api/projects/:projectId`).
   *
   * With `deleteAssets: true` the server also removes assets that are only
   * referenced by this project, so a test project can be cleaned up entirely.
   */
  async delete(projectId, options = {}) {
    return this.http.request({
      method: "DELETE",
      path: `/projects/${projectId}`,
      query: { deleteAssets: options.deleteAssets ?? true },
      schema: ProjectDeleteResponseSchema
    });
  }
};

// src/ids.ts
var import_node_crypto = require("crypto");
function uuidv7() {
  const bytes = (0, import_node_crypto.randomBytes)(16);
  const now = BigInt(Date.now());
  let ts = now;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = Number(ts & 0xffn);
    ts >>= 8n;
  }
  bytes[6] = bytes[6] & 15 | 112;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = bytes.toString("hex");
  return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
}
function batchId() {
  return `batch-${uuidv7()}`;
}
function extendBatchId(now = /* @__PURE__ */ new Date()) {
  const rand = (0, import_node_crypto.randomBytes)(4).toString("hex");
  return `extend-${now.getTime()}-${rand}`;
}
function mgRequestId() {
  return `www-${uuidv7()}`;
}
function contentItemId(batchId2, index) {
  return `${batchId2}-content-${index}`;
}

// src/polling/wait-for.ts
async function waitFor(options) {
  const intervalMs = options.intervalMs ?? POLL_DEFAULTS.intervalMs;
  const timeoutMs = options.timeoutMs ?? POLL_DEFAULTS.timeoutMs;
  const jitterMs = options.jitterMs ?? POLL_DEFAULTS.jitterMs;
  const deadline = Date.now() + timeoutMs;
  let lastState;
  for (; ; ) {
    const state = await options.fetch();
    lastState = state;
    options.onPoll?.(state);
    if (options.isDone(state)) return state;
    if (Date.now() >= deadline) {
      throw new VibesPollTimeoutError(timeoutMs, lastState, options.description);
    }
    if (options.signal?.aborted) {
      throw options.signal.reason instanceof Error ? options.signal.reason : new DOMException("Polling aborted", "AbortError");
    }
    await sleep(intervalMs + jitter(jitterMs));
  }
}

// src/schemas/generation.ts
var import_zod9 = require("zod");
var T2VBaseConfigSchema = import_zod9.z.object({
  directGeneration: import_zod9.z.literal(true),
  promptModel: import_zod9.z.string(),
  aspectRatio: AspectRatioSchema,
  imageModel: import_zod9.z.string(),
  videoModel: import_zod9.z.string(),
  resolution: import_zod9.z.string(),
  batchVariation: import_zod9.z.boolean()
});
var T2VFrameConfigSchema = T2VBaseConfigSchema.extend({
  sourceContentItemIds: import_zod9.z.array(SourceContentItemIdSchema),
  directPromptImageHandle: DirectPromptImageHandleSchema,
  lastFrameImageUrl: import_zod9.z.string().url().optional(),
  lastFrameImageEntId: MediaEntIdSchema.optional()
});
var T2VGenerateInputSchema = import_zod9.z.discriminatedUnion("type", [
  import_zod9.z.object({
    type: import_zod9.z.literal("image"),
    imageUrl: import_zod9.z.string().url(),
    imageEntId: MediaEntIdSchema,
    prompt: import_zod9.z.string(),
    originalPrompt: import_zod9.z.string(),
    config: T2VFrameConfigSchema
  }),
  import_zod9.z.object({
    type: import_zod9.z.literal("prompt"),
    value: import_zod9.z.string(),
    original_prompt: import_zod9.z.string(),
    config: T2VBaseConfigSchema
  })
]);
var T2VGenerateRequestSchema = import_zod9.z.object({
  inputs: import_zod9.z.array(T2VGenerateInputSchema).min(1),
  config: T2VBaseConfigSchema.extend({
    generationType: import_zod9.z.literal("t2v"),
    sourceContentItemIds: import_zod9.z.array(SourceContentItemIdSchema).optional(),
    directPromptImageHandle: DirectPromptImageHandleSchema.optional(),
    lastFrameImageUrl: import_zod9.z.string().url().optional(),
    lastFrameImageEntId: MediaEntIdSchema.optional()
  }),
  batchId: import_zod9.z.string(),
  mg_request_id: import_zod9.z.string(),
  projectId: UuidSchema
});
var ExtendGenerateInputSchema = import_zod9.z.object({
  type: import_zod9.z.literal("extend"),
  mediaEntId: MediaEntIdSchema,
  videoUrl: import_zod9.z.string().url(),
  prompt: import_zod9.z.string(),
  extendDirective: import_zod9.z.string().optional(),
  config: import_zod9.z.object({
    metadata: import_zod9.z.object({
      dimensions: DimensionsSchema,
      aspectRatio: AspectRatioSchema
    }),
    videoModel: import_zod9.z.string(),
    imageModel: import_zod9.z.string(),
    generationType: import_zod9.z.literal("extend"),
    sourceVideoUrl: import_zod9.z.string().url(),
    audioSourceUrl: import_zod9.z.string().url().optional(),
    directGeneration: import_zod9.z.literal(true),
    sourceContentItemIds: import_zod9.z.array(SourceContentItemIdSchema),
    extendDirective: import_zod9.z.string().optional()
  })
});
var ExtendGenerateRequestSchema = import_zod9.z.object({
  inputs: import_zod9.z.array(ExtendGenerateInputSchema).min(1),
  config: ExtendGenerateInputSchema.shape.config,
  batchId: import_zod9.z.string(),
  mg_request_id: import_zod9.z.string(),
  projectId: UuidSchema
});
var GenerateVideosResponseSchema = import_zod9.z.object({
  success: import_zod9.z.boolean(),
  batchId: import_zod9.z.string(),
  videoGenEntIds: import_zod9.z.array(MediaEntIdSchema),
  needsPolling: import_zod9.z.boolean(),
  hasPartialErrors: import_zod9.z.boolean(),
  items: import_zod9.z.array(
    import_zod9.z.object({
      id: ContentItemIdSchema,
      imageUrl: import_zod9.z.string().url().nullable(),
      isLoading: import_zod9.z.boolean(),
      error: import_zod9.z.string().nullable()
    })
  )
});
var BatchSkeletonSchema = import_zod9.z.object({
  id: import_zod9.z.string(),
  type: import_zod9.z.enum(["videos", "images"]),
  prompt: import_zod9.z.string(),
  timestamp: import_zod9.z.string(),
  content: import_zod9.z.array(
    import_zod9.z.object({
      id: ContentItemIdSchema,
      type: import_zod9.z.enum(["videos", "images"]),
      isLoading: import_zod9.z.boolean()
    })
  ),
  isComplete: import_zod9.z.literal(false),
  config: import_zod9.z.unknown(),
  promptModel: import_zod9.z.string().optional(),
  imageModel: import_zod9.z.string().optional(),
  videoModel: import_zod9.z.string().optional(),
  generationStartTime: import_zod9.z.string().optional(),
  isDirectGeneration: import_zod9.z.literal(true).optional(),
  projectId: UuidSchema.optional()
});
var BatchUpdatePayloadSchema = import_zod9.z.object({
  id: import_zod9.z.string(),
  content: import_zod9.z.array(
    import_zod9.z.object({
      id: ContentItemIdSchema,
      type: import_zod9.z.enum(["videos", "images"]),
      isLoading: import_zod9.z.boolean(),
      videoUrl: import_zod9.z.string().url().nullable(),
      videoHandle: import_zod9.z.unknown().nullable(),
      imageUrl: import_zod9.z.string().url().nullable(),
      imageHandle: import_zod9.z.unknown().nullable(),
      /** Note: serialized as a JSON *string* in the PUT body. */
      data: import_zod9.z.string().nullable(),
      error: import_zod9.z.string().nullable()
    })
  ),
  isComplete: import_zod9.z.boolean(),
  generationEndTime: import_zod9.z.string()
});

// src/utils/aspect-ratio.ts
var RATIOS = [
  { ratio: "16:9", width: 16, height: 9 },
  { ratio: "9:16", width: 9, height: 16 },
  { ratio: "1:1", width: 1, height: 1 }
];
function dimensionsToAspectRatio(dimensions) {
  if (dimensions.width <= 0 || dimensions.height <= 0) {
    return ASPECT_RATIO["9:16"];
  }
  const input = dimensions.width / dimensions.height;
  let best = RATIOS[1];
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const candidate of RATIOS) {
    const delta = Math.abs(candidate.width / candidate.height - input);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = candidate;
    }
  }
  return best.ratio;
}
function resolveAspectRatio(dimensions, requested) {
  if (dimensions) {
    return dimensionsToAspectRatio(dimensions);
  }
  return requested ?? ASPECT_RATIO["9:16"];
}

// src/resources/videos.ts
var VideosResource = class {
  constructor(http, batches, assets) {
    this.http = http;
    this.batches = batches;
    this.assets = assets;
  }
  http;
  batches;
  assets;
  /**
   * Submits a text-to-video generation from a start frame and registers the
   * batch for tracking. Does not wait for completion — use `generateAndWait`.
   *
   * The skeleton is registered *before* `POST /generate/videos` (matching the
   * browser flow): a generation submitted for an unregistered batch is
   * materialized as a detached epoch-suffixed media item, leaving an
   * unresolved "pending" strip on the project timeline. Registering first
   * makes the server place the output directly on the registered content
   * slots.
   */
  async generateT2V(options) {
    const request = this.buildT2VRequest(options);
    await this.registerBatch(
      request.batchId,
      options.projectId,
      options.prompt,
      request.config,
      options.variations,
      request.config.promptModel,
      request.config.imageModel,
      request.config.videoModel
    );
    return this.http.request({
      method: "POST",
      path: "/generate/videos",
      json: request,
      schema: GenerateVideosResponseSchema
    });
  }
  /**
   * Submits a video extension and registers the batch for tracking.
   * Does not wait for completion — use `extendAndWait`.
   */
  async generateExtend(options) {
    const request = this.buildExtendRequest(options);
    await this.registerBatch(
      request.batchId,
      options.projectId,
      options.prompt,
      request.config,
      0,
      request.config.videoModel,
      request.config.imageModel,
      request.config.videoModel
    );
    return this.http.request({
      method: "POST",
      path: "/generate/videos",
      json: request,
      schema: GenerateVideosResponseSchema
    });
  }
  /**
   * Generates videos from a start frame and polls until the batch completes.
   * Returns the completed batch and its finished video content items.
   */
  async generateAndWait(options, poll = {}) {
    const submitted = await this.generateT2V(options);
    return this.waitForBatch(submitted.batchId, poll);
  }
  /**
   * Extends a video and polls until the new asset is ready.
   */
  async extendAndWait(options, poll = {}) {
    const submitted = await this.generateExtend(options);
    return this.waitForExtendAsset(options.projectId, submitted.batchId, poll);
  }
  /**
   * Repeatedly extends a video until it reaches `targetSeconds`.
   *
   * Fresh generations are 5s; every extend adds 4s. Returns the final video
   * asset and the resulting total duration.
   */
  async extendToDuration(options) {
    if (options.targetSeconds <= 0) {
      throw new RangeError("targetSeconds must be positive");
    }
    if (!options.source.videoUrl) {
      throw new TypeError("extendToDuration requires a source videoUrl");
    }
    let source = options.source;
    let total = options.sourceDurationSeconds ?? GENERATED_VIDEO_DURATION_S;
    let extensions = 0;
    let video;
    while (total < options.targetSeconds) {
      const result = await this.extendAndWait(
        {
          projectId: options.projectId,
          prompt: options.prompt,
          source,
          ...options.extendDirective !== void 0 ? { extendDirective: options.extendDirective } : {},
          ...options.audioSourceUrl !== void 0 ? { audioSourceUrl: options.audioSourceUrl } : {},
          ...options.videoModel !== void 0 ? { videoModel: options.videoModel } : {},
          ...options.imageModel !== void 0 ? { imageModel: options.imageModel } : {}
        },
        options.poll
      );
      video = result.video;
      source = {
        mediaEntId: result.video.mediaEntId ?? result.video.id,
        videoUrl: result.video.videoUrl,
        ...result.video.contentItemId !== null ? { contentItemId: result.video.contentItemId } : {},
        ...result.video.structuredOutput?.metadata != null ? {
          metadata: {
            dimensions: result.video.structuredOutput.metadata.dimensions,
            aspectRatio: dimensionsToAspectRatio(
              result.video.structuredOutput.metadata.dimensions
            )
          }
        } : {}
      };
      total += EXTEND_VIDEO_DURATION_INCREMENT_S;
      extensions += 1;
      options.onExtend?.({ video: result.video, totalDurationSeconds: total, extensions });
    }
    return {
      video,
      totalDurationSeconds: total,
      extensions
    };
  }
  /** Polls the generation-batches endpoint until the batch completes. */
  async waitForBatch(batchId2, poll = {}) {
    const { batch } = poll.stream ? await this.waitForBatchStream(batchId2, poll) : await waitFor({
      description: batchId2,
      ...poll,
      fetch: () => this.batches.get(batchId2),
      isDone: (state) => state.batch !== null && (state.batch.isComplete || state.batch.hasError)
    });
    if (batch === null) {
      throw new Error(`Batch ${batchId2} not found`);
    }
    const videos = batch.content.filter(
      (item) => item.type === "videos" && item.videoUrl !== null && item.error === null
    );
    if (batch.hasError && videos.length === 0) {
      throw new Error(`Batch ${batchId2} failed: ${batch.error ?? "unknown error"}`);
    }
    if (!poll.stream) {
      await this.batches.update(toUpdatePayload(batch));
    }
    return { batch, videos };
  }
  /** Stream variant of `waitForBatch`: consumes SSE until the stream closes. */
  async waitForBatchStream(batchId2, poll) {
    const timeoutMs = poll.timeoutMs ?? POLL_DEFAULTS.timeoutMs;
    const deadline = Date.now() + timeoutMs;
    const events = [];
    try {
      await this.batches.stream(batchId2, {
        ...poll.signal !== void 0 ? { signal: poll.signal } : {},
        onEvent: (event) => {
          events.push(event);
          poll.onPoll?.(event);
          if (Date.now() >= deadline) {
            throw new VibesPollTimeoutError(
              timeoutMs,
              events[events.length - 1],
              `stream ${batchId2}`
            );
          }
        }
      });
    } catch (err) {
      if (err instanceof VibesPollTimeoutError) throw err;
      if (poll.signal?.aborted) {
        throw poll.signal.reason instanceof Error ? poll.signal.reason : new DOMException("Stream aborted", "AbortError");
      }
      throw err;
    }
    const lastEvent = events[events.length - 1];
    if (lastEvent === void 0 || !lastEvent.isComplete) {
      throw new VibesPollTimeoutError(timeoutMs, lastEvent, `stream ${batchId2}`);
    }
    await this.batches.update(streamFinalizePayload(batchId2, lastEvent.items));
    return waitFor({
      description: batchId2,
      ...poll,
      fetch: () => this.batches.get(batchId2),
      isDone: (state) => state.batch !== null && (state.batch.isComplete || state.batch.hasError)
    });
  }
  /**
   * Waits for the batch to finish, finalizes it (PUT), then resolves the
   * resulting video asset from the project's asset list.
   */
  async waitForExtendAsset(projectId, batchId2, poll = {}) {
    const { batch } = poll.stream ? await this.waitForBatchStream(batchId2, poll) : await waitFor({
      description: batchId2,
      ...poll,
      fetch: () => this.batches.get(batchId2),
      isDone: (state) => state.batch !== null && (state.batch.isComplete || state.batch.hasError)
    });
    if (batch === null) {
      throw new Error(`Batch ${batchId2} not found`);
    }
    if (!poll.stream) {
      await this.batches.update(toUpdatePayload(batch));
    }
    const assets = await waitFor({
      description: `${batchId2} asset`,
      ...poll,
      fetch: () => this.assets.list(projectId),
      isDone: (state) => state.assets.some(
        (asset) => asset.batchId === batchId2 && asset.type === "videos" && asset.videoUrl !== null
      )
    });
    const video = assets.assets.find(
      (asset) => asset.batchId === batchId2 && asset.type === "videos" && asset.videoUrl !== null
    );
    if (!video) {
      return { video: { batchId: batchId2, ...batchContentToAsset(batch) } };
    }
    return { video };
  }
  // ----------------------------------------------------------------------
  // Request builders
  // ----------------------------------------------------------------------
  buildT2VRequest(options) {
    const frame = options.startFrame;
    const ratio = resolveAspectRatio(frame?.dimensions, options.aspectRatio);
    const baseConfig = {
      directGeneration: true,
      promptModel: options.promptModel ?? PROMPT_MODEL,
      aspectRatio: ratio,
      imageModel: options.imageModel ?? IMAGE_MODEL,
      videoModel: options.videoModel ?? VIDEO_MODEL.SHORT,
      resolution: options.resolution ?? RESOLUTION,
      batchVariation: options.batchVariation ?? true
    };
    const sourceContentItemIds = [];
    if (frame?.contentItemId) {
      sourceContentItemIds.push({
        id: frame.contentItemId,
        source: SOURCE_ROLE.START_FRAME
      });
    }
    if (options.endFrame?.contentItemId) {
      sourceContentItemIds.push({
        id: options.endFrame.contentItemId,
        source: SOURCE_ROLE.END_FRAME
      });
    }
    const variations = Math.max(1, options.variations ?? DEFAULT_VARIATION_COUNT);
    const id = batchId();
    const handle = () => ({
      image_url: frame.imageUrl,
      image_ent_id: frame.imageEntId,
      source: "asset"
    });
    const inputs = Array.from(
      { length: variations },
      () => frame ? {
        type: "image",
        imageUrl: frame.imageUrl,
        imageEntId: frame.imageEntId,
        prompt: options.prompt,
        originalPrompt: options.prompt,
        config: {
          ...baseConfig,
          sourceContentItemIds,
          directPromptImageHandle: handle(),
          ...options.endFrame?.imageUrl !== void 0 ? { lastFrameImageUrl: options.endFrame.imageUrl } : {},
          ...options.endFrame?.imageEntId !== void 0 ? { lastFrameImageEntId: options.endFrame.imageEntId } : {}
        }
      } : {
        type: "prompt",
        value: options.prompt,
        original_prompt: options.prompt,
        config: baseConfig
      }
    );
    const topConfig = {
      ...baseConfig,
      generationType: GENERATION_TYPE.T2V
    };
    if (frame) {
      topConfig.sourceContentItemIds = sourceContentItemIds;
      topConfig.directPromptImageHandle = handle();
    }
    if (options.endFrame?.imageUrl !== void 0) {
      topConfig.lastFrameImageUrl = options.endFrame.imageUrl;
    }
    if (options.endFrame?.imageEntId !== void 0) {
      topConfig.lastFrameImageEntId = options.endFrame.imageEntId;
    }
    const request = {
      inputs,
      config: topConfig,
      batchId: id,
      mg_request_id: mgRequestId(),
      projectId: options.projectId
    };
    return T2VGenerateRequestSchema.parse(request);
  }
  buildExtendRequest(options) {
    const metadata = options.source.metadata ?? {
      dimensions: { width: 720, height: 1280 },
      aspectRatio: "9:16"
    };
    const sourceContentItemIds = options.source.contentItemId ? [{ id: options.source.contentItemId, source: SOURCE_ROLE.EXTEND_VIDEO }] : [];
    const config = {
      metadata,
      videoModel: options.videoModel ?? VIDEO_MODEL.EXTEND,
      imageModel: options.imageModel ?? IMAGE_MODEL,
      generationType: GENERATION_TYPE.EXTEND,
      sourceVideoUrl: options.source.videoUrl,
      ...options.audioSourceUrl !== void 0 ? { audioSourceUrl: options.audioSourceUrl } : { audioSourceUrl: options.source.videoUrl },
      directGeneration: true,
      sourceContentItemIds,
      ...options.extendDirective !== void 0 ? { extendDirective: options.extendDirective } : {}
    };
    const request = {
      inputs: [
        {
          type: "extend",
          mediaEntId: options.source.mediaEntId,
          videoUrl: options.source.videoUrl,
          prompt: options.prompt,
          ...options.extendDirective !== void 0 ? { extendDirective: options.extendDirective } : {},
          config
        }
      ],
      config,
      batchId: extendBatchId(),
      mg_request_id: mgRequestId(),
      projectId: options.projectId
    };
    return ExtendGenerateRequestSchema.parse(request);
  }
  async registerBatch(id, projectId, prompt, config, variations, promptModel, imageModel, videoModel) {
    const count = Math.max(0, variations ?? DEFAULT_VARIATION_COUNT);
    const skeleton = BatchSkeletonSchema.parse({
      id,
      type: "videos",
      prompt,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      content: Array.from({ length: count }, (_, i) => ({
        id: contentItemId(id, i),
        type: "videos",
        isLoading: true
      })),
      isComplete: false,
      config,
      promptModel,
      imageModel,
      videoModel,
      generationStartTime: (/* @__PURE__ */ new Date()).toISOString(),
      isDirectGeneration: true,
      projectId
    });
    await this.batches.create(skeleton);
  }
};
function toUpdatePayload(batch) {
  return {
    id: batch.id,
    content: batch.content.map((item) => ({
      id: item.id,
      type: item.type,
      isLoading: item.isLoading,
      videoUrl: item.videoUrl,
      videoHandle: item.videoHandle,
      imageUrl: item.imageUrl,
      imageHandle: item.imageHandle,
      data: stringifyData(item.data),
      error: item.error
    })),
    isComplete: batch.isComplete,
    generationEndTime: batch.generationEndTime ?? (/* @__PURE__ */ new Date()).toISOString()
  };
}
function streamFinalizePayload(batchId2, items) {
  const byBase = /* @__PURE__ */ new Map();
  for (const item of items) {
    const base = stripEpochSuffix(item.id);
    const settled = !item.isLoading && (item.videoUrl !== null || item.error !== null);
    if (settled || !byBase.has(base)) {
      byBase.set(base, item);
    }
  }
  return {
    id: batchId2,
    content: [...byBase.values()].map((item) => ({
      id: stripEpochSuffix(item.id),
      type: item.type ?? "videos",
      isLoading: false,
      videoUrl: item.videoUrl,
      videoHandle: item.videoHandle,
      imageUrl: item.imageUrl,
      imageHandle: item.imageHandle,
      data: stringifyData(item.data),
      error: item.error
    })),
    isComplete: true,
    generationEndTime: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function stripEpochSuffix(id) {
  return id.replace(/(-content-\d+)-(\d+)$/, "$1");
}
function stringifyData(data) {
  if (typeof data === "string") return data;
  if (data === null || data === void 0) return null;
  return JSON.stringify(data);
}
function batchContentToAsset(batch) {
  const item = batch.content.find((c) => c.type === "videos" && c.videoUrl);
  return {
    batchId: batch.id,
    type: "videos",
    videoUrl: item?.videoUrl ?? null,
    imageUrl: item?.imageUrl ?? null,
    contentItemId: item?.contentItemId ?? null,
    mediaEntId: item?.mediaEntId ?? null,
    videoHandle: item?.videoHandle ?? null,
    prompt: item?.videoPrompt ?? item?.prompt ?? null,
    structuredOutput: item?.structuredOutput ?? null,
    relationship: "created"
  };
}

// src/client.ts
var VibesClient = class {
  http;
  auth;
  projects;
  media;
  assets;
  batches;
  videos;
  contentItems;
  constructor(options = {}) {
    this.http = new HttpClient(options);
    this.auth = new AuthResource(this.http);
    this.projects = new ProjectsResource(this.http);
    this.media = new MediaResource(this.http);
    this.assets = new AssetsResource(this.http);
    this.batches = new BatchesResource(this.http);
    this.videos = new VideosResource(this.http, this.batches, this.assets);
    this.contentItems = new ContentItemsResource(this.http);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_BASE_URL,
  API_PREFIX,
  ASPECT_RATIO,
  AspectRatioSchema,
  AssetSchema,
  AssetsResource,
  AssetsResponseSchema,
  AuthResource,
  BatchContentItemSchema,
  BatchCreateResponseSchema,
  BatchGetResponseSchema,
  BatchListResponseSchema,
  BatchSkeletonSchema,
  BatchStreamEventSchema,
  BatchStreamItemSchema,
  BatchUpdatePayloadSchema,
  BatchUpdateResponseSchema,
  BatchesResource,
  BulkDeletePayloadSchema,
  BulkDeleteResponseSchema,
  CompositionSchema,
  ContentItemIdSchema,
  ContentItemsResource,
  DEFAULT_RETRY_OPTIONS,
  DEFAULT_VARIATION_COUNT,
  DimensionsSchema,
  DirectPromptImageHandleSchema,
  EXTEND_VIDEO_DURATION_INCREMENT_S,
  ExtendGenerateInputSchema,
  ExtendGenerateRequestSchema,
  GENERATED_VIDEO_DURATION_S,
  GENERATION_TYPE,
  GenerateVideosResponseSchema,
  GenerationBatchSchema,
  GenerationConfigSchema,
  HttpClient,
  IMAGE_MODEL,
  MeResponseSchema,
  MediaEntIdSchema,
  MediaReferenceSchema,
  MediaResource,
  POLL_DEFAULTS,
  PROMPT_MODEL,
  ProjectAssetItemSchema,
  ProjectAssetsResponseSchema,
  ProjectCreateResponseSchema,
  ProjectDeleteResponseSchema,
  ProjectListResponseSchema,
  ProjectPageSchema,
  ProjectSchema,
  ProjectSummarySchema,
  ProjectUploadFileSchema,
  ProjectUploadRequestSchema,
  ProjectUploadResponseSchema,
  ProjectUploadedContentItemSchema,
  ProjectsResource,
  RESOLUTION,
  RETRY_DEFAULTS,
  SOURCE_ROLE,
  SourceContentItemIdSchema,
  StructuredOutputSchema,
  SyncResponseSchema,
  T2VBaseConfigSchema,
  T2VFrameConfigSchema,
  T2VGenerateInputSchema,
  T2VGenerateRequestSchema,
  UploadMediaResponseSchema,
  UserSchema,
  UuidSchema,
  VIDEO_MODEL,
  VibesClient,
  VibesError,
  VibesHttpError,
  VibesParseError,
  VibesPollTimeoutError,
  VibesValidationError,
  VideosResource,
  batchId,
  contentItemId,
  dimensionsToAspectRatio,
  extendBatchId,
  mgRequestId,
  parseFirstJsonObject,
  resolveAspectRatio,
  uuidv7,
  waitFor,
  withRetry
});
//# sourceMappingURL=index.cjs.map