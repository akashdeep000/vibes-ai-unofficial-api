/** Error hierarchy for the vibes-ai client. */

/** Base class for every error thrown by this library. */
export class VibesError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

/**
 * Thrown when the session cookie cannot be obtained from the configured source
 * (manual string, cookie file, or browser sync).
 */
export class VibesAuthError extends VibesError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/** Thrown when the API responds with a non-2xx status. */
export class VibesHttpError extends VibesError {
  readonly method: string;
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  /** Raw response body, when it could be parsed as JSON. */
  readonly body: unknown;

  constructor(method: string, url: string, status: number, statusText: string, body: unknown) {
    super(
      `vibes.ai ${method} ${url} failed with status ${status} ${statusText}` +
        (body !== undefined ? `: ${JSON.stringify(body)}` : ""),
    );
    this.method = method;
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

/**
 * Thrown when a response does not match the expected schema.
 *
 * The platform API is unversioned and changes shape silently — this error is
 * the first line of defense. It carries the validation issues and a snapshot
 * of the offending payload so drift can be diagnosed quickly.
 */
export class VibesValidationError extends VibesError {
  readonly issues: string[];
  readonly payload: unknown;

  constructor(issues: string[], payload: unknown) {
    super(
      `vibes.ai response did not match the expected schema (API drift?):\n` + issues.join("\n"),
    );
    this.issues = issues;
    this.payload = payload;
  }
}

/** Thrown when the body of a request cannot be serialized/parsed as JSON. */
export class VibesParseError extends VibesError {
  constructor(
    message: string,
    readonly raw: unknown,
  ) {
    super(message);
  }
}

/** Thrown when a `waitFor*` polling operation times out. */
export class VibesPollTimeoutError extends VibesError {
  readonly batchId: string | undefined;
  readonly elapsedMs: number;
  readonly lastState: unknown;

  constructor(elapsedMs: number, lastState: unknown, batchId?: string) {
    super(
      `Polling for batch ${batchId ?? "(unknown)"} timed out after ${elapsedMs}ms ` +
        `without reaching the expected state.`,
    );
    this.elapsedMs = elapsedMs;
    this.lastState = lastState;
    this.batchId = batchId;
  }
}
