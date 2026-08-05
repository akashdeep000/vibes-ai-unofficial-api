import { VibesParseError } from "../errors.js";

/**
 * Parses JSON, distinguishing "not JSON" from "invalid JSON".
 *
 * The API can return plain-text bodies (e.g. the `{"a"|"b"}` string from
 * `/api/sync`) and sometimes concatenated JSON blobs, so callers need a
 * lenient parse with clear failures.
 */
export function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new VibesParseError(`Failed to parse response body as JSON`, raw);
  }
}

/** Reads the full text of a response body once. */
export async function readBody(res: Response): Promise<string> {
  return res.text();
}
