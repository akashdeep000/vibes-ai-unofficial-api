import { type HttpClient, parseFirstJsonObject } from "../http/http-client.js";
import { VibesValidationError } from "../errors.js";
import { safeJsonParse } from "../utils/json.js";
import {
  BatchCreateResponseSchema,
  BatchGetResponseSchema,
  BatchListResponseSchema,
  BatchStreamEventSchema,
  BatchUpdateResponseSchema,
  type BatchCreateResponse,
  type BatchGetResponse,
  type BatchListResponse,
  type BatchStreamEvent,
  type BatchUpdateResponse,
} from "../schemas/batches.js";
import type { BatchSkeleton, BatchUpdatePayload } from "../schemas/generation.js";

export interface ListBatchesOptions {
  limit?: number;
  offset?: number;
}

export interface StreamBatchOptions {
  signal?: AbortSignal;
  /** Called with every parsed stream event as it arrives. */
  onEvent?: (event: BatchStreamEvent) => void | Promise<void>;
}

/** Generation-batch endpoints. */
export class BatchesResource {
  constructor(private readonly http: HttpClient) {}

  /** Lists batches for a project (`GET /api/projects/:projectId/batches`). */
  async list(projectId: string, options: ListBatchesOptions = {}): Promise<BatchListResponse> {
    return this.http.request<BatchListResponse>({
      method: "GET",
      path: `/projects/${projectId}/batches`,
      query: { limit: options.limit ?? 25, offset: options.offset ?? 0 },
      schema: BatchListResponseSchema,
    });
  }

  /** Fetches a single tracked batch (`GET /api/generation-batches/:batchId`). */
  async get(batchId: string): Promise<BatchGetResponse> {
    return this.http.request<BatchGetResponse>({
      method: "GET",
      path: `/generation-batches/${batchId}`,
      schema: BatchGetResponseSchema,
    });
  }

  /**
   * Streams batch progress over SSE (`GET /api/generation-batches/:batchId/stream`).
   *
   * The endpoint emits `data:` lines that repeat the full item state each
   * time something changes, ending with `isComplete: true` once every item
   * has resolved. Resolves once the stream fully closes.
   */
  async stream(batchId: string, options: StreamBatchOptions = {}): Promise<void> {
    let buffer = "";
    const onChunk = async (chunk: Uint8Array) => {
      buffer += new TextDecoder().decode(chunk);
      // SSE frames are terminated by a blank line; `data:` holds the JSON.
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice("data:".length).trim();
        const parsed = payload !== "" ? safeJsonParse(payload) : undefined;
        if (parsed === undefined) continue;
        const result = BatchStreamEventSchema.safeParse(parsed);
        if (!result.success) {
          throw new VibesValidationError(
            result.error.issues.map(
              (issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`,
            ),
            parsed,
          );
        }
        // Multiple events may share one frame; emit each distinct object.
        await options.onEvent?.(result.data);
      }
    };

    await this.http.stream({
      path: `/generation-batches/${batchId}/stream`,
      ...(options.signal !== undefined ? { signal: options.signal } : {}),
      onChunk,
    });
  }

  /**
   * Registers a batch for tracking (`POST /api/generation-batches`).
   *
   * Called immediately after `POST /api/generate/videos` with the batch
   * skeleton so the server starts reporting progress. The response is
   * sometimes two concatenated JSON blobs; both are parsed defensively.
   */
  async create(skeleton: BatchSkeleton): Promise<BatchCreateResponse> {
    const text = await this.http.request<string>({
      method: "POST",
      path: "/generation-batches",
      json: skeleton,
      rawText: true,
    });
    return this.validateCreate(parseFirstJsonObject(text));
  }

  /** Updates the state of a batch (`PUT /api/generation-batches`). */
  async update(payload: BatchUpdatePayload): Promise<BatchUpdateResponse> {
    return this.http.request<BatchUpdateResponse>({
      method: "PUT",
      path: "/generation-batches",
      json: payload,
      schema: BatchUpdateResponseSchema,
    });
  }

  private validateCreate(parsed: unknown): BatchCreateResponse {
    const result = BatchCreateResponseSchema.safeParse(parsed);
    if (!result.success) {
      throw new VibesValidationError(
        result.error.issues.map(
          (issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`,
        ),
        parsed,
      );
    }
    return result.data;
  }
}
