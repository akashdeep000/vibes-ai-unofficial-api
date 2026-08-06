// src/http/http-client.ts
import "zod";

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
var VibesAuthError = class extends VibesError {
  constructor(message, options) {
    super(message, options);
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
  async sessionCookie() {
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
    const cookie = await this.sessionCookie();
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
    const cookie = await this.sessionCookie();
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
import { z as z2 } from "zod";

// src/schemas/common.ts
import { z } from "zod";
var UuidSchema = z.string().uuid({ message: "expected a UUID string" });
var MediaEntIdSchema = z.string().min(1, { message: "expected a media entity id" });
var ContentItemIdSchema = z.string().min(1);
var AspectRatioSchema = z.enum(["16:9", "9:16", "1:1", "4:3", "3:4"]);
var DimensionsSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive()
});
var MediaReferenceSchema = z.object({
  mediaEntId: MediaEntIdSchema,
  imageEntId: MediaEntIdSchema.nullable(),
  videoUrl: z.string().url().nullable(),
  imageUrl: z.string().url().nullable()
});

// src/schemas/assets.ts
var AssetSchema = z2.object({
  id: UuidSchema,
  projectId: UuidSchema,
  contentItemId: z2.string().nullable(),
  relationship: z2.enum(["created", "uploaded", "extended"]).catch("created"),
  sourceProjectId: UuidSchema.nullable(),
  isInTimeline: z2.boolean(),
  addedAt: z2.string(),
  type: z2.enum(["videos", "images"]),
  imageUrl: z2.string().url().nullable(),
  videoUrl: z2.string().url().nullable(),
  imageHandle: z2.null().nullable(),
  videoHandle: z2.null().nullable(),
  prompt: z2.string().nullable(),
  imagePrompt: z2.string().nullable(),
  videoPrompt: z2.string().nullable(),
  isFavorited: z2.boolean(),
  isLoading: z2.boolean(),
  error: z2.string().nullable(),
  createdAt: z2.string(),
  batchId: z2.string().nullable().optional(),
  structuredOutput: z2.object({
    config: z2.unknown().nullable().optional(),
    metadata: z2.object({
      dimensions: z2.object({
        width: z2.number().int().positive(),
        height: z2.number().int().positive()
      }),
      aspectRatio: z2.string()
    }).nullable().optional()
  }).nullable().optional(),
  orderIndex: z2.number().int().nonnegative(),
  hasUploadedAncestor: z2.boolean(),
  mediaEntId: MediaEntIdSchema.nullable(),
  data: z2.object({
    videoGenEntId: MediaEntIdSchema.optional(),
    requestId: z2.string(),
    imageEntId: MediaEntIdSchema.optional()
  }).nullable().optional()
});
var AssetsResponseSchema = z2.object({
  success: z2.boolean(),
  assets: z2.array(AssetSchema),
  count: z2.number().int().nonnegative()
});
var ProjectAssetItemSchema = z2.object({
  id: z2.string(),
  imageUrl: z2.string().url().nullable(),
  videoUrl: z2.string().url().nullable(),
  imageHandle: z2.null().nullable(),
  videoHandle: z2.null().nullable(),
  mediaEntId: MediaEntIdSchema,
  imageEntId: MediaEntIdSchema,
  prompt: z2.string().nullable(),
  createdAt: z2.string(),
  isFavorited: z2.boolean(),
  projectId: UuidSchema,
  projectName: z2.string(),
  projectThumbnailUrl: z2.string().url().nullable(),
  relationship: z2.string(),
  hasUploadedAncestor: z2.boolean(),
  fromIngredientId: z2.unknown().nullable()
});
var ProjectAssetsResponseSchema = z2.object({
  projects: z2.unknown().nullable(),
  items: z2.array(ProjectAssetItemSchema)
});
var SyncResponseSchema = z2.object({
  updatedAt: z2.string()
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
import { z as z3 } from "zod";
var UserSchema = z3.object({
  id: UuidSchema,
  username: z3.string(),
  accountStatus: z3.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"]).catch("ACTIVE"),
  roles: z3.array(z3.string()),
  createdAt: z3.string(),
  updatedAt: z3.string(),
  abraUserId: z3.string(),
  sessionId: UuidSchema.nullable(),
  kadabraProfile: z3.object({
    id: UuidSchema,
    userId: UuidSchema,
    kadabraUserId: z3.string(),
    incognitoAccess: z3.enum(["NONE", "ALLOWED"]).catch("NONE"),
    kadabraProfileId: z3.string(),
    kadabraProfileUsername: z3.string().nullable(),
    kadabraProfilePictureURL: z3.string().url().nullable(),
    createdAt: z3.string(),
    updatedAt: z3.string(),
    syncedAt: z3.string().nullable(),
    dataSyncedAt: z3.string().nullable()
  }).nullable()
});
var MeResponseSchema = z3.object({
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
import { z as z4 } from "zod";
var SourceContentItemIdSchema = z4.object({
  id: ContentItemIdSchema,
  source: z4.string()
});
var DirectPromptImageHandleSchema = z4.object({
  image_url: z4.string().url(),
  image_ent_id: MediaEntIdSchema,
  source: z4.string().optional()
});
var GenerationConfigSchema = z4.object({
  directGeneration: z4.boolean().optional(),
  promptModel: z4.string().optional(),
  aspectRatio: AspectRatioSchema.optional(),
  imageModel: z4.string().optional(),
  videoModel: z4.string().optional(),
  resolution: z4.string().optional(),
  batchVariation: z4.boolean().optional(),
  generationType: z4.string().optional(),
  sourceContentItemIds: z4.array(SourceContentItemIdSchema).optional(),
  directPromptImageHandle: DirectPromptImageHandleSchema.nullable().optional(),
  lastFrameImageUrl: z4.string().url().nullable().optional(),
  lastFrameImageEntId: MediaEntIdSchema.nullable().optional(),
  metadata: z4.object({
    dimensions: DimensionsSchema,
    aspectRatio: AspectRatioSchema
  }).nullable().optional(),
  sourceVideoUrl: z4.string().url().nullable().optional(),
  audioSourceUrl: z4.string().url().nullable().optional(),
  extendDirective: z4.string().nullable().optional()
});
var StructuredOutputSchema = z4.object({
  config: GenerationConfigSchema.nullable().optional(),
  metadata: z4.object({
    dimensions: DimensionsSchema,
    aspectRatio: AspectRatioSchema
  }).nullable().optional()
});
var BatchContentItemSchema = z4.object({
  id: ContentItemIdSchema,
  batchId: z4.string(),
  type: z4.enum(["videos", "images"]),
  imageUrl: z4.string().url().nullable(),
  videoUrl: z4.string().url().nullable(),
  imageHandle: z4.null().nullable(),
  videoHandle: z4.null().nullable(),
  mediaEntId: MediaEntIdSchema.nullable(),
  prompt: z4.string().nullable(),
  imagePrompt: z4.string().nullable(),
  videoPrompt: z4.string().nullable(),
  isFavorited: z4.boolean(),
  isLoading: z4.boolean(),
  error: z4.string().nullable(),
  createdAt: z4.string(),
  structuredOutput: StructuredOutputSchema.nullable(),
  orderIndex: z4.number().int().nonnegative(),
  srefValues: z4.unknown().nullable(),
  data: z4.unknown().nullable(),
  canRetry: z4.boolean().optional(),
  updatedAt: z4.string(),
  hasUploadedAncestor: z4.boolean(),
  // Rich association fields are only populated once the batch completes /
  // is listed; in-flight `GET /generation-batches/:id` responses omit them.
  contentItemId: z4.string().nullable().optional(),
  projectId: UuidSchema.nullable().optional(),
  relationship: z4.string().optional(),
  isInTimeline: z4.boolean().optional(),
  sourceProjectId: UuidSchema.nullable().optional(),
  addedAt: z4.string().optional(),
  // In-flight content items carry a few extra fields the list shape lacks.
  originProjectId: UuidSchema.nullable().optional(),
  thumbnailUrl: z4.string().url().nullable().optional(),
  aspectRatio: z4.number().nullable().optional(),
  // Completed extend batches report this as `null` on content items.
  sourceContentItemIds: z4.array(SourceContentItemIdSchema).nullable().optional()
});
var GenerationBatchSchema = z4.object({
  id: z4.string(),
  userId: UuidSchema,
  projectId: UuidSchema.nullable(),
  type: z4.enum(["videos", "images"]),
  prompt: z4.string().nullable(),
  timestamp: z4.string(),
  isComplete: z4.boolean(),
  hasError: z4.boolean(),
  error: z4.string().nullable(),
  canRetry: z4.boolean(),
  /** In-flight batches report `config: null`; completed ones carry the object. */
  config: GenerationConfigSchema.nullable(),
  systemPrompt: z4.string().nullable(),
  promptModel: z4.string().nullable(),
  imageModel: z4.string().nullable(),
  videoModel: z4.string().nullable(),
  bulkGenId: z4.string().nullable(),
  generationStartTime: z4.string().nullable(),
  generationEndTime: z4.string().nullable(),
  creationContext: z4.string(),
  createdAt: z4.string(),
  updatedAt: z4.string(),
  content: z4.array(BatchContentItemSchema),
  /** Present in list responses; absent in PUT responses. */
  needsPolling: z4.boolean().optional()
});
var BatchListResponseSchema = z4.object({
  batches: z4.array(GenerationBatchSchema),
  nextOffset: z4.number().int().nonnegative().nullable()
});
var BatchCreateResponseSchema = z4.object({
  batch: z4.unknown().nullable(),
  id: z4.string()
});
var BatchUpdateResponseSchema = z4.object({
  batch: GenerationBatchSchema.extend({
    content: z4.array(BatchContentItemSchema).optional()
  }).nullable()
});
var BatchGetResponseSchema = z4.object({
  batch: GenerationBatchSchema.nullable()
});
var BatchStreamItemSchema = z4.object({
  id: ContentItemIdSchema,
  /** Not always present; defaults to `videos` for generation batches. */
  type: z4.enum(["videos", "images"]).optional(),
  isLoading: z4.boolean(),
  videoUrl: z4.string().url().nullable(),
  videoHandle: z4.null().nullable(),
  imageUrl: z4.string().url().nullable(),
  imageHandle: z4.null().nullable(),
  /** `data` is an object early on, then becomes a JSON string. */
  data: z4.unknown().nullable(),
  error: z4.string().nullable()
});
var BatchStreamEventSchema = z4.object({
  success: z4.boolean(),
  isComplete: z4.boolean(),
  items: z4.array(BatchStreamItemSchema)
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
import { z as z5 } from "zod";
var BulkDeletePayloadSchema = z5.object({
  contentItemIds: z5.array(ContentItemIdSchema).min(1),
  projectId: UuidSchema
});
var BulkDeleteResponseSchema = z5.object({
  deletedItems: z5.number().int().nonnegative(),
  removedFromProject: z5.number().int().nonnegative()
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
import { z as z6 } from "zod";
var UploadMediaResponseSchema = z6.object({
  mediaEntId: MediaEntIdSchema,
  cdnUrl: z6.string().url(),
  dimensions: DimensionsSchema,
  aspectRatio: AspectRatioSchema,
  uploadToken: z6.string()
});
var ProjectUploadFileSchema = z6.object({
  mediaEntId: MediaEntIdSchema,
  uploadToken: z6.string(),
  cdnUrl: z6.string().url(),
  filename: z6.string(),
  dimensions: DimensionsSchema,
  aspectRatio: AspectRatioSchema
});
var ProjectUploadRequestSchema = z6.object({
  files: z6.array(ProjectUploadFileSchema).min(1)
});
var ProjectUploadedContentItemSchema = z6.object({
  id: z6.string().min(1),
  type: z6.literal("images"),
  imageUrl: z6.string().url().nullable(),
  videoUrl: z6.string().url().nullable()
});
var ProjectUploadResponseSchema = z6.object({
  success: z6.boolean(),
  contentItems: z6.array(ProjectUploadedContentItemSchema),
  count: z6.number().int().nonnegative()
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
import { z as z7 } from "zod";
var ProjectSummarySchema = z7.object({
  id: UuidSchema,
  name: z7.string(),
  thumbnailUrl: z7.string().url().nullable(),
  exportStatus: z7.string(),
  createdAt: z7.string(),
  updatedAt: z7.string(),
  isShared: z7.boolean()
});
var ProjectPageSchema = z7.object({
  count: z7.number().int().nonnegative(),
  hasMore: z7.boolean(),
  nextOffset: z7.number().int().nonnegative().nullable()
});
var ProjectListResponseSchema = z7.object({
  success: z7.boolean(),
  projects: z7.array(ProjectSummarySchema),
  page: ProjectPageSchema
});
var CompositionSchema = z7.object({
  id: z7.string(),
  tracks: z7.array(z7.unknown()),
  duration: z7.number()
});
var ProjectSchema = z7.object({
  id: UuidSchema,
  userId: UuidSchema,
  name: z7.string(),
  composition: CompositionSchema,
  exportStatus: z7.string(),
  createdAt: z7.string(),
  updatedAt: z7.string()
});
var ProjectCreateResponseSchema = z7.object({
  success: z7.boolean(),
  project: ProjectSchema
});
var ProjectDeleteResponseSchema = z7.object({
  success: z7.boolean(),
  message: z7.string(),
  deletedOrphanCount: z7.number().int().nonnegative()
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
import { randomBytes } from "crypto";
function uuidv7() {
  const bytes = randomBytes(16);
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
  const rand = randomBytes(4).toString("hex");
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
import { z as z8 } from "zod";
var T2VBaseConfigSchema = z8.object({
  directGeneration: z8.literal(true),
  promptModel: z8.string(),
  aspectRatio: AspectRatioSchema,
  imageModel: z8.string(),
  videoModel: z8.string(),
  resolution: z8.string(),
  batchVariation: z8.boolean()
});
var T2VFrameConfigSchema = T2VBaseConfigSchema.extend({
  sourceContentItemIds: z8.array(SourceContentItemIdSchema),
  directPromptImageHandle: DirectPromptImageHandleSchema,
  lastFrameImageUrl: z8.string().url().optional(),
  lastFrameImageEntId: MediaEntIdSchema.optional()
});
var T2VGenerateInputSchema = z8.discriminatedUnion("type", [
  z8.object({
    type: z8.literal("image"),
    imageUrl: z8.string().url(),
    imageEntId: MediaEntIdSchema,
    prompt: z8.string(),
    originalPrompt: z8.string(),
    config: T2VFrameConfigSchema
  }),
  z8.object({
    type: z8.literal("prompt"),
    value: z8.string(),
    original_prompt: z8.string(),
    config: T2VBaseConfigSchema
  })
]);
var T2VGenerateRequestSchema = z8.object({
  inputs: z8.array(T2VGenerateInputSchema).min(1),
  config: T2VBaseConfigSchema.extend({
    generationType: z8.literal("t2v"),
    sourceContentItemIds: z8.array(SourceContentItemIdSchema).optional(),
    directPromptImageHandle: DirectPromptImageHandleSchema.optional(),
    lastFrameImageUrl: z8.string().url().optional(),
    lastFrameImageEntId: MediaEntIdSchema.optional()
  }),
  batchId: z8.string(),
  mg_request_id: z8.string(),
  projectId: UuidSchema
});
var ExtendGenerateInputSchema = z8.object({
  type: z8.literal("extend"),
  mediaEntId: MediaEntIdSchema,
  videoUrl: z8.string().url(),
  prompt: z8.string(),
  extendDirective: z8.string().optional(),
  config: z8.object({
    metadata: z8.object({
      dimensions: DimensionsSchema,
      aspectRatio: AspectRatioSchema
    }),
    videoModel: z8.string(),
    imageModel: z8.string(),
    generationType: z8.literal("extend"),
    sourceVideoUrl: z8.string().url(),
    audioSourceUrl: z8.string().url().optional(),
    directGeneration: z8.literal(true),
    sourceContentItemIds: z8.array(SourceContentItemIdSchema),
    extendDirective: z8.string().optional()
  })
});
var ExtendGenerateRequestSchema = z8.object({
  inputs: z8.array(ExtendGenerateInputSchema).min(1),
  config: ExtendGenerateInputSchema.shape.config,
  batchId: z8.string(),
  mg_request_id: z8.string(),
  projectId: UuidSchema
});
var GenerateVideosResponseSchema = z8.object({
  success: z8.boolean(),
  batchId: z8.string(),
  videoGenEntIds: z8.array(MediaEntIdSchema),
  needsPolling: z8.boolean(),
  hasPartialErrors: z8.boolean(),
  items: z8.array(
    z8.object({
      id: ContentItemIdSchema,
      imageUrl: z8.string().url().nullable(),
      isLoading: z8.boolean(),
      error: z8.string().nullable()
    })
  )
});
var BatchSkeletonSchema = z8.object({
  id: z8.string(),
  type: z8.enum(["videos", "images"]),
  prompt: z8.string(),
  timestamp: z8.string(),
  content: z8.array(
    z8.object({
      id: ContentItemIdSchema,
      type: z8.enum(["videos", "images"]),
      isLoading: z8.boolean()
    })
  ),
  isComplete: z8.literal(false),
  config: z8.unknown(),
  promptModel: z8.string().optional(),
  imageModel: z8.string().optional(),
  videoModel: z8.string().optional(),
  generationStartTime: z8.string().optional(),
  isDirectGeneration: z8.literal(true).optional(),
  projectId: UuidSchema.optional()
});
var BatchUpdatePayloadSchema = z8.object({
  id: z8.string(),
  content: z8.array(
    z8.object({
      id: ContentItemIdSchema,
      type: z8.enum(["videos", "images"]),
      isLoading: z8.boolean(),
      videoUrl: z8.string().url().nullable(),
      videoHandle: z8.unknown().nullable(),
      imageUrl: z8.string().url().nullable(),
      imageHandle: z8.unknown().nullable(),
      /** Note: serialized as a JSON *string* in the PUT body. */
      data: z8.string().nullable(),
      error: z8.string().nullable()
    })
  ),
  isComplete: z8.boolean(),
  generationEndTime: z8.string()
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

// src/auth/browser-session.ts
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { getCookies } from "@steipete/sweet-cookie";
var SESSION_URL = "https://vibes.ai/";
var SESSION_NAMES = ["meta_session", "cookie_ack"];
var DEFAULT_THROTTLE_MS = 5e3;
var HELIUM_DB = join(homedir(), ".config", "net.imput.helium", "Default", "Cookies");
var CHROMIUM_DB = join(homedir(), ".config", "chromium", "Default", "Cookies");
var BRAVE_DB = join(homedir(), ".config", "BraveSoftware", "Brave-Browser", "Default", "Cookies");
function autoCandidates() {
  return [
    // helium: Chromium fork, read through the chrome backend
    { name: "helium", browser: "chrome", dbPath: HELIUM_DB },
    { name: "chrome", browser: "chrome" },
    // chromium/brave: Chromium forks, read through the chrome backend
    { name: "chromium", browser: "chrome", dbPath: CHROMIUM_DB },
    { name: "brave", browser: "chrome", dbPath: BRAVE_DB },
    { name: "edge", browser: "edge" },
    { name: "firefox", browser: "firefox" },
    { name: "safari", browser: "safari" }
  ];
}
function forkDbPath(kind) {
  if (kind === "helium") return HELIUM_DB;
  if (kind === "chromium") return CHROMIUM_DB;
  if (kind === "brave") return BRAVE_DB;
  return void 0;
}
async function syncSessionFromBrowser(cfg = {}) {
  const kind = cfg.browser ?? process.env.VIBES_BROWSER;
  const profileDir = cfg.profileDir ?? process.env.VIBES_PROFILE_DIR;
  const readCookies = cfg.readCookies ?? defaultReadCookies;
  const names = cfg.cookieNames ?? SESSION_NAMES;
  const sessionName = names[0] ?? SESSION_NAMES[0];
  let candidates;
  if (profileDir) {
    const dbPath = join(profileDir, "Default", "Cookies");
    if (!existsSync(dbPath)) {
      throw new VibesAuthError(`No cookie database at ${dbPath}.`);
    }
    candidates = [{ name: "profile", browser: "chrome", dbPath }];
  } else if (kind) {
    const dbPath = forkDbPath(kind);
    if (dbPath && !existsSync(dbPath)) {
      throw new VibesAuthError(`No cookie database at ${dbPath}.`);
    }
    candidates = [
      {
        name: kind,
        browser: kind === "helium" || kind === "chromium" || kind === "brave" ? "chrome" : kind,
        ...dbPath ? { dbPath } : {}
      }
    ];
  } else {
    candidates = autoCandidates();
  }
  if (cfg.verbose) {
    const parts = candidates.map((c) => c.name);
    const db = candidates[0]?.dbPath;
    if (db) parts.push(db);
    if (!profileDir && !kind) parts.push("(auto-detect)");
    console.warn(`   [browser] ${parts.join(", ")}`);
  }
  setKeyringPassword();
  let warnings = [];
  for (const c of candidates) {
    if (c.dbPath && !existsSync(c.dbPath)) {
      warnings.push(`${c.name}: cookie database not found`);
      if (cfg.verbose) console.warn(`   [browser] ${c.name}: cookie database not found`);
      continue;
    }
    const res = await readCookies({
      url: cfg.url ?? SESSION_URL,
      names,
      browsers: [c.browser],
      ...c.dbPath ? { chromeProfile: c.dbPath } : {},
      timeoutMs: 15e3
    });
    warnings = res.warnings;
    if (cfg.verbose && warnings.length) {
      for (const w of warnings) console.warn(`   [browser] ${w}`);
    }
    const picked = res.cookies.filter((c2) => c2.value.length > 0);
    if (picked.some((c2) => c2.name === sessionName)) {
      if (cfg.verbose && c.name !== candidates[0].name) {
        console.warn(`   [browser] ${c.name} has the session cookie (fallback)`);
      }
      const ordered = [
        ...picked.filter((c2) => c2.name === sessionName),
        ...picked.filter((c2) => c2.name !== sessionName)
      ];
      return ordered.map((c2) => `${c2.name}=${c2.value}`).join("; ");
    }
  }
  const why = warnings[0] ? ` (${warnings[0]})` : "";
  throw new VibesAuthError(
    `No vibes.ai session cookie (meta_session) in your browser${why}. Tried: ${candidates.map((c) => c.name).join(", ")}. Sign in to vibes.ai in your browser, or pass \`session\` explicitly.`
  );
}
function browserSession(cfg = {}) {
  const throttleMs = cfg.throttleMs ?? DEFAULT_THROTTLE_MS;
  let cache;
  return async () => {
    const fromEnv = cfg.sessionFromEnv ?? process.env.VIBES_SESSION_COOKIE;
    if (fromEnv) return fromEnv;
    const now = Date.now();
    if (cache && now - cache.at < throttleMs) return cache.header;
    const header = await syncSessionFromBrowser(cfg);
    cache = { at: Date.now(), header };
    return header;
  };
}
var defaultReadCookies = (opts) => getCookies({
  url: opts.url,
  names: [...opts.names],
  browsers: [...opts.browsers],
  ...opts.chromeProfile ? { chromeProfile: opts.chromeProfile } : {},
  timeoutMs: opts.timeoutMs
});
var CHROMIUM_KEYRING_LABEL = "Chromium Safe Storage";
var keyringLoaded = false;
function setKeyringPassword() {
  if (keyringLoaded) return;
  keyringLoaded = true;
  const r = spawnSync(
    "secret-tool",
    ["search", "--all", "xdg:schema", "chrome_libsecret_os_crypt_password_v2"],
    { encoding: "utf8", timeout: 15e3 }
  );
  if (r.status !== 0 || !r.stdout) return;
  const block = r.stdout.split(/\[\/\d+\]/).find((b) => b.includes(CHROMIUM_KEYRING_LABEL));
  const secret = block?.match(/secret = (.+)/)?.[1];
  if (secret) process.env.SWEET_COOKIE_CHROME_SAFE_STORAGE_PASSWORD = secret.trim();
}
export {
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
  VibesAuthError,
  VibesClient,
  VibesError,
  VibesHttpError,
  VibesParseError,
  VibesPollTimeoutError,
  VibesValidationError,
  VideosResource,
  batchId,
  browserSession,
  contentItemId,
  dimensionsToAspectRatio,
  extendBatchId,
  mgRequestId,
  parseFirstJsonObject,
  resolveAspectRatio,
  syncSessionFromBrowser,
  uuidv7,
  waitFor,
  withRetry
};
//# sourceMappingURL=index.js.map