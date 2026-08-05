import { z } from "zod";
import {
  AspectRatioSchema,
  ContentItemIdSchema,
  DimensionsSchema,
  MediaEntIdSchema,
  UuidSchema,
} from "./common.js";
import { DirectPromptImageHandleSchema, SourceContentItemIdSchema } from "./batches.js";

/**
 * Generation endpoints (`/api/generate/videos`, `/api/generation-batches`).
 *
 * These schemas describe what the *client sends*. Unlike the response
 * schemas (which are intentionally loose to survive API drift), the request
 * schemas are strict: they validate user input and pin the exact wire format
 * observed in the captured traces.
 */

/** Shared t2v config fields sent for both frame-based and prompt-only inputs. */
export const T2VBaseConfigSchema = z.object({
  directGeneration: z.literal(true),
  promptModel: z.string(),
  aspectRatio: AspectRatioSchema,
  imageModel: z.string(),
  videoModel: z.string(),
  resolution: z.string(),
  batchVariation: z.boolean(),
});

/** Frame-based (image) input config: adds the start/end frame references. */
export const T2VFrameConfigSchema = T2VBaseConfigSchema.extend({
  sourceContentItemIds: z.array(SourceContentItemIdSchema),
  directPromptImageHandle: DirectPromptImageHandleSchema,
  lastFrameImageUrl: z.string().url().optional(),
  lastFrameImageEntId: MediaEntIdSchema.optional(),
});

/**
 * Single input of a t2v generation. When a start frame is provided the input
 * is an `image`; otherwise the generation runs from a bare `prompt`.
 */
export const T2VGenerateInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("image"),
    imageUrl: z.string().url(),
    imageEntId: MediaEntIdSchema,
    prompt: z.string(),
    originalPrompt: z.string(),
    config: T2VFrameConfigSchema,
  }),
  z.object({
    type: z.literal("prompt"),
    value: z.string(),
    original_prompt: z.string(),
    config: T2VBaseConfigSchema,
  }),
]);

export const T2VGenerateRequestSchema = z.object({
  inputs: z.array(T2VGenerateInputSchema).min(1),
  config: T2VBaseConfigSchema.extend({
    generationType: z.literal("t2v"),
    sourceContentItemIds: z.array(SourceContentItemIdSchema).optional(),
    directPromptImageHandle: DirectPromptImageHandleSchema.optional(),
    lastFrameImageUrl: z.string().url().optional(),
    lastFrameImageEntId: MediaEntIdSchema.optional(),
  }),
  batchId: z.string(),
  mg_request_id: z.string(),
  projectId: UuidSchema,
});

/** Single extend input for an extend generation. */
export const ExtendGenerateInputSchema = z.object({
  type: z.literal("extend"),
  mediaEntId: MediaEntIdSchema,
  videoUrl: z.string().url(),
  prompt: z.string(),
  extendDirective: z.string().optional(),
  config: z.object({
    metadata: z.object({
      dimensions: DimensionsSchema,
      aspectRatio: AspectRatioSchema,
    }),
    videoModel: z.string(),
    imageModel: z.string(),
    generationType: z.literal("extend"),
    sourceVideoUrl: z.string().url(),
    audioSourceUrl: z.string().url().optional(),
    directGeneration: z.literal(true),
    sourceContentItemIds: z.array(SourceContentItemIdSchema),
    extendDirective: z.string().optional(),
  }),
});

export const ExtendGenerateRequestSchema = z.object({
  inputs: z.array(ExtendGenerateInputSchema).min(1),
  config: ExtendGenerateInputSchema.shape.config,
  batchId: z.string(),
  mg_request_id: z.string(),
  projectId: UuidSchema,
});

/** Shared response shape of `POST /api/generate/videos`. */
export const GenerateVideosResponseSchema = z.object({
  success: z.boolean(),
  batchId: z.string(),
  videoGenEntIds: z.array(MediaEntIdSchema),
  needsPolling: z.boolean(),
  hasPartialErrors: z.boolean(),
  items: z.array(
    z.object({
      id: ContentItemIdSchema,
      imageUrl: z.string().url().nullable(),
      isLoading: z.boolean(),
      error: z.string().nullable(),
    }),
  ),
});

/**
 * Skeleton batch registered via `POST /api/generation-batches` right after
 * generation submission so the server starts tracking progress.
 */
export const BatchSkeletonSchema = z.object({
  id: z.string(),
  type: z.enum(["videos", "images"]),
  prompt: z.string(),
  timestamp: z.string(),
  content: z.array(
    z.object({
      id: ContentItemIdSchema,
      type: z.enum(["videos", "images"]),
      isLoading: z.boolean(),
    }),
  ),
  isComplete: z.literal(false),
  config: z.unknown(),
  promptModel: z.string().optional(),
  imageModel: z.string().optional(),
  videoModel: z.string().optional(),
  generationStartTime: z.string().optional(),
  isDirectGeneration: z.literal(true).optional(),
  projectId: UuidSchema.optional(),
});

/** A batch update sent via `PUT /api/generation-batches`. */
export const BatchUpdatePayloadSchema = z.object({
  id: z.string(),
  content: z.array(
    z.object({
      id: ContentItemIdSchema,
      type: z.enum(["videos", "images"]),
      isLoading: z.boolean(),
      videoUrl: z.string().url().nullable(),
      videoHandle: z.unknown().nullable(),
      imageUrl: z.string().url().nullable(),
      imageHandle: z.unknown().nullable(),
      /** Note: serialized as a JSON *string* in the PUT body. */
      data: z.string().nullable(),
      error: z.string().nullable(),
    }),
  ),
  isComplete: z.boolean(),
  generationEndTime: z.string(),
});

export type T2VGenerateInput = z.infer<typeof T2VGenerateInputSchema>;
export type T2VGenerateRequest = z.infer<typeof T2VGenerateRequestSchema>;
export type ExtendGenerateInput = z.infer<typeof ExtendGenerateInputSchema>;
export type ExtendGenerateRequest = z.infer<typeof ExtendGenerateRequestSchema>;
export type GenerateVideosResponse = z.infer<typeof GenerateVideosResponseSchema>;
export type BatchSkeleton = z.infer<typeof BatchSkeletonSchema>;
export type BatchUpdatePayload = z.infer<typeof BatchUpdatePayloadSchema>;
