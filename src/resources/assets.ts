import { type HttpClient } from "../http/http-client.js";
import {
  AssetsResponseSchema,
  ProjectAssetsResponseSchema,
  SyncResponseSchema,
  type AssetsResponse,
  type ProjectAssetsResponse,
  type SyncResponse,
} from "../schemas/assets.js";

export interface ListProjectAssetsOptions {
  limit?: number;
  offset?: number;
}

/** Asset listing and sync endpoints. */
export class AssetsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Rich asset list for a project (`GET /api/projects/:projectId/assets`).
   * The web app uses this endpoint to check extend status.
   */
  async list(projectId: string): Promise<AssetsResponse> {
    return this.http.request<AssetsResponse>({
      method: "GET",
      path: `/projects/${projectId}/assets`,
      schema: AssetsResponseSchema,
    });
  }

  /**
   * Flat, project-scoped asset items (`GET /api/project-assets`).
   */
  async listByProjectId(
    projectId: string,
    options: ListProjectAssetsOptions = {},
  ): Promise<ProjectAssetsResponse> {
    return this.http.request<ProjectAssetsResponse>({
      method: "GET",
      path: "/project-assets",
      query: {
        project_id: projectId,
        limit: options.limit ?? 50,
        offset: options.offset ?? 0,
      },
      schema: ProjectAssetsResponseSchema,
    });
  }

  /**
   * Last-modified stamp for an entity (`GET /api/sync`).
   * Returns an opaque pipe-separated timestamp string.
   */
  async sync(entityType: string, entityId: string): Promise<SyncResponse> {
    return this.http.request<SyncResponse>({
      method: "GET",
      path: "/sync",
      query: { entityType, entityId },
      schema: SyncResponseSchema,
    });
  }
}
