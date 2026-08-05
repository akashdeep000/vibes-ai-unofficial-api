import { type HttpClient } from "../http/http-client.js";
import {
  BulkDeletePayloadSchema,
  BulkDeleteResponseSchema,
  type BulkDeleteResponse,
} from "../schemas/content-items.js";

/** Content-item endpoints (`/api/content-items`). */
export class ContentItemsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Bulk-deletes content items from a project (`DELETE /api/content-items/bulk-delete`).
   *
   * Content item ids are the `contentItemId` values on assets and batch
   * entries (e.g. generated-video content items). Deletion is idempotent.
   */
  async bulkDelete(
    projectId: string,
    contentItemIds: readonly string[],
  ): Promise<BulkDeleteResponse> {
    return this.http.request<BulkDeleteResponse>({
      method: "DELETE",
      path: "/content-items/bulk-delete",
      json: BulkDeletePayloadSchema.parse({ projectId, contentItemIds }),
      schema: BulkDeleteResponseSchema,
    });
  }
}
