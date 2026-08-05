import { z } from "zod";
import { UuidSchema } from "./common.js";

/** Project list / create endpoints (`/api/projects`). */

export const ProjectSummarySchema = z.object({
  id: UuidSchema,
  name: z.string(),
  thumbnailUrl: z.string().url().nullable(),
  exportStatus: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isShared: z.boolean(),
});

export const ProjectPageSchema = z.object({
  count: z.number().int().nonnegative(),
  hasMore: z.boolean(),
  nextOffset: z.number().int().nonnegative().nullable(),
});

export const ProjectListResponseSchema = z.object({
  success: z.boolean(),
  projects: z.array(ProjectSummarySchema),
  page: ProjectPageSchema,
});

export const CompositionSchema = z.object({
  id: z.string(),
  tracks: z.array(z.unknown()),
  duration: z.number(),
});

/** Full project as returned by `POST /api/projects`. */
export const ProjectSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  name: z.string(),
  composition: CompositionSchema,
  exportStatus: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ProjectCreateResponseSchema = z.object({
  success: z.boolean(),
  project: ProjectSchema,
});

/** Response from `DELETE /api/projects/:projectId?deleteAssets=true`. */
export const ProjectDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  deletedOrphanCount: z.number().int().nonnegative(),
});

export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;
export type ProjectPage = z.infer<typeof ProjectPageSchema>;
export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectCreateResponse = z.infer<typeof ProjectCreateResponseSchema>;
export type ProjectDeleteResponse = z.infer<typeof ProjectDeleteResponseSchema>;
