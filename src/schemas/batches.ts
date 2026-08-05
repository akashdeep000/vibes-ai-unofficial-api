import { z } from "zod";
import {
  AspectRatioSchema,
  ContentItemIdSchema,
  DimensionsSchema,
  MediaEntIdSchema,
  UuidSchema,
} from "./common.js";

/**
 * Generation batches (`/api/projects/:projectId/batches`, `/api/generation-batches`).
 *
 * The `config` object varies by generation type (t2v / extend / uploaded
 * media), so it is modeled with optional fields and validated strictly only
 * when the client *builds* requests (see `schemas/generation.ts`).
 */

export const SourceContentItemIdSchema = z.object({
  id: ContentItemIdSchema,
  source: z.string(),
});

/** Handle the platform attaches to a prompt image. */
export const DirectPromptImageHandleSchema = z.object({
  image_url: z.string().url(),
  image_ent_id: MediaEntIdSchema,
  source: z.string().optional(),
});

/** Loose config shape as *returned* by the API (all fields optional). */
export const GenerationConfigSchema = z.object({
  directGeneration: z.boolean().optional(),
  promptModel: z.string().optional(),
  aspectRatio: AspectRatioSchema.optional(),
  imageModel: z.string().optional(),
  videoModel: z.string().optional(),
  resolution: z.string().optional(),
  batchVariation: z.boolean().optional(),
  generationType: z.string().optional(),
  sourceContentItemIds: z.array(SourceContentItemIdSchema).optional(),
  directPromptImageHandle: DirectPromptImageHandleSchema.nullable().optional(),
  lastFrameImageUrl: z.string().url().nullable().optional(),
  lastFrameImageEntId: MediaEntIdSchema.nullable().optional(),
  metadata: z
    .object({
      dimensions: DimensionsSchema,
      aspectRatio: AspectRatioSchema,
    })
    .nullable()
    .optional(),
  sourceVideoUrl: z.string().url().nullable().optional(),
  audioSourceUrl: z.string().url().nullable().optional(),
  extendDirective: z.string().nullable().optional(),
});

export const StructuredOutputSchema = z.object({
  config: GenerationConfigSchema.nullable().optional(),
  metadata: z
    .object({
      dimensions: DimensionsSchema,
      aspectRatio: AspectRatioSchema,
    })
    .nullable()
    .optional(),
});

/** One media item inside a batch. */
export const BatchContentItemSchema = z.object({
  id: ContentItemIdSchema,
  batchId: z.string(),
  type: z.enum(["videos", "images"]),
  imageUrl: z.string().url().nullable(),
  videoUrl: z.string().url().nullable(),
  imageHandle: z.null().nullable(),
  videoHandle: z.null().nullable(),
  mediaEntId: MediaEntIdSchema.nullable(),
  prompt: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  videoPrompt: z.string().nullable(),
  isFavorited: z.boolean(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
  createdAt: z.string(),
  structuredOutput: StructuredOutputSchema.nullable(),
  orderIndex: z.number().int().nonnegative(),
  srefValues: z.unknown().nullable(),
  data: z.unknown().nullable(),
  canRetry: z.boolean().optional(),
  updatedAt: z.string(),
  hasUploadedAncestor: z.boolean(),
  // Rich association fields are only populated once the batch completes /
  // is listed; in-flight `GET /generation-batches/:id` responses omit them.
  contentItemId: z.string().nullable().optional(),
  projectId: UuidSchema.nullable().optional(),
  relationship: z.string().optional(),
  isInTimeline: z.boolean().optional(),
  sourceProjectId: UuidSchema.nullable().optional(),
  addedAt: z.string().optional(),
  // In-flight content items carry a few extra fields the list shape lacks.
  originProjectId: UuidSchema.nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  aspectRatio: z.number().nullable().optional(),
  // Completed extend batches report this as `null` on content items.
  sourceContentItemIds: z.array(SourceContentItemIdSchema).nullable().optional(),
});

export const GenerationBatchSchema = z.object({
  id: z.string(),
  userId: UuidSchema,
  projectId: UuidSchema.nullable(),
  type: z.enum(["videos", "images"]),
  prompt: z.string().nullable(),
  timestamp: z.string(),
  isComplete: z.boolean(),
  hasError: z.boolean(),
  error: z.string().nullable(),
  canRetry: z.boolean(),
  /** In-flight batches report `config: null`; completed ones carry the object. */
  config: GenerationConfigSchema.nullable(),
  systemPrompt: z.string().nullable(),
  promptModel: z.string().nullable(),
  imageModel: z.string().nullable(),
  videoModel: z.string().nullable(),
  bulkGenId: z.string().nullable(),
  generationStartTime: z.string().nullable(),
  generationEndTime: z.string().nullable(),
  creationContext: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  content: z.array(BatchContentItemSchema),
  /** Present in list responses; absent in PUT responses. */
  needsPolling: z.boolean().optional(),
});

export const BatchListResponseSchema = z.object({
  batches: z.array(GenerationBatchSchema),
  nextOffset: z.number().int().nonnegative().nullable(),
});

/** `POST /api/generation-batches` returns `{ batch: null, id }`. */
export const BatchCreateResponseSchema = z.object({
  batch: z.unknown().nullable(),
  id: z.string(),
});

/**
 * `PUT /api/generation-batches` returns `{ batch }` — the batch *without* its
 * `content` array. `POST` returns `{ batch: null, id }`.
 */
export const BatchUpdateResponseSchema = z.object({
  batch: GenerationBatchSchema.extend({
    content: z.array(BatchContentItemSchema).optional(),
  }).nullable(),
});

/** `GET /api/generation-batches/:batchId` returns the tracked batch. */
export const BatchGetResponseSchema = z.object({
  batch: GenerationBatchSchema.nullable(),
});

/** One item in a `GET /api/generation-batches/:batchId/stream` event. */
export const BatchStreamItemSchema = z.object({
  id: ContentItemIdSchema,
  /** Not always present; defaults to `videos` for generation batches. */
  type: z.enum(["videos", "images"]).optional(),
  isLoading: z.boolean(),
  videoUrl: z.string().url().nullable(),
  videoHandle: z.null().nullable(),
  imageUrl: z.string().url().nullable(),
  imageHandle: z.null().nullable(),
  /** `data` is an object early on, then becomes a JSON string. */
  data: z.unknown().nullable(),
  error: z.string().nullable(),
});

/** One SSE `data:` event from the batch stream. */
export const BatchStreamEventSchema = z.object({
  success: z.boolean(),
  isComplete: z.boolean(),
  items: z.array(BatchStreamItemSchema),
});

export type SourceContentItemId = z.infer<typeof SourceContentItemIdSchema>;
export type DirectPromptImageHandle = z.infer<typeof DirectPromptImageHandleSchema>;
export type GenerationConfig = z.infer<typeof GenerationConfigSchema>;
export type StructuredOutput = z.infer<typeof StructuredOutputSchema>;
export type BatchContentItem = z.infer<typeof BatchContentItemSchema>;
export type GenerationBatch = z.infer<typeof GenerationBatchSchema>;
export type BatchListResponse = z.infer<typeof BatchListResponseSchema>;
export type BatchCreateResponse = z.infer<typeof BatchCreateResponseSchema>;
export type BatchUpdateResponse = z.infer<typeof BatchUpdateResponseSchema>;
export type BatchGetResponse = z.infer<typeof BatchGetResponseSchema>;
export type BatchStreamItem = z.infer<typeof BatchStreamItemSchema>;
export type BatchStreamEvent = z.infer<typeof BatchStreamEventSchema>;
