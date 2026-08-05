/** Small async utilities used across the client. */

/** Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Uniform jitter in `[0, maxJitter)`. Used to desynchronize pollers and
 * retries so bursts of requests don't pile onto the server.
 */
export function jitter(maxJitter: number): number {
  return Math.random() * maxJitter;
}
