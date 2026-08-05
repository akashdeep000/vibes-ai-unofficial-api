import { RETRY_DEFAULTS } from "../constants.js";
import { VibesError } from "../errors.js";
import { jitter, sleep } from "./sleep.js";

/** Options controlling retry behaviour of the HTTP layer. */
export interface RetryOptions {
  /** Maximum number of retries after the initial attempt. */
  maxRetries: number;
  /** Base delay before the first retry (exponential backoff). */
  baseDelayMs: number;
  /** Upper bound for the backoff delay. */
  maxDelayMs: number;
  /** HTTP status codes that trigger a retry. */
  retryStatuses: readonly number[];
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: RETRY_DEFAULTS.maxRetries,
  baseDelayMs: RETRY_DEFAULTS.baseDelayMs,
  maxDelayMs: RETRY_DEFAULTS.maxDelayMs,
  retryStatuses: RETRY_DEFAULTS.retryStatuses,
};

/**
 * Whether a caught error looks like a transient network failure.
 *
 * `fetch` rejects with a bare `TypeError` when the connection fails or is
 * reset; retrying those is safe. Everything else (including all VibesError
 * subclasses) is assumed fatal unless it carries a retryable status.
 */
function isTransientNetworkError(error: unknown): boolean {
  if (error instanceof VibesError) return false;
  return error instanceof Error && error.name === "TypeError";
}

function shouldRetry(
  error: unknown,
  retryStatuses: readonly number[],
): { retry: boolean; status?: number } {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    const status = (error as { status: number }).status;
    return { retry: retryStatuses.includes(status), status };
  }
  return { retry: isTransientNetworkError(error) };
}

/**
 * Runs `fn`, retrying on transient network errors and configured HTTP status
 * codes with exponential backoff plus jitter.
 *
 * @returns the result of a successful invocation, or the last error.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      const { retry } = shouldRetry(error, options.retryStatuses);
      if (!retry || attempt >= options.maxRetries) {
        throw error;
      }
      const backoff = Math.min(
        options.baseDelayMs * 2 ** attempt + jitter(options.baseDelayMs),
        options.maxDelayMs,
      );
      await sleep(backoff);
      attempt += 1;
    }
  }
}
