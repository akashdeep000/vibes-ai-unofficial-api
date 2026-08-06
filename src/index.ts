/**
 * vibes-ai — unofficial typed client for the vibes.ai AI video generation API.
 */

export { VibesClient } from "./client.js";
export type { VibesClientOptions } from "./client.js";

export { browserSession, syncSessionFromBrowser } from "./auth/browser-session.js";
export type { BrowserSessionConfig } from "./auth/browser-session.js";

export { HttpClient, parseFirstJsonObject } from "./http/http-client.js";
export type { HttpClientOptions, RequestOptions, SessionProvider } from "./http/http-client.js";

export { AuthResource } from "./resources/auth.js";
export { ProjectsResource } from "./resources/projects.js";
export type { ListProjectsOptions, DeleteProjectOptions } from "./resources/projects.js";
export { MediaResource } from "./resources/media.js";
export type { UploadableFile, UploadMediaOptions } from "./resources/media.js";
export { AssetsResource } from "./resources/assets.js";
export type { ListProjectAssetsOptions } from "./resources/assets.js";
export { BatchesResource } from "./resources/batches.js";
export type { ListBatchesOptions } from "./resources/batches.js";
export { ContentItemsResource } from "./resources/content-items.js";
export { VideosResource } from "./resources/videos.js";
export type {
  StartFrame,
  EndFrame,
  VideoSource,
  T2VGenerateOptions,
  ExtendGenerateOptions,
  ExtendToDurationOptions,
  GenerateAndWaitResult,
  ExtendAndWaitResult,
} from "./resources/videos.js";

export {
  VibesError,
  VibesAuthError,
  VibesHttpError,
  VibesValidationError,
  VibesParseError,
  VibesPollTimeoutError,
} from "./errors.js";

export {
  API_BASE_URL,
  API_PREFIX,
  GENERATED_VIDEO_DURATION_S,
  EXTEND_VIDEO_DURATION_INCREMENT_S,
  VIDEO_MODEL,
  IMAGE_MODEL,
  PROMPT_MODEL,
  RESOLUTION,
  DEFAULT_VARIATION_COUNT,
  SOURCE_ROLE,
  ASPECT_RATIO,
  GENERATION_TYPE,
  POLL_DEFAULTS,
  RETRY_DEFAULTS,
} from "./constants.js";

export { uuidv7, batchId, extendBatchId, mgRequestId, contentItemId } from "./ids.js";

export { waitFor } from "./polling/wait-for.js";
export type { WaitOptions, WaitForOptions } from "./polling/wait-for.js";

export { dimensionsToAspectRatio, resolveAspectRatio } from "./utils/aspect-ratio.js";
export { withRetry, DEFAULT_RETRY_OPTIONS } from "./utils/retry.js";
export type { RetryOptions } from "./utils/retry.js";

export * from "./schemas/index.js";
