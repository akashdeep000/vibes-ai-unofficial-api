/**
 * ID generation utilities.
 *
 * The vibes.ai web app generates its own IDs client-side:
 * - batch ids:  `batch-<uuidv7>`
 * - extend ids: `extend-<epochMs>-<8 hex chars>`
 * - request ids: `www-<uuidv7>` (the `mg_request_id` field)
 * - content item ids: `<batchId>-content-<index>`
 *
 * All use only `node:crypto` — no external UUID dependency.
 */

import { randomBytes } from "node:crypto";

/**
 * Generates a UUID v7 (time-ordered, 128 bits).
 *
 * Format: `tttttttt-tttt-vvvv-ssss-aaaaaaaaaaaa` where the first 48 bits are
 * the Unix epoch in milliseconds, allowing sortable ids.
 */
export function uuidv7(): string {
  const bytes = randomBytes(16);
  const now = BigInt(Date.now());

  // Bytes 0-5: 48-bit millisecond timestamp (big-endian).
  let ts = now;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = Number(ts & 0xffn);
    ts >>= 8n;
  }

  // Byte 6: version 7.
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  // Byte 8: variant RFC 4122 (10xx).
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return (
    hex.slice(0, 8) +
    "-" +
    hex.slice(8, 12) +
    "-" +
    hex.slice(12, 16) +
    "-" +
    hex.slice(16, 20) +
    "-" +
    hex.slice(20)
  );
}

/** Generates a t2v generation batch id: `batch-<uuidv7>`. */
export function batchId(): string {
  return `batch-${uuidv7()}`;
}

/** Generates an extend batch id: `extend-<epochMs>-<8 hex chars>`. */
export function extendBatchId(now: Date = new Date()): string {
  const rand = randomBytes(4).toString("hex");
  return `extend-${now.getTime()}-${rand}`;
}

/** Generates the request id sent as `mg_request_id`: `www-<uuidv7>`. */
export function mgRequestId(): string {
  return `www-${uuidv7()}`;
}

/** Content item id for a batch slot: `<batchId>-content-<index>`. */
export function contentItemId(batchId: string, index: number): string {
  return `${batchId}-content-${index}`;
}
