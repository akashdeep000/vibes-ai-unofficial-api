/**
 * Extracts request/response fixtures from the captured browser traces in
 * `requests/*.md` into `test/fixtures/*.json`.
 *
 * The traces are "copy as fetch" dumps from DevTools, so the script parses
 * them as text: every `fetch("URL", {...})` block yields a request and every
 * `## Responce` section yields one or more JSON values (the API sometimes
 * concatenates two JSON blobs).
 *
 * Run with: `npm run extract:fixtures`
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REQUESTS_DIR = join(process.cwd(), "requests");
const OUT_DIR = join(process.cwd(), "test", "fixtures");

interface ExtractedRequest {
  method: string;
  url: string;
  body?: unknown;
}

interface Fixture {
  source: string;
  requests: ExtractedRequest[];
  responses: unknown[];
}

// ---------------------------------------------------------------------------
// Text scanning helpers (the trace files are not real JS/JSON).
// ---------------------------------------------------------------------------

/** Scans from `start` (which must point at `{` or `[`) for the matching close. */
function scanBalanced(text: string, start: number): { value: string; end: number } | null {
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return { value: text.slice(start, i + 1), end: i + 1 };
    }
  }
  return null;
}

/** Extracts every top-level JSON value from a text region. */
function extractJsonValues(text: string): unknown[] {
  const values: unknown[] = [];
  let idx = text.indexOf("{");
  while (idx !== -1) {
    const scanned = scanBalanced(text, idx);
    if (!scanned) break;
    try {
      values.push(JSON.parse(scanned.value));
    } catch {
      break;
    }
    idx = text.indexOf("{", scanned.end);
  }
  return values;
}

/** Extracts the JSON string literal inside `"body": "..."`. */
function extractBodyString(fetchBlock: string): unknown | undefined {
  const m = fetchBlock.match(/"body": "((?:[^"\\]|\\.)*)"/);
  if (!m) return undefined;
  const decoded = JSON.parse(`"${m[1]}"`);
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
}

/** Parses one `fetch("URL", { ... })` block. */
function parseFetchBlock(fetchBlock: string): ExtractedRequest | null {
  const urlMatch = fetchBlock.match(/fetch\("([^"]+)"/);
  if (!urlMatch) return null;
  const methodMatch = fetchBlock.match(/"method":\s*"([^"]+)"/);
  const method = methodMatch?.[1] ?? "GET";
  const body = extractBodyString(fetchBlock);
  const request: ExtractedRequest = { method, url: urlMatch[1]! };
  if (body !== undefined) request.body = body;
  return request;
}

/** Splits a trace file into (sectionTitle, sectionContent) pairs. */
function splitSections(content: string): Array<[string, string]> {
  const sections: Array<[string, string]> = [];
  const lines = content.split("\n");
  let currentTitle = "(header)";
  let current: string[] = [];
  const flush = () => {
    if (current.length > 0) sections.push([currentTitle, current.join("\n")]);
    current = [];
  };
  for (const line of lines) {
    if (/^#{2,4}\s+/i.test(line)) {
      flush();
      currentTitle = line.trim();
    } else {
      current.push(line);
    }
  }
  flush();
  return sections;
}

function parseFixture(fileName: string): Fixture {
  const content = readFileSync(join(REQUESTS_DIR, fileName), "utf8");
  const sections = splitSections(content);

  const requests: ExtractedRequest[] = [];
  const responses: unknown[] = [];

  for (const [title, body] of sections) {
    if (/^#{2,4}\s*responce/i.test(title)) {
      responses.push(...extractJsonValues(body));
      continue;
    }
    // Requests: collect every fetch(...) call in the section.
    const fetchRe = /fetch\(\s*"[^"]+"[\s\S]*?(?=\n\s*\)\s*;|\)\s*;)/g;
    for (const m of body.matchAll(fetchRe)) {
      const parsed = parseFetchBlock(m[0]);
      if (parsed) requests.push(parsed);
    }
  }

  return { source: fileName, requests, responses };
}

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const files = readdirSync(REQUESTS_DIR).filter((f) => f.endsWith(".md"));

  let requestCount = 0;
  let responseCount = 0;
  const written: string[] = [];

  for (const file of files) {
    const fixture = parseFixture(file);
    if (fixture.requests.length === 0 && fixture.responses.length === 0) {
      console.log(`skip ${file} (empty)`);
      continue;
    }
    const outPath = join(OUT_DIR, `${file.replace(/\.md$/, ".json")}`);
    writeFileSync(outPath, JSON.stringify(fixture, null, 2) + "\n");
    written.push(outPath);
    requestCount += fixture.requests.length;
    responseCount += fixture.responses.length;
  }

  console.log(`wrote ${written.length} fixtures`);
  console.log(`  requests:  ${requestCount}`);
  console.log(`  responses: ${responseCount}`);
  for (const f of written) console.log(`  - ${f}`);
}

main();
