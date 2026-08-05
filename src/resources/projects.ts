import { type HttpClient } from "../http/http-client.js";
import {
  ProjectCreateResponseSchema,
  ProjectDeleteResponseSchema,
  ProjectListResponseSchema,
  type ProjectCreateResponse,
  type ProjectDeleteResponse,
  type ProjectListResponse,
} from "../schemas/projects.js";

export interface ListProjectsOptions {
  /** Max results per page. */
  limit?: number;
  /** Offset for pagination. */
  offset?: number;
  /** Sort order. */
  sort?: "newest" | "oldest";
}

export interface DeleteProjectOptions {
  /** Also delete orphaned assets referenced by the project. Defaults to true. */
  deleteAssets?: boolean;
}

/** Project endpoints (`/api/projects`). */
export class ProjectsResource {
  constructor(private readonly http: HttpClient) {}

  /** Lists the signed-in user's projects. */
  async list(options: ListProjectsOptions = {}): Promise<ProjectListResponse> {
    return this.http.request<ProjectListResponse>({
      method: "GET",
      path: "/projects",
      query: {
        limit: options.limit ?? 25,
        offset: options.offset ?? 0,
        sort: options.sort ?? "newest",
      },
      schema: ProjectListResponseSchema,
    });
  }

  /** Creates a new project. */
  async create(name: string): Promise<ProjectCreateResponse> {
    return this.http.request<ProjectCreateResponse>({
      method: "POST",
      path: "/projects",
      json: { name },
      schema: ProjectCreateResponseSchema,
    });
  }

  /**
   * Deletes a project (`DELETE /api/projects/:projectId`).
   *
   * With `deleteAssets: true` the server also removes assets that are only
   * referenced by this project, so a test project can be cleaned up entirely.
   */
  async delete(
    projectId: string,
    options: DeleteProjectOptions = {},
  ): Promise<ProjectDeleteResponse> {
    return this.http.request<ProjectDeleteResponse>({
      method: "DELETE",
      path: `/projects/${projectId}`,
      query: { deleteAssets: options.deleteAssets ?? true },
      schema: ProjectDeleteResponseSchema,
    });
  }
}
