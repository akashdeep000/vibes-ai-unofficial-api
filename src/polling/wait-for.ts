import { POLL_DEFAULTS } from "../constants.js";
import { VibesPollTimeoutError } from "../errors.js";
import { jitter, sleep } from "../utils/sleep.js";

export interface WaitOptions {
  /** Delay between polls. */
  intervalMs?: number;
  /** Hard deadline; throws VibesPollTimeoutError when exceeded. */
  timeoutMs?: number;
  /** Max uniform jitter added to each interval. */
  jitterMs?: number;
  /** Abort polling early. */
  signal?: AbortSignal;
  /** Called with every polled state. */
  onPoll?: (state: unknown) => void;
  /** Human-readable description for error messages. */
  description?: string;
  /**
   * When true, wait via the SSE `/generation-batches/:id/stream` endpoint
   * instead of repeatedly polling. Honored by `videos.waitForBatch` and
   * `videos.waitForExtendAsset`.
   */
  stream?: boolean;
}

export interface WaitForOptions<T> extends WaitOptions {
  /** Fetches the current state. */
  fetch: () => Promise<T>;
  /** Whether the state satisfies the target condition. */
  isDone: (state: T) => boolean;
}

/**
 * Polls `fetch` until `isDone` is satisfied, the timeout elapses, or the
 * signal aborts.
 */
export async function waitFor<T>(options: WaitForOptions<T>): Promise<T> {
  const intervalMs = options.intervalMs ?? POLL_DEFAULTS.intervalMs;
  const timeoutMs = options.timeoutMs ?? POLL_DEFAULTS.timeoutMs;
  const jitterMs = options.jitterMs ?? POLL_DEFAULTS.jitterMs;

  const deadline = Date.now() + timeoutMs;
  let lastState: T | undefined;

  for (;;) {
    const state = await options.fetch();
    lastState = state;
    options.onPoll?.(state);
    if (options.isDone(state)) return state;

    if (Date.now() >= deadline) {
      throw new VibesPollTimeoutError(timeoutMs, lastState, options.description);
    }
    if (options.signal?.aborted) {
      throw options.signal.reason instanceof Error
        ? options.signal.reason
        : new DOMException("Polling aborted", "AbortError");
    }
    await sleep(intervalMs + jitter(jitterMs));
  }
}
