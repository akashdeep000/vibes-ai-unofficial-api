import { describe, expect, it } from "vitest";
import { batchId, contentItemId, extendBatchId, mgRequestId, uuidv7 } from "../../src/ids.js";

describe("uuidv7", () => {
  it("produces RFC 4122-shaped UUIDs", () => {
    const id = uuidv7();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("is unique across calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uuidv7()));
    expect(ids.size).toBe(1000);
  });

  it("encodes the current timestamp in the first 48 bits", () => {
    const before = Date.now();
    const id = uuidv7();
    const after = Date.now();
    const ts = BigInt(`0x${id.replaceAll("-", "").slice(0, 12)}`);
    expect(ts).toBeGreaterThanOrEqual(BigInt(before));
    expect(ts).toBeLessThanOrEqual(BigInt(after) + 1n);
  });
});

describe("batch ids", () => {
  it("batchId is prefixed with 'batch-'", () => {
    expect(batchId()).toMatch(
      /^batch-[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("extendBatchId is prefixed with 'extend-' and embeds the epoch", () => {
    const now = new Date("2026-08-04T18:49:12.000Z");
    expect(extendBatchId(now)).toMatch(/^extend-1785869352000-[0-9a-f]{8}$/);
  });

  it("mgRequestId is prefixed with 'www-'", () => {
    expect(mgRequestId()).toMatch(/^www-[0-9a-f]{8}-/);
  });

  it("contentItemId follows the <batch>-content-<index> convention", () => {
    expect(contentItemId("batch-x", 3)).toBe("batch-x-content-3");
  });
});
