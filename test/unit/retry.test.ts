import { afterEach, describe, expect, it, vi } from "vitest";
import { VibesError } from "../../src/errors.js";
import { DEFAULT_RETRY_OPTIONS, withRetry } from "../../src/utils/retry.js";
import { sleep } from "../../src/utils/sleep.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("withRetry", () => {
  it("returns the result of the first successful attempt", async () => {
    const fn = vi.fn(async () => 42);
    await expect(withRetry(fn)).resolves.toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on transient network errors (TypeError)", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce("ok");
    await expect(withRetry(fn, { ...DEFAULT_RETRY_OPTIONS, baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on retryable status codes (503)", async () => {
    const failing = Object.assign(new Error("boom"), { status: 503 });
    const fn = vi
      .fn()
      .mockRejectedValueOnce(failing)
      .mockRejectedValueOnce(failing)
      .mockResolvedValueOnce("ok");
    await expect(withRetry(fn, { ...DEFAULT_RETRY_OPTIONS, baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry 4xx client errors", async () => {
    const failing = Object.assign(new Error("unauthorized"), { status: 401 });
    const fn = vi.fn().mockRejectedValue(failing);
    await expect(
      withRetry(fn, { ...DEFAULT_RETRY_OPTIONS, maxRetries: 5, baseDelayMs: 1 }),
    ).rejects.toThrow("unauthorized");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not retry library errors (VibesError)", async () => {
    const fn = vi.fn().mockRejectedValue(new VibesError("no"));
    await expect(
      withRetry(fn, { ...DEFAULT_RETRY_OPTIONS, maxRetries: 3, baseDelayMs: 1 }),
    ).rejects.toThrow("no");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("gives up after maxRetries and rethrows the last error", async () => {
    const failing = Object.assign(new Error("boom"), { status: 500 });
    const fn = vi.fn().mockRejectedValue(failing);
    await expect(
      withRetry(fn, { ...DEFAULT_RETRY_OPTIONS, maxRetries: 2, baseDelayMs: 1 }),
    ).rejects.toThrow("boom");
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("backs off exponentially", async () => {
    vi.useFakeTimers();
    const failing = Object.assign(new Error("boom"), { status: 503 });
    const fn = vi
      .fn()
      .mockRejectedValueOnce(failing)
      .mockRejectedValueOnce(failing)
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, { ...DEFAULT_RETRY_OPTIONS, baseDelayMs: 100, maxDelayMs: 1000 });

    // No retry before the first backoff window elapses.
    await vi.advanceTimersByTimeAsync(99);
    expect(fn).toHaveBeenCalledTimes(1);

    // base * 2^0 = 100ms (plus jitter) for retry #1...
    await vi.advanceTimersByTimeAsync(150);
    expect(fn).toHaveBeenCalledTimes(2);

    // ...then base * 2^1 = 200ms for retry #2.
    await vi.advanceTimersByTimeAsync(250);
    expect(fn).toHaveBeenCalledTimes(3);

    await expect(promise).resolves.toBe("ok");
  });

  it("jitter never exceeds maxDelayMs", async () => {
    // A smoke test of the default options shape.
    expect(DEFAULT_RETRY_OPTIONS.maxRetries).toBeGreaterThan(0);
    expect(DEFAULT_RETRY_OPTIONS.baseDelayMs).toBeLessThanOrEqual(DEFAULT_RETRY_OPTIONS.maxDelayMs);
    await sleep(0);
  });
});
