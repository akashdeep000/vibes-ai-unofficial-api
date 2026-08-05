/**
 * Observed constants of the vibes.ai platform.
 *
 * These are derived from request traces captured from the production web app
 * (see `requests/`). Because the platform is an unofficial, unversioned API,
 * they may drift — tests in `test/schema` and `test/live` guard against that.
 */

export const API_BASE_URL = "https://vibes.ai";

/** Endpoints served under this base path. */
export const API_PREFIX = "/api";

/**
 * Duration of a freshly generated (non-extended) video, in seconds.
 *
 * Observed in generated asset URLs (`duration_s` field of the CDN signature)
 * and confirmed manually: plain t2v generations are 5 seconds long.
 */
export const GENERATED_VIDEO_DURATION_S = 5;

/**
 * How many seconds a single extend operation appends to a video.
 *
 * Observed in extend requests/responses: each extend adds 4 seconds to the
 * source video.
 */
export const EXTEND_VIDEO_DURATION_INCREMENT_S = 4;

/** Video models seen on the platform. */
export const VIDEO_MODEL = {
  SHORT: "midjen-short",
  EXTEND: "midjen-extend",
} as const;

/** Image model used for direct-generation prompts. */
export const IMAGE_MODEL = "midjen-base";

/** Prompt enhancement model. */
export const PROMPT_MODEL = "gemini-2.5-flash";

/** Supported output resolutions. */
export const RESOLUTION = "720p" as const;

/**
 * Number of video variants produced when `batchVariation` is enabled.
 * Observed: the web app submits 4 identical inputs per batch.
 */
export const DEFAULT_VARIATION_COUNT = 4;

/** Source roles used in `sourceContentItemIds`. */
export const SOURCE_ROLE = {
  START_FRAME: "start_frame",
  END_FRAME: "end_frame",
  EXTEND_VIDEO: "extend_video",
} as const;

/** Aspect ratios supported by the platform. */
export const ASPECT_RATIO = {
  "16:9": "16:9",
  "9:16": "9:16",
  "1:1": "1:1",
} as const;

/** Generation types understood by `/api/generate/*`. */
export const GENERATION_TYPE = {
  T2V: "t2v",
  T2I: "t2i",
  EXTEND: "extend",
} as const;

/** Polling defaults for `waitFor` helpers. */
export const POLL_DEFAULTS = {
  intervalMs: 3_000,
  timeoutMs: 15 * 60 * 1_000,
  jitterMs: 500,
} as const;

/** Retry defaults for the HTTP layer. */
export const RETRY_DEFAULTS = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 8_000,
  /** Which status codes trigger a retry. */
  retryStatuses: [408, 429, 500, 502, 503, 504] as const,
} as const;
