import { z } from "zod";
import { AspectRatioSchema, DimensionsSchema, MediaEntIdSchema } from "./common.js";

/** `POST /api/upload-media` — multipart file upload. */

export const UploadMediaResponseSchema = z.object({
  mediaEntId: MediaEntIdSchema,
  cdnUrl: z.string().url(),
  dimensions: DimensionsSchema,
  aspectRatio: AspectRatioSchema,
  uploadToken: z.string(),
});

export type UploadMediaResponse = z.infer<typeof UploadMediaResponseSchema>;

/** One file entry in the `POST /api/projects/:projectId/upload` body. */
export const ProjectUploadFileSchema = z.object({
  mediaEntId: MediaEntIdSchema,
  uploadToken: z.string(),
  cdnUrl: z.string().url(),
  filename: z.string(),
  dimensions: DimensionsSchema,
  aspectRatio: AspectRatioSchema,
});

export type ProjectUploadFile = z.infer<typeof ProjectUploadFileSchema>;

/** Payload for `POST /api/projects/:projectId/upload`. */
export const ProjectUploadRequestSchema = z.object({
  files: z.array(ProjectUploadFileSchema).min(1),
});

export type ProjectUploadRequest = z.infer<typeof ProjectUploadRequestSchema>;

/** A content item created by attaching an uploaded file to a project. */
export const ProjectUploadedContentItemSchema = z.object({
  id: z.string().min(1),
  type: z.literal("images"),
  imageUrl: z.string().url().nullable(),
  videoUrl: z.string().url().nullable(),
});

export type ProjectUploadedContentItem = z.infer<typeof ProjectUploadedContentItemSchema>;

/** Response from `POST /api/projects/:projectId/upload`. */
export const ProjectUploadResponseSchema = z.object({
  success: z.boolean(),
  contentItems: z.array(ProjectUploadedContentItemSchema),
  count: z.number().int().nonnegative(),
});

export type ProjectUploadResponse = z.infer<typeof ProjectUploadResponseSchema>;
