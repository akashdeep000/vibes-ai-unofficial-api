import { type z } from "zod";
import { API_BASE_URL, API_PREFIX, RETRY_DEFAULTS } from "../constants.js";
import { VibesHttpError, VibesParseError, VibesValidationError } from "../errors.js";
import { safeJsonParse } from "../utils/json.js";
import { withRetry, type RetryOptions } from "../utils/retry.js";

/** Supplies the session cookie; may be a static string or a function so the session can rotate. */
export type SessionProvider = string | (() => string | undefined);

export interface HttpClientOptions {
  /** Origin, e.g. "https://vibes.ai". Defaults to the platform. */
  baseUrl?: string;
  /** Path prefix for API routes. Defaults to "/api". */
  apiPrefix?: string;
  /** Session cookie value(s), e.g. "meta_session=abc; cookie_ack=true". */
  session?: SessionProvider;
  /** Injectable fetch (used by tests and alternative runtimes). */
  fetchImpl?: typeof fetch;
  /** Per-request retry behaviour. */
  retry?: Partial<RetryOptions>;
  /** AbortSignal forwarded to every request. */
  signal?: AbortSignal;
  /** Extra headers merged into every request. */
  headers?: Record<string, string>;
  /** Milliseconds before the fetch itself aborts. Defaults to 60s. */
  requestTimeoutMs?: number;
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Absolute path from the API prefix, e.g. "/auth/me". */
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  formData?: FormData;
  headers?: Record<string, string>;
  /** When set, the parsed response is validated against this schema. */
  schema?: z.ZodType<unknown>;
  /** Return the raw response text instead of parsing JSON. */
  rawText?: boolean;
  /** Expected status; any other status becomes a VibesHttpError. Default: 2xx. */
  expectedStatus?: number | ((status: number) => boolean);
  /** Per-request timeout; overrides the client default. 0 disables it. */
  requestTimeoutMs?: number;
  signal?: AbortSignal;
}

/** Streams a GET response chunk by chunk; invoked with each raw chunk. */
export interface StreamOptions {
  /** Absolute path from the API prefix, e.g. "/generation-batches/:id/stream". */
  path: string;
  signal?: AbortSignal;
  /** Called with every `Uint8Array` chunk as it arrives. */
  onChunk: (chunk: Uint8Array) => void | Promise<void>;
  /** Expected status; any other status becomes a VibesHttpError. Default: 2xx. */
  expectedStatus?: number | ((status: number) => boolean);
  /** Abort the stream after this many ms. 0 disables it. Defaults to 0 (SSE may run long). */
  requestTimeoutMs?: number;
}

const isSuccessfulStatus = (status: number) => status >= 200 && status < 300;

export class HttpClient {
  readonly #baseUrl: string;
  readonly #apiPrefix: string;
  readonly #session: SessionProvider | undefined;
  readonly #fetch: typeof fetch;
  readonly #retry: RetryOptions;
  readonly #signal: AbortSignal | undefined;
  readonly #headers: Record<string, string> | undefined;
  readonly #requestTimeoutMs: number;

  constructor(options: HttpClientOptions = {}) {
    this.#baseUrl = (options.baseUrl ?? API_BASE_URL).replace(/\/+$/, "");
    this.#apiPrefix = (options.apiPrefix ?? API_PREFIX).replace(/\/+$/, "");
    this.#session = options.session;
    this.#fetch = options.fetchImpl ?? globalThis.fetch;
    this.#signal = options.signal;
    this.#headers = options.headers;
    this.#requestTimeoutMs = options.requestTimeoutMs ?? 60_000;
    this.#retry = {
      maxRetries: options.retry?.maxRetries ?? RETRY_DEFAULTS.maxRetries,
      baseDelayMs: options.retry?.baseDelayMs ?? RETRY_DEFAULTS.baseDelayMs,
      maxDelayMs: options.retry?.maxDelayMs ?? RETRY_DEFAULTS.maxDelayMs,
      retryStatuses: options.retry?.retryStatuses ?? RETRY_DEFAULTS.retryStatuses,
    };
  }

  get baseUrl(): string {
    return this.#baseUrl;
  }

  get apiPrefix(): string {
    return this.#apiPrefix;
  }

  private resolveUrl(path: string, query?: RequestOptions["query"]): string {
    const url = new URL(`${this.#baseUrl}${this.#apiPrefix}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === "") continue;
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private sessionCookie(): string | undefined {
    if (typeof this.#session === "function") return this.#session();
    return this.#session;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.resolveUrl(options.path, options.query);
    const headers: Record<string, string> = {
      accept: "application/json",
      ...this.#headers,
      ...options.headers,
    };

    const cookie = this.sessionCookie();
    if (cookie) headers.cookie = cookie;

    if (options.json !== undefined) {
      headers["content-type"] = "application/json";
    }

    const signal = options.signal ?? this.#signal;
    const timeoutMs = options.requestTimeoutMs ?? this.#requestTimeoutMs;
    const timeoutSignal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;
    const combined = combineSignals(signal, timeoutSignal);

    const body =
      options.formData !== undefined
        ? options.formData
        : options.json !== undefined
          ? JSON.stringify(options.json)
          : undefined;

    // Retry wraps both the fetch and the response handling so retryable
    // HTTP statuses (VibesHttpError with a status) are retried too.
    const result = await withRetry(async () => {
      const res = await this.#fetch(url, {
        method: options.method,
        headers,
        ...(body !== undefined ? { body } : {}),
        ...(combined !== undefined ? { signal: combined } : {}),
      });
      return this.handleResponse<T>(res, options, url);
    }, this.#retry);

    return result;
  }

  /**
   * Opens a GET and hands every `Uint8Array` chunk of the body to
   * `onChunk` as it arrives. Used by the SSE batch-stream endpoint.
   *
   * Resolves once the response body completes (or the signal aborts).
   */
  async stream(options: StreamOptions): Promise<void> {
    const url = this.resolveUrl(options.path);
    const headers: Record<string, string> = {
      accept: "text/event-stream",
      ...this.#headers,
    };
    const cookie = this.sessionCookie();
    if (cookie) headers.cookie = cookie;

    const expected = options.expectedStatus ?? isSuccessfulStatus;
    const signal = options.signal ?? this.#signal;
    const timeoutMs = options.requestTimeoutMs ?? 0;
    const timeoutSignal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;
    const combined = combineSignals(signal, timeoutSignal);

    const res = await this.#fetch(url, {
      method: "GET",
      headers,
      ...(combined !== undefined ? { signal: combined } : {}),
    });
    const ok = typeof expected === "function" ? expected(res.status) : res.status === expected;
    if (!ok) {
      const text = await res.text();
      throw new VibesHttpError("GET", url, res.status, res.statusText, this.tryJson(text));
    }

    const body = res.body;
    if (body === null) return;
    const reader = body.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) await options.onChunk(value);
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async handleResponse<T>(res: Response, options: RequestOptions, url: string): Promise<T> {
    const expected = options.expectedStatus ?? isSuccessfulStatus;
    const ok = typeof expected === "function" ? expected(res.status) : res.status === expected;

    const text = await res.text();

    if (!ok) {
      throw new VibesHttpError(options.method, url, res.status, res.statusText, this.tryJson(text));
    }

    if (options.rawText) {
      return text as T;
    }

    const parsed = safeJsonParse(text) as unknown;
    if (options.schema) {
      const result = options.schema.safeParse(parsed);
      if (!result.success) {
        throw new VibesValidationError(
          result.error.issues.map(
            (issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`,
          ),
          parsed,
        );
      }
      return result.data as T;
    }
    return parsed as T;
  }

  private tryJson(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }
}

/** Merges multiple abort signals (null-safe). */
function combineSignals(...signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const active = signals.filter((s): s is AbortSignal => s !== undefined);
  if (active.length === 0) return undefined;
  if (active.length === 1) return active[0]!;
  return AbortSignal.any(active);
}

/**
 * Parses the first complete JSON object in a text stream.
 *
 * The API occasionally concatenates two identical JSON blobs
 * (`{"batch":null,"id":"..."}{"batch":null,"id":"..."}`), so a strict
 * `JSON.parse` would throw. This scanner extracts the leading object.
 */
export function parseFirstJsonObject(text: string): unknown {
  const stripped = text.trimStart();
  if (stripped.startsWith("{")) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < stripped.length; i++) {
      const ch = stripped[i]!;
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const first = stripped.slice(0, i + 1);
          return safeJsonParse(first);
        }
      }
    }
  }
  throw new VibesParseError("No complete JSON object found in response", text);
}
