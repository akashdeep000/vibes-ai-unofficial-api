import { z } from "zod";
import { MediaEntIdSchema, UuidSchema } from "./common.js";

/**
 * Asset listings (`/api/projects/:projectId/assets`, `/api/project-assets`)
 * and sync (`/api/sync`).
 */

export const AssetSchema = z.object({
  id: UuidSchema,
  projectId: UuidSchema,
  contentItemId: z.string().nullable(),
  relationship: z.enum(["created", "uploaded", "extended"]).catch("created"),
  sourceProjectId: UuidSchema.nullable(),
  isInTimeline: z.boolean(),
  addedAt: z.string(),
  type: z.enum(["videos", "images"]),
  imageUrl: z.string().url().nullable(),
  videoUrl: z.string().url().nullable(),
  imageHandle: z.null().nullable(),
  videoHandle: z.null().nullable(),
  prompt: z.string().nullable(),
  imagePrompt: z.string().nullable(),
  videoPrompt: z.string().nullable(),
  isFavorited: z.boolean(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
  createdAt: z.string(),
  batchId: z.string().nullable().optional(),
  structuredOutput: z
    .object({
      config: z.unknown().nullable().optional(),
      metadata: z
        .object({
          dimensions: z.object({
            width: z.number().int().positive(),
            height: z.number().int().positive(),
          }),
          aspectRatio: z.string(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  orderIndex: z.number().int().nonnegative(),
  hasUploadedAncestor: z.boolean(),
  mediaEntId: MediaEntIdSchema.nullable(),
  data: z
    .object({
      videoGenEntId: MediaEntIdSchema.optional(),
      requestId: z.string(),
      imageEntId: MediaEntIdSchema.optional(),
    })
    .nullable()
    .optional(),
});

export const AssetsResponseSchema = z.object({
  success: z.boolean(),
  assets: z.array(AssetSchema),
  count: z.number().int().nonnegative(),
});

/** Item shape from `GET /api/project-assets` (flatter, project-scoped). */
export const ProjectAssetItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string().url().nullable(),
  videoUrl: z.string().url().nullable(),
  imageHandle: z.null().nullable(),
  videoHandle: z.null().nullable(),
  mediaEntId: MediaEntIdSchema,
  imageEntId: MediaEntIdSchema,
  prompt: z.string().nullable(),
  createdAt: z.string(),
  isFavorited: z.boolean(),
  projectId: UuidSchema,
  projectName: z.string(),
  projectThumbnailUrl: z.string().url().nullable(),
  relationship: z.string(),
  hasUploadedAncestor: z.boolean(),
  fromIngredientId: z.unknown().nullable(),
});

export const ProjectAssetsResponseSchema = z.object({
  projects: z.unknown().nullable(),
  items: z.array(ProjectAssetItemSchema),
});

/** `GET /api/sync` — opaque last-modified stamp, pipe-separated. */
export const SyncResponseSchema = z.object({
  updatedAt: z.string(),
});

export type Asset = z.infer<typeof AssetSchema>;
export type AssetsResponse = z.infer<typeof AssetsResponseSchema>;
export type ProjectAssetItem = z.infer<typeof ProjectAssetItemSchema>;
export type ProjectAssetsResponse = z.infer<typeof ProjectAssetsResponseSchema>;
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
