import { z } from "zod";
import { ContentItemIdSchema, UuidSchema } from "./common.js";

/** Content-item deletion (`/api/content-items/bulk-delete`). */

/** Payload for `DELETE /api/content-items/bulk-delete`. */
export const BulkDeletePayloadSchema = z.object({
  contentItemIds: z.array(ContentItemIdSchema).min(1),
  projectId: UuidSchema,
});

/** Response from `DELETE /api/content-items/bulk-delete`. */
export const BulkDeleteResponseSchema = z.object({
  deletedItems: z.number().int().nonnegative(),
  removedFromProject: z.number().int().nonnegative(),
});

export type BulkDeletePayload = z.infer<typeof BulkDeletePayloadSchema>;
export type BulkDeleteResponse = z.infer<typeof BulkDeleteResponseSchema>;
