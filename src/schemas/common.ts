import { z } from "zod";

/**
 * Shared primitives.
 *
 * Timestamps are intentionally left as plain strings: the API occasionally
 * returns non-ISO values (e.g. the pipe-separated `updatedAt` from
 * `/api/sync`), and strict datetime validation would only cause false drift
 * alarms on a fragile platform.
 */

/** RFC 4122 UUID, used for users, projects, batches and assets. */
export const UuidSchema = z.string().uuid({ message: "expected a UUID string" });

/** Opaque media entity ids handed out by the platform (e.g. "1166369879902864"). */
export const MediaEntIdSchema = z.string().min(1, { message: "expected a media entity id" });

/** Client-generated content item ids, e.g. "batch-...-content-0". */
export const ContentItemIdSchema = z.string().min(1);

/** The few aspect ratios the platform accepts. */
export const AspectRatioSchema = z.enum(["16:9", "9:16", "1:1", "4:3", "3:4"]);

export const DimensionsSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** Uploaded media references the API uses in place of URLs. */
export const MediaReferenceSchema = z.object({
  mediaEntId: MediaEntIdSchema,
  imageEntId: MediaEntIdSchema.nullable(),
  videoUrl: z.string().url().nullable(),
  imageUrl: z.string().url().nullable(),
});

export type Uuid = z.infer<typeof UuidSchema>;
export type MediaEntId = z.infer<typeof MediaEntIdSchema>;
export type ContentItemId = z.infer<typeof ContentItemIdSchema>;
export type AspectRatio = z.infer<typeof AspectRatioSchema>;
export type Dimensions = z.infer<typeof DimensionsSchema>;
export type MediaReference = z.infer<typeof MediaReferenceSchema>;
