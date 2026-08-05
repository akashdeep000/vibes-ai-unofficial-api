import {
  DEFAULT_VARIATION_COUNT,
  EXTEND_VIDEO_DURATION_INCREMENT_S,
  GENERATED_VIDEO_DURATION_S,
  GENERATION_TYPE,
  IMAGE_MODEL,
  POLL_DEFAULTS,
  PROMPT_MODEL,
  RESOLUTION,
  SOURCE_ROLE,
  VIDEO_MODEL,
} from "../constants.js";
import { type HttpClient } from "../http/http-client.js";
import { batchId, contentItemId, extendBatchId, mgRequestId } from "../ids.js";
import { waitFor, type WaitOptions } from "../polling/wait-for.js";
import type { Asset } from "../schemas/assets.js";
import type { AspectRatio, Dimensions } from "../schemas/common.js";
import type { SourceContentItemId } from "../schemas/batches.js";
import {
  BatchSkeletonSchema,
  ExtendGenerateRequestSchema,
  GenerateVideosResponseSchema,
  T2VGenerateRequestSchema,
  type BatchUpdatePayload,
  type ExtendGenerateRequest,
  type GenerateVideosResponse,
  type T2VGenerateRequest,
} from "../schemas/generation.js";
import type { AssetsResponse } from "../schemas/assets.js";
import { resolveAspectRatio, dimensionsToAspectRatio } from "../utils/aspect-ratio.js";
import type { AssetsResource } from "./assets.js";
import type { BatchesResource } from "./batches.js";
import type {
  BatchContentItem,
  BatchGetResponse,
  BatchStreamEvent,
  BatchStreamItem,
  GenerationBatch,
} from "../schemas/batches.js";
import { VibesPollTimeoutError } from "../errors.js";

/** A media reference usable as a start frame (an uploaded image). */
export interface StartFrame {
  /** URL of the image (e.g. `cdnUrl` from an upload). */
  imageUrl: string;
  /** Media entity id of the image (e.g. `mediaEntId` from an upload). */
  imageEntId: string;
  /** Content item id of the image in the project, when known. */
  contentItemId?: string;
  /** Pixel dimensions of the image; used to derive the aspect ratio. */
  dimensions?: Dimensions;
}

/** An optional end-frame for t2v generation. */
export interface EndFrame {
  imageUrl: string;
  imageEntId: string;
  contentItemId?: string;
}

/** A video that can be extended. */
export interface VideoSource {
  mediaEntId: string;
  videoUrl: string;
  /** Content item id of the video in the project, when known. */
  contentItemId?: string;
  /** Dimensions of the video; used to build `config.metadata`. */
  metadata?: { dimensions: Dimensions; aspectRatio: AspectRatio };
}

/** Options for a text-to-video generation. */
export interface T2VGenerateOptions {
  projectId: string;
  /** The prompt describing the scene to animate. */
  prompt: string;
  /**
   * The start-frame image the video is generated from. Omit to run a
   * prompt-only (no reference frame) generation.
   */
  startFrame?: StartFrame;
  /** Optional end-frame image. */
  endFrame?: EndFrame;
  /**
   * Aspect ratio override.
   *
   * When a start frame is provided the platform keys the output to the
   * frame's dimensions, so this defaults to the ratio of the start frame
   * image (pass `dimensions` on the frame to have it derived). For
   * prompt-only generations there is no frame to derive from, so this
   * defaults to `9:16` (the platform default) and the config value is
   * respected.
   */
  aspectRatio?: AspectRatio;
  /** Model that animates the video. */
  videoModel?: string;
  /** Model used for prompt images. */
  imageModel?: string;
  /** Model that refines the prompt. */
  promptModel?: string;
  /** Output resolution. */
  resolution?: string;
  /** Generate style variants of the prompt. */
  batchVariation?: boolean;
  /** How many variants to generate (each is a separate input). */
  variations?: number;
}

/** Options for a video-extend generation. */
export interface ExtendGenerateOptions {
  projectId: string;
  /** The prompt governing the extension. */
  prompt: string;
  /** The video to extend. */
  source: VideoSource;
  /** Direction for how the video should be extended. */
  extendDirective?: string;
  /** Audio track carried into the extension; defaults to the source URL. */
  audioSourceUrl?: string;
  videoModel?: string;
  imageModel?: string;
}

export interface GenerateAndWaitResult {
  /** The batch as reported by the server once complete. */
  batch: GenerationBatch;
  /** Completed video content items of the batch. */
  videos: BatchContentItem[];
}

export interface ExtendAndWaitResult {
  /** The completed video asset, as reported by the assets endpoint. */
  video: Asset;
}

export interface ExtendToDurationOptions extends ExtendGenerateOptions {
  /** Target total duration in seconds (e.g. 30 for a 30s video). */
  targetSeconds: number;
  /** Duration of the source video in seconds; defaults to 5s (fresh generation). */
  sourceDurationSeconds?: number;
  poll?: WaitOptions;
  /** Called after each extension completes. */
  onExtend?: (info: { video: Asset; totalDurationSeconds: number; extensions: number }) => void;
}

/**
 * Video generation endpoints and high-level orchestration
 * (`POST /api/generate/videos` + batch registration + polling).
 */
export class VideosResource {
  constructor(
    private readonly http: HttpClient,
    private readonly batches: BatchesResource,
    private readonly assets: AssetsResource,
  ) {}

  /**
   * Submits a text-to-video generation from a start frame and registers the
   * batch for tracking. Does not wait for completion — use `generateAndWait`.
   *
   * The skeleton is registered *before* `POST /generate/videos` (matching the
   * browser flow): a generation submitted for an unregistered batch is
   * materialized as a detached epoch-suffixed media item, leaving an
   * unresolved "pending" strip on the project timeline. Registering first
   * makes the server place the output directly on the registered content
   * slots.
   */
  async generateT2V(options: T2VGenerateOptions): Promise<GenerateVideosResponse> {
    const request = this.buildT2VRequest(options);

    await this.registerBatch(
      request.batchId,
      options.projectId,
      options.prompt,
      request.config,
      options.variations,
      request.config.promptModel,
      request.config.imageModel,
      request.config.videoModel,
    );

    return this.http.request<GenerateVideosResponse>({
      method: "POST",
      path: "/generate/videos",
      json: request,
      schema: GenerateVideosResponseSchema,
    });
  }

  /**
   * Submits a video extension and registers the batch for tracking.
   * Does not wait for completion — use `extendAndWait`.
   */
  async generateExtend(options: ExtendGenerateOptions): Promise<GenerateVideosResponse> {
    const request = this.buildExtendRequest(options);

    // Extend batches register with an empty content list (observed in traces).
    await this.registerBatch(
      request.batchId,
      options.projectId,
      options.prompt,
      request.config,
      0,
      request.config.videoModel,
      request.config.imageModel,
      request.config.videoModel,
    );

    return this.http.request<GenerateVideosResponse>({
      method: "POST",
      path: "/generate/videos",
      json: request,
      schema: GenerateVideosResponseSchema,
    });
  }

  /**
   * Generates videos from a start frame and polls until the batch completes.
   * Returns the completed batch and its finished video content items.
   */
  async generateAndWait(
    options: T2VGenerateOptions,
    poll: WaitOptions = {},
  ): Promise<GenerateAndWaitResult> {
    const submitted = await this.generateT2V(options);
    return this.waitForBatch(submitted.batchId, poll);
  }

  /**
   * Extends a video and polls until the new asset is ready.
   */
  async extendAndWait(
    options: ExtendGenerateOptions,
    poll: WaitOptions = {},
  ): Promise<ExtendAndWaitResult> {
    const submitted = await this.generateExtend(options);
    return this.waitForExtendAsset(options.projectId, submitted.batchId, poll);
  }

  /**
   * Repeatedly extends a video until it reaches `targetSeconds`.
   *
   * Fresh generations are 5s; every extend adds 4s. Returns the final video
   * asset and the resulting total duration.
   */
  async extendToDuration(options: ExtendToDurationOptions): Promise<{
    video: Asset;
    totalDurationSeconds: number;
    extensions: number;
  }> {
    if (options.targetSeconds <= 0) {
      throw new RangeError("targetSeconds must be positive");
    }
    if (!options.source.videoUrl) {
      throw new TypeError("extendToDuration requires a source videoUrl");
    }

    let source: VideoSource = options.source;
    let total = options.sourceDurationSeconds ?? GENERATED_VIDEO_DURATION_S;
    let extensions = 0;
    let video: Asset | undefined;

    while (total < options.targetSeconds) {
      const result = await this.extendAndWait(
        {
          projectId: options.projectId,
          prompt: options.prompt,
          source,
          ...(options.extendDirective !== undefined
            ? { extendDirective: options.extendDirective }
            : {}),
          ...(options.audioSourceUrl !== undefined
            ? { audioSourceUrl: options.audioSourceUrl }
            : {}),
          ...(options.videoModel !== undefined ? { videoModel: options.videoModel } : {}),
          ...(options.imageModel !== undefined ? { imageModel: options.imageModel } : {}),
        },
        options.poll,
      );
      video = result.video;
      source = {
        mediaEntId: result.video.mediaEntId ?? result.video.id,
        videoUrl: result.video.videoUrl!,
        ...(result.video.contentItemId !== null
          ? { contentItemId: result.video.contentItemId }
          : {}),
        ...(result.video.structuredOutput?.metadata != null
          ? {
              metadata: {
                dimensions: result.video.structuredOutput.metadata.dimensions,
                aspectRatio: dimensionsToAspectRatio(
                  result.video.structuredOutput.metadata.dimensions,
                ),
              },
            }
          : {}),
      };
      total += EXTEND_VIDEO_DURATION_INCREMENT_S;
      extensions += 1;
      options.onExtend?.({ video: result.video, totalDurationSeconds: total, extensions });
    }

    return {
      video: video!,
      totalDurationSeconds: total,
      extensions,
    };
  }

  /** Polls the generation-batches endpoint until the batch completes. */
  async waitForBatch(batchId: string, poll: WaitOptions = {}): Promise<GenerateAndWaitResult> {
    const { batch } = poll.stream
      ? await this.waitForBatchStream(batchId, poll)
      : await waitFor<BatchGetResponse>({
          description: batchId,
          ...poll,
          fetch: () => this.batches.get(batchId),
          isDone: (state) =>
            state.batch !== null && (state.batch.isComplete || state.batch.hasError),
        });

    if (batch === null) {
      throw new Error(`Batch ${batchId} not found`);
    }
    const videos = batch.content.filter(
      (item) => item.type === "videos" && item.videoUrl !== null && item.error === null,
    );

    if (batch.hasError && videos.length === 0) {
      throw new Error(`Batch ${batchId} failed: ${batch.error ?? "unknown error"}`);
    }

    // In stream mode the finalize PUT was already issued from the stream data.
    if (!poll.stream) {
      await this.batches.update(toUpdatePayload(batch));
    }
    return { batch, videos };
  }

  /** Stream variant of `waitForBatch`: consumes SSE until the stream closes. */
  private async waitForBatchStream(
    batchId: string,
    poll: WaitOptions,
  ): Promise<{ batch: GenerationBatch | null }> {
    const timeoutMs = poll.timeoutMs ?? POLL_DEFAULTS.timeoutMs;
    const deadline = Date.now() + timeoutMs;
    const events: BatchStreamEvent[] = [];

    try {
      await this.batches.stream(batchId, {
        ...(poll.signal !== undefined ? { signal: poll.signal } : {}),
        onEvent: (event) => {
          events.push(event);
          poll.onPoll?.(event);
          if (Date.now() >= deadline) {
            throw new VibesPollTimeoutError(
              timeoutMs,
              events[events.length - 1],
              `stream ${batchId}`,
            );
          }
        },
      });
    } catch (err) {
      if (err instanceof VibesPollTimeoutError) throw err;
      // An aborted read surfaces as a DOMException; surface the underlying error.
      if (poll.signal?.aborted) {
        throw poll.signal.reason instanceof Error
          ? poll.signal.reason
          : new DOMException("Stream aborted", "AbortError");
      }
      throw err;
    }

    const lastEvent = events[events.length - 1];
    if (lastEvent === undefined || !lastEvent.isComplete) {
      throw new VibesPollTimeoutError(timeoutMs, lastEvent, `stream ${batchId}`);
    }

    // The batch record is still in its in-flight shape (`config: null`,
    // content loading) until we finalize it; the stream's last event carries
    // the real output, so the PUT is built from that rather than the GET.
    await this.batches.update(streamFinalizePayload(batchId, lastEvent.items));

    // Fetch the completed batch record now that it has been finalized.
    return waitFor<BatchGetResponse>({
      description: batchId,
      ...poll,
      fetch: () => this.batches.get(batchId),
      isDone: (state) => state.batch !== null && (state.batch.isComplete || state.batch.hasError),
    });
  }

  /**
   * Waits for the batch to finish, finalizes it (PUT), then resolves the
   * resulting video asset from the project's asset list.
   */
  async waitForExtendAsset(
    projectId: string,
    batchId: string,
    poll: WaitOptions = {},
  ): Promise<ExtendAndWaitResult> {
    const { batch } = poll.stream
      ? await this.waitForBatchStream(batchId, poll)
      : await waitFor<BatchGetResponse>({
          description: batchId,
          ...poll,
          fetch: () => this.batches.get(batchId),
          isDone: (state) =>
            state.batch !== null && (state.batch.isComplete || state.batch.hasError),
        });

    if (batch === null) {
      throw new Error(`Batch ${batchId} not found`);
    }
    // In stream mode the finalize PUT was already issued from the stream data.
    if (!poll.stream) {
      await this.batches.update(toUpdatePayload(batch));
    }

    const assets = await waitFor<AssetsResponse>({
      description: `${batchId} asset`,
      ...poll,
      fetch: () => this.assets.list(projectId),
      isDone: (state) =>
        state.assets.some(
          (asset) =>
            asset.batchId === batchId && asset.type === "videos" && asset.videoUrl !== null,
        ),
    });

    const video = assets.assets.find(
      (asset) => asset.batchId === batchId && asset.type === "videos" && asset.videoUrl !== null,
    );
    if (!video) {
      // Fallback: surface the completed batch content even if the asset list
      // has not picked it up yet.
      return { video: { batchId, ...batchContentToAsset(batch) } as Asset };
    }
    return { video };
  }

  // ----------------------------------------------------------------------
  // Request builders
  // ----------------------------------------------------------------------

  private buildT2VRequest(options: T2VGenerateOptions): T2VGenerateRequest {
    const frame = options.startFrame;
    const ratio = resolveAspectRatio(frame?.dimensions, options.aspectRatio);

    const baseConfig = {
      directGeneration: true as const,
      promptModel: options.promptModel ?? PROMPT_MODEL,
      aspectRatio: ratio,
      imageModel: options.imageModel ?? IMAGE_MODEL,
      videoModel: options.videoModel ?? VIDEO_MODEL.SHORT,
      resolution: options.resolution ?? RESOLUTION,
      batchVariation: options.batchVariation ?? true,
    };

    const sourceContentItemIds: SourceContentItemId[] = [];
    if (frame?.contentItemId) {
      sourceContentItemIds.push({
        id: frame.contentItemId,
        source: SOURCE_ROLE.START_FRAME,
      });
    }
    if (options.endFrame?.contentItemId) {
      sourceContentItemIds.push({
        id: options.endFrame.contentItemId,
        source: SOURCE_ROLE.END_FRAME,
      });
    }

    const variations = Math.max(1, options.variations ?? DEFAULT_VARIATION_COUNT);
    const id = batchId();

    const handle = (): { image_url: string; image_ent_id: string; source: "asset" } => ({
      image_url: frame!.imageUrl,
      image_ent_id: frame!.imageEntId,
      source: "asset",
    });

    const inputs = Array.from({ length: variations }, () =>
      frame
        ? {
            type: "image" as const,
            imageUrl: frame.imageUrl,
            imageEntId: frame.imageEntId,
            prompt: options.prompt,
            originalPrompt: options.prompt,
            config: {
              ...baseConfig,
              sourceContentItemIds,
              directPromptImageHandle: handle(),
              ...(options.endFrame?.imageUrl !== undefined
                ? { lastFrameImageUrl: options.endFrame.imageUrl }
                : {}),
              ...(options.endFrame?.imageEntId !== undefined
                ? { lastFrameImageEntId: options.endFrame.imageEntId }
                : {}),
            },
          }
        : {
            type: "prompt" as const,
            value: options.prompt,
            original_prompt: options.prompt,
            config: baseConfig,
          },
    );

    const topConfig: T2VGenerateRequest["config"] = {
      ...baseConfig,
      generationType: GENERATION_TYPE.T2V,
    };
    if (frame) {
      topConfig.sourceContentItemIds = sourceContentItemIds;
      topConfig.directPromptImageHandle = handle();
    }
    if (options.endFrame?.imageUrl !== undefined) {
      topConfig.lastFrameImageUrl = options.endFrame.imageUrl;
    }
    if (options.endFrame?.imageEntId !== undefined) {
      topConfig.lastFrameImageEntId = options.endFrame.imageEntId;
    }

    const request: T2VGenerateRequest = {
      inputs,
      config: topConfig,
      batchId: id,
      mg_request_id: mgRequestId(),
      projectId: options.projectId,
    };

    return T2VGenerateRequestSchema.parse(request);
  }

  private buildExtendRequest(options: ExtendGenerateOptions): ExtendGenerateRequest {
    const metadata = options.source.metadata ?? {
      dimensions: { width: 720, height: 1280 },
      aspectRatio: "9:16" as AspectRatio,
    };

    const sourceContentItemIds: SourceContentItemId[] = options.source.contentItemId
      ? [{ id: options.source.contentItemId, source: SOURCE_ROLE.EXTEND_VIDEO }]
      : [];

    const config = {
      metadata,
      videoModel: options.videoModel ?? VIDEO_MODEL.EXTEND,
      imageModel: options.imageModel ?? IMAGE_MODEL,
      generationType: GENERATION_TYPE.EXTEND,
      sourceVideoUrl: options.source.videoUrl,
      ...(options.audioSourceUrl !== undefined
        ? { audioSourceUrl: options.audioSourceUrl }
        : { audioSourceUrl: options.source.videoUrl }),
      directGeneration: true as const,
      sourceContentItemIds,
      ...(options.extendDirective !== undefined
        ? { extendDirective: options.extendDirective }
        : {}),
    };

    const request: ExtendGenerateRequest = {
      inputs: [
        {
          type: "extend" as const,
          mediaEntId: options.source.mediaEntId,
          videoUrl: options.source.videoUrl,
          prompt: options.prompt,
          ...(options.extendDirective !== undefined
            ? { extendDirective: options.extendDirective }
            : {}),
          config,
        },
      ],
      config,
      batchId: extendBatchId(),
      mg_request_id: mgRequestId(),
      projectId: options.projectId,
    };

    return ExtendGenerateRequestSchema.parse(request);
  }

  private async registerBatch(
    id: string,
    projectId: string,
    prompt: string,
    config: unknown,
    variations: number | undefined,
    promptModel: string,
    imageModel: string,
    videoModel: string,
  ): Promise<void> {
    const count = Math.max(0, variations ?? DEFAULT_VARIATION_COUNT);
    const skeleton = BatchSkeletonSchema.parse({
      id,
      type: "videos",
      prompt,
      timestamp: new Date().toISOString(),
      content: Array.from({ length: count }, (_, i) => ({
        id: contentItemId(id, i),
        type: "videos" as const,
        isLoading: true,
      })),
      isComplete: false,
      config,
      promptModel,
      imageModel,
      videoModel,
      generationStartTime: new Date().toISOString(),
      isDirectGeneration: true,
      projectId,
    });
    await this.batches.create(skeleton);
  }
}

/** Builds the `PUT /api/generation-batches` payload from a completed batch. */
function toUpdatePayload(batch: GenerationBatch): BatchUpdatePayload {
  return {
    id: batch.id,
    content: batch.content.map((item) => ({
      id: item.id,
      type: item.type,
      isLoading: item.isLoading,
      videoUrl: item.videoUrl,
      videoHandle: item.videoHandle,
      imageUrl: item.imageUrl,
      imageHandle: item.imageHandle,
      data: stringifyData(item.data),
      error: item.error,
    })),
    isComplete: batch.isComplete,
    generationEndTime: batch.generationEndTime ?? new Date().toISOString(),
  };
}

/**
 * Builds the `PUT /api/generation-batches` payload from the SSE stream's
 * final event. The batch record is still in-flight when the stream closes,
 * so the real media URLs come from the stream items.
 *
 * Resolved stream items use `<batch>-content-<i>-<epochMs>` ids while the
 * skeleton placeholder keeps `<batch>-content-<i>`. The server's content
 * slots (and the finalize PUT, per the browser capture) expect the bare
 * `<batch>-content-<i>` id marked `isLoading: false` — otherwise the slot
 * stays a loading placeholder and the video shows as "pending" in the UI.
 */
function streamFinalizePayload(batchId: string, items: BatchStreamItem[]): BatchUpdatePayload {
  const byBase = new Map<string, BatchStreamItem>();
  for (const item of items) {
    const base = stripEpochSuffix(item.id);
    const settled = !item.isLoading && (item.videoUrl !== null || item.error !== null);
    if (settled || !byBase.has(base)) {
      byBase.set(base, item);
    }
  }
  return {
    id: batchId,
    content: [...byBase.values()].map((item) => ({
      id: stripEpochSuffix(item.id),
      type: item.type ?? "videos",
      isLoading: false,
      videoUrl: item.videoUrl,
      videoHandle: item.videoHandle,
      imageUrl: item.imageUrl,
      imageHandle: item.imageHandle,
      data: stringifyData(item.data),
      error: item.error,
    })),
    isComplete: true,
    generationEndTime: new Date().toISOString(),
  };
}

/** Drops the resolved-item suffix: `<base>-content-<i>-<epochMs>` -> `<base>-content-<i>`. */
function stripEpochSuffix(id: string): string {
  return id.replace(/(-content-\d+)-(\d+)$/, "$1");
}

/** `data` travels as a JSON *string*, not an object, in the PUT body. */
function stringifyData(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data === null || data === undefined) return null;
  return JSON.stringify(data);
}

/** Minimal asset-like view of a batch content item (fallback path). */
function batchContentToAsset(batch: GenerationBatch): Partial<Asset> {
  const item = batch.content.find((c: BatchContentItem) => c.type === "videos" && c.videoUrl);
  return {
    batchId: batch.id,
    type: "videos",
    videoUrl: item?.videoUrl ?? null,
    imageUrl: item?.imageUrl ?? null,
    contentItemId: item?.contentItemId ?? null,
    mediaEntId: item?.mediaEntId ?? null,
    videoHandle: item?.videoHandle ?? null,
    prompt: item?.videoPrompt ?? item?.prompt ?? null,
    structuredOutput: item?.structuredOutput ?? null,
    relationship: "created",
  } as Asset;
}
