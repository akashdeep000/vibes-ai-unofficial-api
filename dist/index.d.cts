import { z } from 'zod';
import { BrowserName, Cookie } from '@steipete/sweet-cookie';

/** Options controlling retry behaviour of the HTTP layer. */
interface RetryOptions {
    /** Maximum number of retries after the initial attempt. */
    maxRetries: number;
    /** Base delay before the first retry (exponential backoff). */
    baseDelayMs: number;
    /** Upper bound for the backoff delay. */
    maxDelayMs: number;
    /** HTTP status codes that trigger a retry. */
    retryStatuses: readonly number[];
}
declare const DEFAULT_RETRY_OPTIONS: RetryOptions;
/**
 * Runs `fn`, retrying on transient network errors and configured HTTP status
 * codes with exponential backoff plus jitter.
 *
 * @returns the result of a successful invocation, or the last error.
 */
declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;

/**
 * Supplies the session cookie; may be a static string or a function so the
 * session can rotate. Functions may be async (e.g. a browser-sync provider).
 */
type SessionProvider = string | (() => string | undefined | Promise<string | undefined>);
interface HttpClientOptions {
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
interface RequestOptions {
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
interface StreamOptions {
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
declare class HttpClient {
    #private;
    constructor(options?: HttpClientOptions);
    get baseUrl(): string;
    get apiPrefix(): string;
    private resolveUrl;
    private sessionCookie;
    request<T>(options: RequestOptions): Promise<T>;
    /**
     * Opens a GET and hands every `Uint8Array` chunk of the body to
     * `onChunk` as it arrives. Used by the SSE batch-stream endpoint.
     *
     * Resolves once the response body completes (or the signal aborts).
     */
    stream(options: StreamOptions): Promise<void>;
    private handleResponse;
    private tryJson;
}
/**
 * Parses the first complete JSON object in a text stream.
 *
 * The API occasionally concatenates two identical JSON blobs
 * (`{"batch":null,"id":"..."}{"batch":null,"id":"..."}`), so a strict
 * `JSON.parse` would throw. This scanner extracts the leading object.
 */
declare function parseFirstJsonObject(text: string): unknown;

/**
 * Asset listings (`/api/projects/:projectId/assets`, `/api/project-assets`)
 * and sync (`/api/sync`).
 */
declare const AssetSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    contentItemId: z.ZodNullable<z.ZodString>;
    relationship: z.ZodCatch<z.ZodEnum<["created", "uploaded", "extended"]>>;
    sourceProjectId: z.ZodNullable<z.ZodString>;
    isInTimeline: z.ZodBoolean;
    addedAt: z.ZodString;
    type: z.ZodEnum<["videos", "images"]>;
    imageUrl: z.ZodNullable<z.ZodString>;
    videoUrl: z.ZodNullable<z.ZodString>;
    imageHandle: z.ZodNullable<z.ZodNull>;
    videoHandle: z.ZodNullable<z.ZodNull>;
    prompt: z.ZodNullable<z.ZodString>;
    imagePrompt: z.ZodNullable<z.ZodString>;
    videoPrompt: z.ZodNullable<z.ZodString>;
    isFavorited: z.ZodBoolean;
    isLoading: z.ZodBoolean;
    error: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    batchId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    structuredOutput: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        config: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            dimensions: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            aspectRatio: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: string;
        }, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: string;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        config?: unknown;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: string;
        } | null | undefined;
    }, {
        config?: unknown;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: string;
        } | null | undefined;
    }>>>;
    orderIndex: z.ZodNumber;
    hasUploadedAncestor: z.ZodBoolean;
    mediaEntId: z.ZodNullable<z.ZodString>;
    data: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        videoGenEntId: z.ZodOptional<z.ZodString>;
        requestId: z.ZodString;
        imageEntId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        requestId: string;
        imageEntId?: string | undefined;
        videoGenEntId?: string | undefined;
    }, {
        requestId: string;
        imageEntId?: string | undefined;
        videoGenEntId?: string | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    type: "videos" | "images";
    mediaEntId: string | null;
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
    projectId: string;
    contentItemId: string | null;
    relationship: "created" | "uploaded" | "extended";
    sourceProjectId: string | null;
    isInTimeline: boolean;
    addedAt: string;
    imageHandle: null;
    videoHandle: null;
    prompt: string | null;
    imagePrompt: string | null;
    videoPrompt: string | null;
    isFavorited: boolean;
    isLoading: boolean;
    error: string | null;
    createdAt: string;
    orderIndex: number;
    hasUploadedAncestor: boolean;
    batchId?: string | null | undefined;
    structuredOutput?: {
        config?: unknown;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: string;
        } | null | undefined;
    } | null | undefined;
    data?: {
        requestId: string;
        imageEntId?: string | undefined;
        videoGenEntId?: string | undefined;
    } | null | undefined;
}, {
    type: "videos" | "images";
    mediaEntId: string | null;
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
    projectId: string;
    contentItemId: string | null;
    sourceProjectId: string | null;
    isInTimeline: boolean;
    addedAt: string;
    imageHandle: null;
    videoHandle: null;
    prompt: string | null;
    imagePrompt: string | null;
    videoPrompt: string | null;
    isFavorited: boolean;
    isLoading: boolean;
    error: string | null;
    createdAt: string;
    orderIndex: number;
    hasUploadedAncestor: boolean;
    relationship?: unknown;
    batchId?: string | null | undefined;
    structuredOutput?: {
        config?: unknown;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: string;
        } | null | undefined;
    } | null | undefined;
    data?: {
        requestId: string;
        imageEntId?: string | undefined;
        videoGenEntId?: string | undefined;
    } | null | undefined;
}>;
declare const AssetsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    assets: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        contentItemId: z.ZodNullable<z.ZodString>;
        relationship: z.ZodCatch<z.ZodEnum<["created", "uploaded", "extended"]>>;
        sourceProjectId: z.ZodNullable<z.ZodString>;
        isInTimeline: z.ZodBoolean;
        addedAt: z.ZodString;
        type: z.ZodEnum<["videos", "images"]>;
        imageUrl: z.ZodNullable<z.ZodString>;
        videoUrl: z.ZodNullable<z.ZodString>;
        imageHandle: z.ZodNullable<z.ZodNull>;
        videoHandle: z.ZodNullable<z.ZodNull>;
        prompt: z.ZodNullable<z.ZodString>;
        imagePrompt: z.ZodNullable<z.ZodString>;
        videoPrompt: z.ZodNullable<z.ZodString>;
        isFavorited: z.ZodBoolean;
        isLoading: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        batchId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        structuredOutput: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            config: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                dimensions: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                aspectRatio: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: string;
            }, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: string;
            }>>>;
        }, "strip", z.ZodTypeAny, {
            config?: unknown;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: string;
            } | null | undefined;
        }, {
            config?: unknown;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: string;
            } | null | undefined;
        }>>>;
        orderIndex: z.ZodNumber;
        hasUploadedAncestor: z.ZodBoolean;
        mediaEntId: z.ZodNullable<z.ZodString>;
        data: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            videoGenEntId: z.ZodOptional<z.ZodString>;
            requestId: z.ZodString;
            imageEntId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            requestId: string;
            imageEntId?: string | undefined;
            videoGenEntId?: string | undefined;
        }, {
            requestId: string;
            imageEntId?: string | undefined;
            videoGenEntId?: string | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        type: "videos" | "images";
        mediaEntId: string | null;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        projectId: string;
        contentItemId: string | null;
        relationship: "created" | "uploaded" | "extended";
        sourceProjectId: string | null;
        isInTimeline: boolean;
        addedAt: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        imagePrompt: string | null;
        videoPrompt: string | null;
        isFavorited: boolean;
        isLoading: boolean;
        error: string | null;
        createdAt: string;
        orderIndex: number;
        hasUploadedAncestor: boolean;
        batchId?: string | null | undefined;
        structuredOutput?: {
            config?: unknown;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: string;
            } | null | undefined;
        } | null | undefined;
        data?: {
            requestId: string;
            imageEntId?: string | undefined;
            videoGenEntId?: string | undefined;
        } | null | undefined;
    }, {
        type: "videos" | "images";
        mediaEntId: string | null;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        projectId: string;
        contentItemId: string | null;
        sourceProjectId: string | null;
        isInTimeline: boolean;
        addedAt: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        imagePrompt: string | null;
        videoPrompt: string | null;
        isFavorited: boolean;
        isLoading: boolean;
        error: string | null;
        createdAt: string;
        orderIndex: number;
        hasUploadedAncestor: boolean;
        relationship?: unknown;
        batchId?: string | null | undefined;
        structuredOutput?: {
            config?: unknown;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: string;
            } | null | undefined;
        } | null | undefined;
        data?: {
            requestId: string;
            imageEntId?: string | undefined;
            videoGenEntId?: string | undefined;
        } | null | undefined;
    }>, "many">;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    assets: {
        type: "videos" | "images";
        mediaEntId: string | null;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        projectId: string;
        contentItemId: string | null;
        relationship: "created" | "uploaded" | "extended";
        sourceProjectId: string | null;
        isInTimeline: boolean;
        addedAt: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        imagePrompt: string | null;
        videoPrompt: string | null;
        isFavorited: boolean;
        isLoading: boolean;
        error: string | null;
        createdAt: string;
        orderIndex: number;
        hasUploadedAncestor: boolean;
        batchId?: string | null | undefined;
        structuredOutput?: {
            config?: unknown;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: string;
            } | null | undefined;
        } | null | undefined;
        data?: {
            requestId: string;
            imageEntId?: string | undefined;
            videoGenEntId?: string | undefined;
        } | null | undefined;
    }[];
    count: number;
}, {
    success: boolean;
    assets: {
        type: "videos" | "images";
        mediaEntId: string | null;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        projectId: string;
        contentItemId: string | null;
        sourceProjectId: string | null;
        isInTimeline: boolean;
        addedAt: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        imagePrompt: string | null;
        videoPrompt: string | null;
        isFavorited: boolean;
        isLoading: boolean;
        error: string | null;
        createdAt: string;
        orderIndex: number;
        hasUploadedAncestor: boolean;
        relationship?: unknown;
        batchId?: string | null | undefined;
        structuredOutput?: {
            config?: unknown;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: string;
            } | null | undefined;
        } | null | undefined;
        data?: {
            requestId: string;
            imageEntId?: string | undefined;
            videoGenEntId?: string | undefined;
        } | null | undefined;
    }[];
    count: number;
}>;
/** Item shape from `GET /api/project-assets` (flatter, project-scoped). */
declare const ProjectAssetItemSchema: z.ZodObject<{
    id: z.ZodString;
    imageUrl: z.ZodNullable<z.ZodString>;
    videoUrl: z.ZodNullable<z.ZodString>;
    imageHandle: z.ZodNullable<z.ZodNull>;
    videoHandle: z.ZodNullable<z.ZodNull>;
    mediaEntId: z.ZodString;
    imageEntId: z.ZodString;
    prompt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    isFavorited: z.ZodBoolean;
    projectId: z.ZodString;
    projectName: z.ZodString;
    projectThumbnailUrl: z.ZodNullable<z.ZodString>;
    relationship: z.ZodString;
    hasUploadedAncestor: z.ZodBoolean;
    fromIngredientId: z.ZodNullable<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    mediaEntId: string;
    imageEntId: string;
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
    projectId: string;
    relationship: string;
    imageHandle: null;
    videoHandle: null;
    prompt: string | null;
    isFavorited: boolean;
    createdAt: string;
    hasUploadedAncestor: boolean;
    projectName: string;
    projectThumbnailUrl: string | null;
    fromIngredientId?: unknown;
}, {
    mediaEntId: string;
    imageEntId: string;
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
    projectId: string;
    relationship: string;
    imageHandle: null;
    videoHandle: null;
    prompt: string | null;
    isFavorited: boolean;
    createdAt: string;
    hasUploadedAncestor: boolean;
    projectName: string;
    projectThumbnailUrl: string | null;
    fromIngredientId?: unknown;
}>;
declare const ProjectAssetsResponseSchema: z.ZodObject<{
    projects: z.ZodNullable<z.ZodUnknown>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        imageUrl: z.ZodNullable<z.ZodString>;
        videoUrl: z.ZodNullable<z.ZodString>;
        imageHandle: z.ZodNullable<z.ZodNull>;
        videoHandle: z.ZodNullable<z.ZodNull>;
        mediaEntId: z.ZodString;
        imageEntId: z.ZodString;
        prompt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        isFavorited: z.ZodBoolean;
        projectId: z.ZodString;
        projectName: z.ZodString;
        projectThumbnailUrl: z.ZodNullable<z.ZodString>;
        relationship: z.ZodString;
        hasUploadedAncestor: z.ZodBoolean;
        fromIngredientId: z.ZodNullable<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        mediaEntId: string;
        imageEntId: string;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        projectId: string;
        relationship: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        isFavorited: boolean;
        createdAt: string;
        hasUploadedAncestor: boolean;
        projectName: string;
        projectThumbnailUrl: string | null;
        fromIngredientId?: unknown;
    }, {
        mediaEntId: string;
        imageEntId: string;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        projectId: string;
        relationship: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        isFavorited: boolean;
        createdAt: string;
        hasUploadedAncestor: boolean;
        projectName: string;
        projectThumbnailUrl: string | null;
        fromIngredientId?: unknown;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        mediaEntId: string;
        imageEntId: string;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        projectId: string;
        relationship: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        isFavorited: boolean;
        createdAt: string;
        hasUploadedAncestor: boolean;
        projectName: string;
        projectThumbnailUrl: string | null;
        fromIngredientId?: unknown;
    }[];
    projects?: unknown;
}, {
    items: {
        mediaEntId: string;
        imageEntId: string;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        projectId: string;
        relationship: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        isFavorited: boolean;
        createdAt: string;
        hasUploadedAncestor: boolean;
        projectName: string;
        projectThumbnailUrl: string | null;
        fromIngredientId?: unknown;
    }[];
    projects?: unknown;
}>;
/** `GET /api/sync` — opaque last-modified stamp, pipe-separated. */
declare const SyncResponseSchema: z.ZodObject<{
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
}, {
    updatedAt: string;
}>;
type Asset = z.infer<typeof AssetSchema>;
type AssetsResponse = z.infer<typeof AssetsResponseSchema>;
type ProjectAssetItem = z.infer<typeof ProjectAssetItemSchema>;
type ProjectAssetsResponse = z.infer<typeof ProjectAssetsResponseSchema>;
type SyncResponse = z.infer<typeof SyncResponseSchema>;

interface ListProjectAssetsOptions {
    limit?: number;
    offset?: number;
}
/** Asset listing and sync endpoints. */
declare class AssetsResource {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Rich asset list for a project (`GET /api/projects/:projectId/assets`).
     * The web app uses this endpoint to check extend status.
     */
    list(projectId: string): Promise<AssetsResponse>;
    /**
     * Flat, project-scoped asset items (`GET /api/project-assets`).
     */
    listByProjectId(projectId: string, options?: ListProjectAssetsOptions): Promise<ProjectAssetsResponse>;
    /**
     * Last-modified stamp for an entity (`GET /api/sync`).
     * Returns an opaque pipe-separated timestamp string.
     */
    sync(entityType: string, entityId: string): Promise<SyncResponse>;
}

/**
 * Account / session endpoints (`/api/auth/me`, `/api/auth/check-token`).
 *
 * Both endpoints return the same shape: `{ user: User }`.
 */
declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    username: z.ZodString;
    accountStatus: z.ZodCatch<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"]>>;
    roles: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    abraUserId: z.ZodString;
    sessionId: z.ZodNullable<z.ZodString>;
    kadabraProfile: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        kadabraUserId: z.ZodString;
        incognitoAccess: z.ZodCatch<z.ZodEnum<["NONE", "ALLOWED"]>>;
        kadabraProfileId: z.ZodString;
        kadabraProfileUsername: z.ZodNullable<z.ZodString>;
        kadabraProfilePictureURL: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        syncedAt: z.ZodNullable<z.ZodString>;
        dataSyncedAt: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        kadabraUserId: string;
        incognitoAccess: "NONE" | "ALLOWED";
        kadabraProfileId: string;
        kadabraProfileUsername: string | null;
        kadabraProfilePictureURL: string | null;
        syncedAt: string | null;
        dataSyncedAt: string | null;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        kadabraUserId: string;
        kadabraProfileId: string;
        kadabraProfileUsername: string | null;
        kadabraProfilePictureURL: string | null;
        syncedAt: string | null;
        dataSyncedAt: string | null;
        incognitoAccess?: unknown;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    username: string;
    accountStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";
    roles: string[];
    abraUserId: string;
    sessionId: string | null;
    kadabraProfile: {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        kadabraUserId: string;
        incognitoAccess: "NONE" | "ALLOWED";
        kadabraProfileId: string;
        kadabraProfileUsername: string | null;
        kadabraProfilePictureURL: string | null;
        syncedAt: string | null;
        dataSyncedAt: string | null;
    } | null;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    username: string;
    roles: string[];
    abraUserId: string;
    sessionId: string | null;
    kadabraProfile: {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        kadabraUserId: string;
        kadabraProfileId: string;
        kadabraProfileUsername: string | null;
        kadabraProfilePictureURL: string | null;
        syncedAt: string | null;
        dataSyncedAt: string | null;
        incognitoAccess?: unknown;
    } | null;
    accountStatus?: unknown;
}>;
declare const MeResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        username: z.ZodString;
        accountStatus: z.ZodCatch<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"]>>;
        roles: z.ZodArray<z.ZodString, "many">;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        abraUserId: z.ZodString;
        sessionId: z.ZodNullable<z.ZodString>;
        kadabraProfile: z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            userId: z.ZodString;
            kadabraUserId: z.ZodString;
            incognitoAccess: z.ZodCatch<z.ZodEnum<["NONE", "ALLOWED"]>>;
            kadabraProfileId: z.ZodString;
            kadabraProfileUsername: z.ZodNullable<z.ZodString>;
            kadabraProfilePictureURL: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            syncedAt: z.ZodNullable<z.ZodString>;
            dataSyncedAt: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: string;
            updatedAt: string;
            userId: string;
            kadabraUserId: string;
            incognitoAccess: "NONE" | "ALLOWED";
            kadabraProfileId: string;
            kadabraProfileUsername: string | null;
            kadabraProfilePictureURL: string | null;
            syncedAt: string | null;
            dataSyncedAt: string | null;
        }, {
            id: string;
            createdAt: string;
            updatedAt: string;
            userId: string;
            kadabraUserId: string;
            kadabraProfileId: string;
            kadabraProfileUsername: string | null;
            kadabraProfilePictureURL: string | null;
            syncedAt: string | null;
            dataSyncedAt: string | null;
            incognitoAccess?: unknown;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        username: string;
        accountStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";
        roles: string[];
        abraUserId: string;
        sessionId: string | null;
        kadabraProfile: {
            id: string;
            createdAt: string;
            updatedAt: string;
            userId: string;
            kadabraUserId: string;
            incognitoAccess: "NONE" | "ALLOWED";
            kadabraProfileId: string;
            kadabraProfileUsername: string | null;
            kadabraProfilePictureURL: string | null;
            syncedAt: string | null;
            dataSyncedAt: string | null;
        } | null;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        username: string;
        roles: string[];
        abraUserId: string;
        sessionId: string | null;
        kadabraProfile: {
            id: string;
            createdAt: string;
            updatedAt: string;
            userId: string;
            kadabraUserId: string;
            kadabraProfileId: string;
            kadabraProfileUsername: string | null;
            kadabraProfilePictureURL: string | null;
            syncedAt: string | null;
            dataSyncedAt: string | null;
            incognitoAccess?: unknown;
        } | null;
        accountStatus?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        createdAt: string;
        updatedAt: string;
        username: string;
        accountStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";
        roles: string[];
        abraUserId: string;
        sessionId: string | null;
        kadabraProfile: {
            id: string;
            createdAt: string;
            updatedAt: string;
            userId: string;
            kadabraUserId: string;
            incognitoAccess: "NONE" | "ALLOWED";
            kadabraProfileId: string;
            kadabraProfileUsername: string | null;
            kadabraProfilePictureURL: string | null;
            syncedAt: string | null;
            dataSyncedAt: string | null;
        } | null;
    };
}, {
    user: {
        id: string;
        createdAt: string;
        updatedAt: string;
        username: string;
        roles: string[];
        abraUserId: string;
        sessionId: string | null;
        kadabraProfile: {
            id: string;
            createdAt: string;
            updatedAt: string;
            userId: string;
            kadabraUserId: string;
            kadabraProfileId: string;
            kadabraProfileUsername: string | null;
            kadabraProfilePictureURL: string | null;
            syncedAt: string | null;
            dataSyncedAt: string | null;
            incognitoAccess?: unknown;
        } | null;
        accountStatus?: unknown;
    };
}>;
type User = z.infer<typeof UserSchema>;
type MeResponse = z.infer<typeof MeResponseSchema>;

/** Auth endpoints: session validity and the current user. */
declare class AuthResource {
    private readonly http;
    constructor(http: HttpClient);
    /** Returns the signed-in user (`GET /api/auth/me`). */
    me(): Promise<MeResponse>;
    /** Validates the session token (`GET /api/auth/check-token`). */
    checkToken(): Promise<MeResponse>;
}

/**
 * Generation batches (`/api/projects/:projectId/batches`, `/api/generation-batches`).
 *
 * The `config` object varies by generation type (t2v / extend / uploaded
 * media), so it is modeled with optional fields and validated strictly only
 * when the client *builds* requests (see `schemas/generation.ts`).
 */
declare const SourceContentItemIdSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    source: string;
}, {
    id: string;
    source: string;
}>;
/** Handle the platform attaches to a prompt image. */
declare const DirectPromptImageHandleSchema: z.ZodObject<{
    image_url: z.ZodString;
    image_ent_id: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    image_url: string;
    image_ent_id: string;
    source?: string | undefined;
}, {
    image_url: string;
    image_ent_id: string;
    source?: string | undefined;
}>;
/** Loose config shape as *returned* by the API (all fields optional). */
declare const GenerationConfigSchema: z.ZodObject<{
    directGeneration: z.ZodOptional<z.ZodBoolean>;
    promptModel: z.ZodOptional<z.ZodString>;
    aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
    imageModel: z.ZodOptional<z.ZodString>;
    videoModel: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    batchVariation: z.ZodOptional<z.ZodBoolean>;
    generationType: z.ZodOptional<z.ZodString>;
    sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        source: string;
    }, {
        id: string;
        source: string;
    }>, "many">>;
    directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        image_url: z.ZodString;
        image_ent_id: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        image_url: string;
        image_ent_id: string;
        source?: string | undefined;
    }, {
        image_url: string;
        image_ent_id: string;
        source?: string | undefined;
    }>>>;
    lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        dimensions: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
        }, {
            width: number;
            height: number;
        }>;
        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
    }, "strip", z.ZodTypeAny, {
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    }, {
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    }>>>;
    sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
    metadata?: {
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    } | null | undefined;
    directGeneration?: boolean | undefined;
    promptModel?: string | undefined;
    imageModel?: string | undefined;
    videoModel?: string | undefined;
    resolution?: string | undefined;
    batchVariation?: boolean | undefined;
    generationType?: string | undefined;
    sourceContentItemIds?: {
        id: string;
        source: string;
    }[] | undefined;
    directPromptImageHandle?: {
        image_url: string;
        image_ent_id: string;
        source?: string | undefined;
    } | null | undefined;
    lastFrameImageUrl?: string | null | undefined;
    lastFrameImageEntId?: string | null | undefined;
    sourceVideoUrl?: string | null | undefined;
    audioSourceUrl?: string | null | undefined;
    extendDirective?: string | null | undefined;
}, {
    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
    metadata?: {
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    } | null | undefined;
    directGeneration?: boolean | undefined;
    promptModel?: string | undefined;
    imageModel?: string | undefined;
    videoModel?: string | undefined;
    resolution?: string | undefined;
    batchVariation?: boolean | undefined;
    generationType?: string | undefined;
    sourceContentItemIds?: {
        id: string;
        source: string;
    }[] | undefined;
    directPromptImageHandle?: {
        image_url: string;
        image_ent_id: string;
        source?: string | undefined;
    } | null | undefined;
    lastFrameImageUrl?: string | null | undefined;
    lastFrameImageEntId?: string | null | undefined;
    sourceVideoUrl?: string | null | undefined;
    audioSourceUrl?: string | null | undefined;
    extendDirective?: string | null | undefined;
}>;
declare const StructuredOutputSchema: z.ZodObject<{
    config: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        directGeneration: z.ZodOptional<z.ZodBoolean>;
        promptModel: z.ZodOptional<z.ZodString>;
        aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
        imageModel: z.ZodOptional<z.ZodString>;
        videoModel: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        batchVariation: z.ZodOptional<z.ZodBoolean>;
        generationType: z.ZodOptional<z.ZodString>;
        sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            source: string;
        }, {
            id: string;
            source: string;
        }>, "many">>;
        directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            image_url: z.ZodString;
            image_ent_id: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        }, {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        }>>>;
        lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            dimensions: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
        }, "strip", z.ZodTypeAny, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }>>>;
        sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
        directGeneration?: boolean | undefined;
        promptModel?: string | undefined;
        imageModel?: string | undefined;
        videoModel?: string | undefined;
        resolution?: string | undefined;
        batchVariation?: boolean | undefined;
        generationType?: string | undefined;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | null | undefined;
        lastFrameImageUrl?: string | null | undefined;
        lastFrameImageEntId?: string | null | undefined;
        sourceVideoUrl?: string | null | undefined;
        audioSourceUrl?: string | null | undefined;
        extendDirective?: string | null | undefined;
    }, {
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
        directGeneration?: boolean | undefined;
        promptModel?: string | undefined;
        imageModel?: string | undefined;
        videoModel?: string | undefined;
        resolution?: string | undefined;
        batchVariation?: boolean | undefined;
        generationType?: string | undefined;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | null | undefined;
        lastFrameImageUrl?: string | null | undefined;
        lastFrameImageEntId?: string | null | undefined;
        sourceVideoUrl?: string | null | undefined;
        audioSourceUrl?: string | null | undefined;
        extendDirective?: string | null | undefined;
    }>>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        dimensions: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
        }, {
            width: number;
            height: number;
        }>;
        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
    }, "strip", z.ZodTypeAny, {
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    }, {
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    }>>>;
}, "strip", z.ZodTypeAny, {
    config?: {
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
        directGeneration?: boolean | undefined;
        promptModel?: string | undefined;
        imageModel?: string | undefined;
        videoModel?: string | undefined;
        resolution?: string | undefined;
        batchVariation?: boolean | undefined;
        generationType?: string | undefined;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | null | undefined;
        lastFrameImageUrl?: string | null | undefined;
        lastFrameImageEntId?: string | null | undefined;
        sourceVideoUrl?: string | null | undefined;
        audioSourceUrl?: string | null | undefined;
        extendDirective?: string | null | undefined;
    } | null | undefined;
    metadata?: {
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    } | null | undefined;
}, {
    config?: {
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
        directGeneration?: boolean | undefined;
        promptModel?: string | undefined;
        imageModel?: string | undefined;
        videoModel?: string | undefined;
        resolution?: string | undefined;
        batchVariation?: boolean | undefined;
        generationType?: string | undefined;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | null | undefined;
        lastFrameImageUrl?: string | null | undefined;
        lastFrameImageEntId?: string | null | undefined;
        sourceVideoUrl?: string | null | undefined;
        audioSourceUrl?: string | null | undefined;
        extendDirective?: string | null | undefined;
    } | null | undefined;
    metadata?: {
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    } | null | undefined;
}>;
/** One media item inside a batch. */
declare const BatchContentItemSchema: z.ZodObject<{
    id: z.ZodString;
    batchId: z.ZodString;
    type: z.ZodEnum<["videos", "images"]>;
    imageUrl: z.ZodNullable<z.ZodString>;
    videoUrl: z.ZodNullable<z.ZodString>;
    imageHandle: z.ZodNullable<z.ZodNull>;
    videoHandle: z.ZodNullable<z.ZodNull>;
    mediaEntId: z.ZodNullable<z.ZodString>;
    prompt: z.ZodNullable<z.ZodString>;
    imagePrompt: z.ZodNullable<z.ZodString>;
    videoPrompt: z.ZodNullable<z.ZodString>;
    isFavorited: z.ZodBoolean;
    isLoading: z.ZodBoolean;
    error: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    structuredOutput: z.ZodNullable<z.ZodObject<{
        config: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            directGeneration: z.ZodOptional<z.ZodBoolean>;
            promptModel: z.ZodOptional<z.ZodString>;
            aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
            imageModel: z.ZodOptional<z.ZodString>;
            videoModel: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            batchVariation: z.ZodOptional<z.ZodBoolean>;
            generationType: z.ZodOptional<z.ZodString>;
            sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">>;
            directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                image_url: z.ZodString;
                image_ent_id: z.ZodString;
                source: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }>>>;
            lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                dimensions: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
            }, "strip", z.ZodTypeAny, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }>>>;
            sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        }, {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        }>>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            dimensions: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
        }, "strip", z.ZodTypeAny, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }>>>;
    }, "strip", z.ZodTypeAny, {
        config?: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
    }, {
        config?: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
    }>>;
    orderIndex: z.ZodNumber;
    srefValues: z.ZodNullable<z.ZodUnknown>;
    data: z.ZodNullable<z.ZodUnknown>;
    canRetry: z.ZodOptional<z.ZodBoolean>;
    updatedAt: z.ZodString;
    hasUploadedAncestor: z.ZodBoolean;
    contentItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    relationship: z.ZodOptional<z.ZodString>;
    isInTimeline: z.ZodOptional<z.ZodBoolean>;
    sourceProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    addedAt: z.ZodOptional<z.ZodString>;
    originProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    thumbnailUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    aspectRatio: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sourceContentItemIds: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        source: string;
    }, {
        id: string;
        source: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    type: "videos" | "images";
    mediaEntId: string | null;
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
    imageHandle: null;
    videoHandle: null;
    prompt: string | null;
    imagePrompt: string | null;
    videoPrompt: string | null;
    isFavorited: boolean;
    isLoading: boolean;
    error: string | null;
    createdAt: string;
    batchId: string;
    structuredOutput: {
        config?: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
    } | null;
    orderIndex: number;
    hasUploadedAncestor: boolean;
    updatedAt: string;
    projectId?: string | null | undefined;
    contentItemId?: string | null | undefined;
    relationship?: string | undefined;
    sourceProjectId?: string | null | undefined;
    isInTimeline?: boolean | undefined;
    addedAt?: string | undefined;
    aspectRatio?: number | null | undefined;
    data?: unknown;
    sourceContentItemIds?: {
        id: string;
        source: string;
    }[] | null | undefined;
    srefValues?: unknown;
    canRetry?: boolean | undefined;
    originProjectId?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
}, {
    type: "videos" | "images";
    mediaEntId: string | null;
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
    imageHandle: null;
    videoHandle: null;
    prompt: string | null;
    imagePrompt: string | null;
    videoPrompt: string | null;
    isFavorited: boolean;
    isLoading: boolean;
    error: string | null;
    createdAt: string;
    batchId: string;
    structuredOutput: {
        config?: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
    } | null;
    orderIndex: number;
    hasUploadedAncestor: boolean;
    updatedAt: string;
    projectId?: string | null | undefined;
    contentItemId?: string | null | undefined;
    relationship?: string | undefined;
    sourceProjectId?: string | null | undefined;
    isInTimeline?: boolean | undefined;
    addedAt?: string | undefined;
    aspectRatio?: number | null | undefined;
    data?: unknown;
    sourceContentItemIds?: {
        id: string;
        source: string;
    }[] | null | undefined;
    srefValues?: unknown;
    canRetry?: boolean | undefined;
    originProjectId?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
}>;
declare const GenerationBatchSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    projectId: z.ZodNullable<z.ZodString>;
    type: z.ZodEnum<["videos", "images"]>;
    prompt: z.ZodNullable<z.ZodString>;
    timestamp: z.ZodString;
    isComplete: z.ZodBoolean;
    hasError: z.ZodBoolean;
    error: z.ZodNullable<z.ZodString>;
    canRetry: z.ZodBoolean;
    /** In-flight batches report `config: null`; completed ones carry the object. */
    config: z.ZodNullable<z.ZodObject<{
        directGeneration: z.ZodOptional<z.ZodBoolean>;
        promptModel: z.ZodOptional<z.ZodString>;
        aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
        imageModel: z.ZodOptional<z.ZodString>;
        videoModel: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        batchVariation: z.ZodOptional<z.ZodBoolean>;
        generationType: z.ZodOptional<z.ZodString>;
        sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            source: string;
        }, {
            id: string;
            source: string;
        }>, "many">>;
        directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            image_url: z.ZodString;
            image_ent_id: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        }, {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        }>>>;
        lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            dimensions: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
        }, "strip", z.ZodTypeAny, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }>>>;
        sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
        directGeneration?: boolean | undefined;
        promptModel?: string | undefined;
        imageModel?: string | undefined;
        videoModel?: string | undefined;
        resolution?: string | undefined;
        batchVariation?: boolean | undefined;
        generationType?: string | undefined;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | null | undefined;
        lastFrameImageUrl?: string | null | undefined;
        lastFrameImageEntId?: string | null | undefined;
        sourceVideoUrl?: string | null | undefined;
        audioSourceUrl?: string | null | undefined;
        extendDirective?: string | null | undefined;
    }, {
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
        directGeneration?: boolean | undefined;
        promptModel?: string | undefined;
        imageModel?: string | undefined;
        videoModel?: string | undefined;
        resolution?: string | undefined;
        batchVariation?: boolean | undefined;
        generationType?: string | undefined;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | null | undefined;
        lastFrameImageUrl?: string | null | undefined;
        lastFrameImageEntId?: string | null | undefined;
        sourceVideoUrl?: string | null | undefined;
        audioSourceUrl?: string | null | undefined;
        extendDirective?: string | null | undefined;
    }>>;
    systemPrompt: z.ZodNullable<z.ZodString>;
    promptModel: z.ZodNullable<z.ZodString>;
    imageModel: z.ZodNullable<z.ZodString>;
    videoModel: z.ZodNullable<z.ZodString>;
    bulkGenId: z.ZodNullable<z.ZodString>;
    generationStartTime: z.ZodNullable<z.ZodString>;
    generationEndTime: z.ZodNullable<z.ZodString>;
    creationContext: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    content: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        batchId: z.ZodString;
        type: z.ZodEnum<["videos", "images"]>;
        imageUrl: z.ZodNullable<z.ZodString>;
        videoUrl: z.ZodNullable<z.ZodString>;
        imageHandle: z.ZodNullable<z.ZodNull>;
        videoHandle: z.ZodNullable<z.ZodNull>;
        mediaEntId: z.ZodNullable<z.ZodString>;
        prompt: z.ZodNullable<z.ZodString>;
        imagePrompt: z.ZodNullable<z.ZodString>;
        videoPrompt: z.ZodNullable<z.ZodString>;
        isFavorited: z.ZodBoolean;
        isLoading: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        structuredOutput: z.ZodNullable<z.ZodObject<{
            config: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                directGeneration: z.ZodOptional<z.ZodBoolean>;
                promptModel: z.ZodOptional<z.ZodString>;
                aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
                imageModel: z.ZodOptional<z.ZodString>;
                videoModel: z.ZodOptional<z.ZodString>;
                resolution: z.ZodOptional<z.ZodString>;
                batchVariation: z.ZodOptional<z.ZodBoolean>;
                generationType: z.ZodOptional<z.ZodString>;
                sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    source: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    source: string;
                }, {
                    id: string;
                    source: string;
                }>, "many">>;
                directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    image_url: z.ZodString;
                    image_ent_id: z.ZodString;
                    source: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                }, {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                }>>>;
                lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    dimensions: z.ZodObject<{
                        width: z.ZodNumber;
                        height: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        width: number;
                        height: number;
                    }, {
                        width: number;
                        height: number;
                    }>;
                    aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
                }, "strip", z.ZodTypeAny, {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                }, {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                }>>>;
                sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
                directGeneration?: boolean | undefined;
                promptModel?: string | undefined;
                imageModel?: string | undefined;
                videoModel?: string | undefined;
                resolution?: string | undefined;
                batchVariation?: boolean | undefined;
                generationType?: string | undefined;
                sourceContentItemIds?: {
                    id: string;
                    source: string;
                }[] | undefined;
                directPromptImageHandle?: {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                } | null | undefined;
                lastFrameImageUrl?: string | null | undefined;
                lastFrameImageEntId?: string | null | undefined;
                sourceVideoUrl?: string | null | undefined;
                audioSourceUrl?: string | null | undefined;
                extendDirective?: string | null | undefined;
            }, {
                aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
                directGeneration?: boolean | undefined;
                promptModel?: string | undefined;
                imageModel?: string | undefined;
                videoModel?: string | undefined;
                resolution?: string | undefined;
                batchVariation?: boolean | undefined;
                generationType?: string | undefined;
                sourceContentItemIds?: {
                    id: string;
                    source: string;
                }[] | undefined;
                directPromptImageHandle?: {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                } | null | undefined;
                lastFrameImageUrl?: string | null | undefined;
                lastFrameImageEntId?: string | null | undefined;
                sourceVideoUrl?: string | null | undefined;
                audioSourceUrl?: string | null | undefined;
                extendDirective?: string | null | undefined;
            }>>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                dimensions: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
            }, "strip", z.ZodTypeAny, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }>>>;
        }, "strip", z.ZodTypeAny, {
            config?: {
                aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
                directGeneration?: boolean | undefined;
                promptModel?: string | undefined;
                imageModel?: string | undefined;
                videoModel?: string | undefined;
                resolution?: string | undefined;
                batchVariation?: boolean | undefined;
                generationType?: string | undefined;
                sourceContentItemIds?: {
                    id: string;
                    source: string;
                }[] | undefined;
                directPromptImageHandle?: {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                } | null | undefined;
                lastFrameImageUrl?: string | null | undefined;
                lastFrameImageEntId?: string | null | undefined;
                sourceVideoUrl?: string | null | undefined;
                audioSourceUrl?: string | null | undefined;
                extendDirective?: string | null | undefined;
            } | null | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
        }, {
            config?: {
                aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
                directGeneration?: boolean | undefined;
                promptModel?: string | undefined;
                imageModel?: string | undefined;
                videoModel?: string | undefined;
                resolution?: string | undefined;
                batchVariation?: boolean | undefined;
                generationType?: string | undefined;
                sourceContentItemIds?: {
                    id: string;
                    source: string;
                }[] | undefined;
                directPromptImageHandle?: {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                } | null | undefined;
                lastFrameImageUrl?: string | null | undefined;
                lastFrameImageEntId?: string | null | undefined;
                sourceVideoUrl?: string | null | undefined;
                audioSourceUrl?: string | null | undefined;
                extendDirective?: string | null | undefined;
            } | null | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
        }>>;
        orderIndex: z.ZodNumber;
        srefValues: z.ZodNullable<z.ZodUnknown>;
        data: z.ZodNullable<z.ZodUnknown>;
        canRetry: z.ZodOptional<z.ZodBoolean>;
        updatedAt: z.ZodString;
        hasUploadedAncestor: z.ZodBoolean;
        contentItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        relationship: z.ZodOptional<z.ZodString>;
        isInTimeline: z.ZodOptional<z.ZodBoolean>;
        sourceProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        addedAt: z.ZodOptional<z.ZodString>;
        originProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        thumbnailUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        aspectRatio: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        sourceContentItemIds: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            source: string;
        }, {
            id: string;
            source: string;
        }>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        type: "videos" | "images";
        mediaEntId: string | null;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        imagePrompt: string | null;
        videoPrompt: string | null;
        isFavorited: boolean;
        isLoading: boolean;
        error: string | null;
        createdAt: string;
        batchId: string;
        structuredOutput: {
            config?: {
                aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
                directGeneration?: boolean | undefined;
                promptModel?: string | undefined;
                imageModel?: string | undefined;
                videoModel?: string | undefined;
                resolution?: string | undefined;
                batchVariation?: boolean | undefined;
                generationType?: string | undefined;
                sourceContentItemIds?: {
                    id: string;
                    source: string;
                }[] | undefined;
                directPromptImageHandle?: {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                } | null | undefined;
                lastFrameImageUrl?: string | null | undefined;
                lastFrameImageEntId?: string | null | undefined;
                sourceVideoUrl?: string | null | undefined;
                audioSourceUrl?: string | null | undefined;
                extendDirective?: string | null | undefined;
            } | null | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
        } | null;
        orderIndex: number;
        hasUploadedAncestor: boolean;
        updatedAt: string;
        projectId?: string | null | undefined;
        contentItemId?: string | null | undefined;
        relationship?: string | undefined;
        sourceProjectId?: string | null | undefined;
        isInTimeline?: boolean | undefined;
        addedAt?: string | undefined;
        aspectRatio?: number | null | undefined;
        data?: unknown;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | null | undefined;
        srefValues?: unknown;
        canRetry?: boolean | undefined;
        originProjectId?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
    }, {
        type: "videos" | "images";
        mediaEntId: string | null;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        imagePrompt: string | null;
        videoPrompt: string | null;
        isFavorited: boolean;
        isLoading: boolean;
        error: string | null;
        createdAt: string;
        batchId: string;
        structuredOutput: {
            config?: {
                aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
                directGeneration?: boolean | undefined;
                promptModel?: string | undefined;
                imageModel?: string | undefined;
                videoModel?: string | undefined;
                resolution?: string | undefined;
                batchVariation?: boolean | undefined;
                generationType?: string | undefined;
                sourceContentItemIds?: {
                    id: string;
                    source: string;
                }[] | undefined;
                directPromptImageHandle?: {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                } | null | undefined;
                lastFrameImageUrl?: string | null | undefined;
                lastFrameImageEntId?: string | null | undefined;
                sourceVideoUrl?: string | null | undefined;
                audioSourceUrl?: string | null | undefined;
                extendDirective?: string | null | undefined;
            } | null | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
        } | null;
        orderIndex: number;
        hasUploadedAncestor: boolean;
        updatedAt: string;
        projectId?: string | null | undefined;
        contentItemId?: string | null | undefined;
        relationship?: string | undefined;
        sourceProjectId?: string | null | undefined;
        isInTimeline?: boolean | undefined;
        addedAt?: string | undefined;
        aspectRatio?: number | null | undefined;
        data?: unknown;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | null | undefined;
        srefValues?: unknown;
        canRetry?: boolean | undefined;
        originProjectId?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
    }>, "many">;
    /** Present in list responses; absent in PUT responses. */
    needsPolling: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "videos" | "images";
    id: string;
    projectId: string | null;
    prompt: string | null;
    error: string | null;
    createdAt: string;
    config: {
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
        directGeneration?: boolean | undefined;
        promptModel?: string | undefined;
        imageModel?: string | undefined;
        videoModel?: string | undefined;
        resolution?: string | undefined;
        batchVariation?: boolean | undefined;
        generationType?: string | undefined;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | null | undefined;
        lastFrameImageUrl?: string | null | undefined;
        lastFrameImageEntId?: string | null | undefined;
        sourceVideoUrl?: string | null | undefined;
        audioSourceUrl?: string | null | undefined;
        extendDirective?: string | null | undefined;
    } | null;
    updatedAt: string;
    userId: string;
    promptModel: string | null;
    imageModel: string | null;
    videoModel: string | null;
    canRetry: boolean;
    timestamp: string;
    isComplete: boolean;
    hasError: boolean;
    systemPrompt: string | null;
    bulkGenId: string | null;
    generationStartTime: string | null;
    generationEndTime: string | null;
    creationContext: string;
    content: {
        type: "videos" | "images";
        mediaEntId: string | null;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        imagePrompt: string | null;
        videoPrompt: string | null;
        isFavorited: boolean;
        isLoading: boolean;
        error: string | null;
        createdAt: string;
        batchId: string;
        structuredOutput: {
            config?: {
                aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
                directGeneration?: boolean | undefined;
                promptModel?: string | undefined;
                imageModel?: string | undefined;
                videoModel?: string | undefined;
                resolution?: string | undefined;
                batchVariation?: boolean | undefined;
                generationType?: string | undefined;
                sourceContentItemIds?: {
                    id: string;
                    source: string;
                }[] | undefined;
                directPromptImageHandle?: {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                } | null | undefined;
                lastFrameImageUrl?: string | null | undefined;
                lastFrameImageEntId?: string | null | undefined;
                sourceVideoUrl?: string | null | undefined;
                audioSourceUrl?: string | null | undefined;
                extendDirective?: string | null | undefined;
            } | null | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
        } | null;
        orderIndex: number;
        hasUploadedAncestor: boolean;
        updatedAt: string;
        projectId?: string | null | undefined;
        contentItemId?: string | null | undefined;
        relationship?: string | undefined;
        sourceProjectId?: string | null | undefined;
        isInTimeline?: boolean | undefined;
        addedAt?: string | undefined;
        aspectRatio?: number | null | undefined;
        data?: unknown;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | null | undefined;
        srefValues?: unknown;
        canRetry?: boolean | undefined;
        originProjectId?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
    }[];
    needsPolling?: boolean | undefined;
}, {
    type: "videos" | "images";
    id: string;
    projectId: string | null;
    prompt: string | null;
    error: string | null;
    createdAt: string;
    config: {
        aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
        metadata?: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        } | null | undefined;
        directGeneration?: boolean | undefined;
        promptModel?: string | undefined;
        imageModel?: string | undefined;
        videoModel?: string | undefined;
        resolution?: string | undefined;
        batchVariation?: boolean | undefined;
        generationType?: string | undefined;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | null | undefined;
        lastFrameImageUrl?: string | null | undefined;
        lastFrameImageEntId?: string | null | undefined;
        sourceVideoUrl?: string | null | undefined;
        audioSourceUrl?: string | null | undefined;
        extendDirective?: string | null | undefined;
    } | null;
    updatedAt: string;
    userId: string;
    promptModel: string | null;
    imageModel: string | null;
    videoModel: string | null;
    canRetry: boolean;
    timestamp: string;
    isComplete: boolean;
    hasError: boolean;
    systemPrompt: string | null;
    bulkGenId: string | null;
    generationStartTime: string | null;
    generationEndTime: string | null;
    creationContext: string;
    content: {
        type: "videos" | "images";
        mediaEntId: string | null;
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        imageHandle: null;
        videoHandle: null;
        prompt: string | null;
        imagePrompt: string | null;
        videoPrompt: string | null;
        isFavorited: boolean;
        isLoading: boolean;
        error: string | null;
        createdAt: string;
        batchId: string;
        structuredOutput: {
            config?: {
                aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
                directGeneration?: boolean | undefined;
                promptModel?: string | undefined;
                imageModel?: string | undefined;
                videoModel?: string | undefined;
                resolution?: string | undefined;
                batchVariation?: boolean | undefined;
                generationType?: string | undefined;
                sourceContentItemIds?: {
                    id: string;
                    source: string;
                }[] | undefined;
                directPromptImageHandle?: {
                    image_url: string;
                    image_ent_id: string;
                    source?: string | undefined;
                } | null | undefined;
                lastFrameImageUrl?: string | null | undefined;
                lastFrameImageEntId?: string | null | undefined;
                sourceVideoUrl?: string | null | undefined;
                audioSourceUrl?: string | null | undefined;
                extendDirective?: string | null | undefined;
            } | null | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
        } | null;
        orderIndex: number;
        hasUploadedAncestor: boolean;
        updatedAt: string;
        projectId?: string | null | undefined;
        contentItemId?: string | null | undefined;
        relationship?: string | undefined;
        sourceProjectId?: string | null | undefined;
        isInTimeline?: boolean | undefined;
        addedAt?: string | undefined;
        aspectRatio?: number | null | undefined;
        data?: unknown;
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | null | undefined;
        srefValues?: unknown;
        canRetry?: boolean | undefined;
        originProjectId?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
    }[];
    needsPolling?: boolean | undefined;
}>;
declare const BatchListResponseSchema: z.ZodObject<{
    batches: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        projectId: z.ZodNullable<z.ZodString>;
        type: z.ZodEnum<["videos", "images"]>;
        prompt: z.ZodNullable<z.ZodString>;
        timestamp: z.ZodString;
        isComplete: z.ZodBoolean;
        hasError: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
        canRetry: z.ZodBoolean;
        /** In-flight batches report `config: null`; completed ones carry the object. */
        config: z.ZodNullable<z.ZodObject<{
            directGeneration: z.ZodOptional<z.ZodBoolean>;
            promptModel: z.ZodOptional<z.ZodString>;
            aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
            imageModel: z.ZodOptional<z.ZodString>;
            videoModel: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            batchVariation: z.ZodOptional<z.ZodBoolean>;
            generationType: z.ZodOptional<z.ZodString>;
            sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">>;
            directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                image_url: z.ZodString;
                image_ent_id: z.ZodString;
                source: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }>>>;
            lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                dimensions: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
            }, "strip", z.ZodTypeAny, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }>>>;
            sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        }, {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        }>>;
        systemPrompt: z.ZodNullable<z.ZodString>;
        promptModel: z.ZodNullable<z.ZodString>;
        imageModel: z.ZodNullable<z.ZodString>;
        videoModel: z.ZodNullable<z.ZodString>;
        bulkGenId: z.ZodNullable<z.ZodString>;
        generationStartTime: z.ZodNullable<z.ZodString>;
        generationEndTime: z.ZodNullable<z.ZodString>;
        creationContext: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        content: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            batchId: z.ZodString;
            type: z.ZodEnum<["videos", "images"]>;
            imageUrl: z.ZodNullable<z.ZodString>;
            videoUrl: z.ZodNullable<z.ZodString>;
            imageHandle: z.ZodNullable<z.ZodNull>;
            videoHandle: z.ZodNullable<z.ZodNull>;
            mediaEntId: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            imagePrompt: z.ZodNullable<z.ZodString>;
            videoPrompt: z.ZodNullable<z.ZodString>;
            isFavorited: z.ZodBoolean;
            isLoading: z.ZodBoolean;
            error: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            structuredOutput: z.ZodNullable<z.ZodObject<{
                config: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    directGeneration: z.ZodOptional<z.ZodBoolean>;
                    promptModel: z.ZodOptional<z.ZodString>;
                    aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
                    imageModel: z.ZodOptional<z.ZodString>;
                    videoModel: z.ZodOptional<z.ZodString>;
                    resolution: z.ZodOptional<z.ZodString>;
                    batchVariation: z.ZodOptional<z.ZodBoolean>;
                    generationType: z.ZodOptional<z.ZodString>;
                    sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        source: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        source: string;
                    }, {
                        id: string;
                        source: string;
                    }>, "many">>;
                    directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                        image_url: z.ZodString;
                        image_ent_id: z.ZodString;
                        source: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    }, {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    }>>>;
                    lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                        dimensions: z.ZodObject<{
                            width: z.ZodNumber;
                            height: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            width: number;
                            height: number;
                        }, {
                            width: number;
                            height: number;
                        }>;
                        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
                    }, "strip", z.ZodTypeAny, {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    }, {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    }>>>;
                    sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, "strip", z.ZodTypeAny, {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                }, {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                }>>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    dimensions: z.ZodObject<{
                        width: z.ZodNumber;
                        height: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        width: number;
                        height: number;
                    }, {
                        width: number;
                        height: number;
                    }>;
                    aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
                }, "strip", z.ZodTypeAny, {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                }, {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                }>>>;
            }, "strip", z.ZodTypeAny, {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            }, {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            }>>;
            orderIndex: z.ZodNumber;
            srefValues: z.ZodNullable<z.ZodUnknown>;
            data: z.ZodNullable<z.ZodUnknown>;
            canRetry: z.ZodOptional<z.ZodBoolean>;
            updatedAt: z.ZodString;
            hasUploadedAncestor: z.ZodBoolean;
            contentItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            relationship: z.ZodOptional<z.ZodString>;
            isInTimeline: z.ZodOptional<z.ZodBoolean>;
            sourceProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            addedAt: z.ZodOptional<z.ZodString>;
            originProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            thumbnailUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            aspectRatio: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            sourceContentItemIds: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">>>;
        }, "strip", z.ZodTypeAny, {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }, {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }>, "many">;
        /** Present in list responses; absent in PUT responses. */
        needsPolling: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[];
        needsPolling?: boolean | undefined;
    }, {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[];
        needsPolling?: boolean | undefined;
    }>, "many">;
    nextOffset: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    batches: {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[];
        needsPolling?: boolean | undefined;
    }[];
    nextOffset: number | null;
}, {
    batches: {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[];
        needsPolling?: boolean | undefined;
    }[];
    nextOffset: number | null;
}>;
/** `POST /api/generation-batches` returns `{ batch: null, id }`. */
declare const BatchCreateResponseSchema: z.ZodObject<{
    batch: z.ZodNullable<z.ZodUnknown>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    batch?: unknown;
}, {
    id: string;
    batch?: unknown;
}>;
/**
 * `PUT /api/generation-batches` returns `{ batch }` — the batch *without* its
 * `content` array. `POST` returns `{ batch: null, id }`.
 */
declare const BatchUpdateResponseSchema: z.ZodObject<{
    batch: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        projectId: z.ZodNullable<z.ZodString>;
        type: z.ZodEnum<["videos", "images"]>;
        prompt: z.ZodNullable<z.ZodString>;
        timestamp: z.ZodString;
        isComplete: z.ZodBoolean;
        hasError: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
        canRetry: z.ZodBoolean;
        config: z.ZodNullable<z.ZodObject<{
            directGeneration: z.ZodOptional<z.ZodBoolean>;
            promptModel: z.ZodOptional<z.ZodString>;
            aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
            imageModel: z.ZodOptional<z.ZodString>;
            videoModel: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            batchVariation: z.ZodOptional<z.ZodBoolean>;
            generationType: z.ZodOptional<z.ZodString>;
            sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">>;
            directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                image_url: z.ZodString;
                image_ent_id: z.ZodString;
                source: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }>>>;
            lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                dimensions: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
            }, "strip", z.ZodTypeAny, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }>>>;
            sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        }, {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        }>>;
        systemPrompt: z.ZodNullable<z.ZodString>;
        promptModel: z.ZodNullable<z.ZodString>;
        imageModel: z.ZodNullable<z.ZodString>;
        videoModel: z.ZodNullable<z.ZodString>;
        bulkGenId: z.ZodNullable<z.ZodString>;
        generationStartTime: z.ZodNullable<z.ZodString>;
        generationEndTime: z.ZodNullable<z.ZodString>;
        creationContext: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        needsPolling: z.ZodOptional<z.ZodBoolean>;
    } & {
        content: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            batchId: z.ZodString;
            type: z.ZodEnum<["videos", "images"]>;
            imageUrl: z.ZodNullable<z.ZodString>;
            videoUrl: z.ZodNullable<z.ZodString>;
            imageHandle: z.ZodNullable<z.ZodNull>;
            videoHandle: z.ZodNullable<z.ZodNull>;
            mediaEntId: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            imagePrompt: z.ZodNullable<z.ZodString>;
            videoPrompt: z.ZodNullable<z.ZodString>;
            isFavorited: z.ZodBoolean;
            isLoading: z.ZodBoolean;
            error: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            structuredOutput: z.ZodNullable<z.ZodObject<{
                config: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    directGeneration: z.ZodOptional<z.ZodBoolean>;
                    promptModel: z.ZodOptional<z.ZodString>;
                    aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
                    imageModel: z.ZodOptional<z.ZodString>;
                    videoModel: z.ZodOptional<z.ZodString>;
                    resolution: z.ZodOptional<z.ZodString>;
                    batchVariation: z.ZodOptional<z.ZodBoolean>;
                    generationType: z.ZodOptional<z.ZodString>;
                    sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        source: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        source: string;
                    }, {
                        id: string;
                        source: string;
                    }>, "many">>;
                    directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                        image_url: z.ZodString;
                        image_ent_id: z.ZodString;
                        source: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    }, {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    }>>>;
                    lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                        dimensions: z.ZodObject<{
                            width: z.ZodNumber;
                            height: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            width: number;
                            height: number;
                        }, {
                            width: number;
                            height: number;
                        }>;
                        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
                    }, "strip", z.ZodTypeAny, {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    }, {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    }>>>;
                    sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, "strip", z.ZodTypeAny, {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                }, {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                }>>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    dimensions: z.ZodObject<{
                        width: z.ZodNumber;
                        height: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        width: number;
                        height: number;
                    }, {
                        width: number;
                        height: number;
                    }>;
                    aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
                }, "strip", z.ZodTypeAny, {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                }, {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                }>>>;
            }, "strip", z.ZodTypeAny, {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            }, {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            }>>;
            orderIndex: z.ZodNumber;
            srefValues: z.ZodNullable<z.ZodUnknown>;
            data: z.ZodNullable<z.ZodUnknown>;
            canRetry: z.ZodOptional<z.ZodBoolean>;
            updatedAt: z.ZodString;
            hasUploadedAncestor: z.ZodBoolean;
            contentItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            relationship: z.ZodOptional<z.ZodString>;
            isInTimeline: z.ZodOptional<z.ZodBoolean>;
            sourceProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            addedAt: z.ZodOptional<z.ZodString>;
            originProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            thumbnailUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            aspectRatio: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            sourceContentItemIds: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">>>;
        }, "strip", z.ZodTypeAny, {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }, {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content?: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[] | undefined;
        needsPolling?: boolean | undefined;
    }, {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content?: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[] | undefined;
        needsPolling?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    batch: {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content?: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[] | undefined;
        needsPolling?: boolean | undefined;
    } | null;
}, {
    batch: {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content?: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[] | undefined;
        needsPolling?: boolean | undefined;
    } | null;
}>;
/** `GET /api/generation-batches/:batchId` returns the tracked batch. */
declare const BatchGetResponseSchema: z.ZodObject<{
    batch: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        projectId: z.ZodNullable<z.ZodString>;
        type: z.ZodEnum<["videos", "images"]>;
        prompt: z.ZodNullable<z.ZodString>;
        timestamp: z.ZodString;
        isComplete: z.ZodBoolean;
        hasError: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
        canRetry: z.ZodBoolean;
        /** In-flight batches report `config: null`; completed ones carry the object. */
        config: z.ZodNullable<z.ZodObject<{
            directGeneration: z.ZodOptional<z.ZodBoolean>;
            promptModel: z.ZodOptional<z.ZodString>;
            aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
            imageModel: z.ZodOptional<z.ZodString>;
            videoModel: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            batchVariation: z.ZodOptional<z.ZodBoolean>;
            generationType: z.ZodOptional<z.ZodString>;
            sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">>;
            directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                image_url: z.ZodString;
                image_ent_id: z.ZodString;
                source: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }>>>;
            lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                dimensions: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
            }, "strip", z.ZodTypeAny, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }>>>;
            sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        }, {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        }>>;
        systemPrompt: z.ZodNullable<z.ZodString>;
        promptModel: z.ZodNullable<z.ZodString>;
        imageModel: z.ZodNullable<z.ZodString>;
        videoModel: z.ZodNullable<z.ZodString>;
        bulkGenId: z.ZodNullable<z.ZodString>;
        generationStartTime: z.ZodNullable<z.ZodString>;
        generationEndTime: z.ZodNullable<z.ZodString>;
        creationContext: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        content: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            batchId: z.ZodString;
            type: z.ZodEnum<["videos", "images"]>;
            imageUrl: z.ZodNullable<z.ZodString>;
            videoUrl: z.ZodNullable<z.ZodString>;
            imageHandle: z.ZodNullable<z.ZodNull>;
            videoHandle: z.ZodNullable<z.ZodNull>;
            mediaEntId: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            imagePrompt: z.ZodNullable<z.ZodString>;
            videoPrompt: z.ZodNullable<z.ZodString>;
            isFavorited: z.ZodBoolean;
            isLoading: z.ZodBoolean;
            error: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            structuredOutput: z.ZodNullable<z.ZodObject<{
                config: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    directGeneration: z.ZodOptional<z.ZodBoolean>;
                    promptModel: z.ZodOptional<z.ZodString>;
                    aspectRatio: z.ZodOptional<z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>>;
                    imageModel: z.ZodOptional<z.ZodString>;
                    videoModel: z.ZodOptional<z.ZodString>;
                    resolution: z.ZodOptional<z.ZodString>;
                    batchVariation: z.ZodOptional<z.ZodBoolean>;
                    generationType: z.ZodOptional<z.ZodString>;
                    sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        source: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        source: string;
                    }, {
                        id: string;
                        source: string;
                    }>, "many">>;
                    directPromptImageHandle: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                        image_url: z.ZodString;
                        image_ent_id: z.ZodString;
                        source: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    }, {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    }>>>;
                    lastFrameImageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    lastFrameImageEntId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                        dimensions: z.ZodObject<{
                            width: z.ZodNumber;
                            height: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            width: number;
                            height: number;
                        }, {
                            width: number;
                            height: number;
                        }>;
                        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
                    }, "strip", z.ZodTypeAny, {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    }, {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    }>>>;
                    sourceVideoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    audioSourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    extendDirective: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, "strip", z.ZodTypeAny, {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                }, {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                }>>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    dimensions: z.ZodObject<{
                        width: z.ZodNumber;
                        height: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        width: number;
                        height: number;
                    }, {
                        width: number;
                        height: number;
                    }>;
                    aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
                }, "strip", z.ZodTypeAny, {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                }, {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                }>>>;
            }, "strip", z.ZodTypeAny, {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            }, {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            }>>;
            orderIndex: z.ZodNumber;
            srefValues: z.ZodNullable<z.ZodUnknown>;
            data: z.ZodNullable<z.ZodUnknown>;
            canRetry: z.ZodOptional<z.ZodBoolean>;
            updatedAt: z.ZodString;
            hasUploadedAncestor: z.ZodBoolean;
            contentItemId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            relationship: z.ZodOptional<z.ZodString>;
            isInTimeline: z.ZodOptional<z.ZodBoolean>;
            sourceProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            addedAt: z.ZodOptional<z.ZodString>;
            originProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            thumbnailUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            aspectRatio: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            sourceContentItemIds: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">>>;
        }, "strip", z.ZodTypeAny, {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }, {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }>, "many">;
        /** Present in list responses; absent in PUT responses. */
        needsPolling: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[];
        needsPolling?: boolean | undefined;
    }, {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[];
        needsPolling?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    batch: {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[];
        needsPolling?: boolean | undefined;
    } | null;
}, {
    batch: {
        type: "videos" | "images";
        id: string;
        projectId: string | null;
        prompt: string | null;
        error: string | null;
        createdAt: string;
        config: {
            aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
            metadata?: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            } | null | undefined;
            directGeneration?: boolean | undefined;
            promptModel?: string | undefined;
            imageModel?: string | undefined;
            videoModel?: string | undefined;
            resolution?: string | undefined;
            batchVariation?: boolean | undefined;
            generationType?: string | undefined;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | undefined;
            directPromptImageHandle?: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            } | null | undefined;
            lastFrameImageUrl?: string | null | undefined;
            lastFrameImageEntId?: string | null | undefined;
            sourceVideoUrl?: string | null | undefined;
            audioSourceUrl?: string | null | undefined;
            extendDirective?: string | null | undefined;
        } | null;
        updatedAt: string;
        userId: string;
        promptModel: string | null;
        imageModel: string | null;
        videoModel: string | null;
        canRetry: boolean;
        timestamp: string;
        isComplete: boolean;
        hasError: boolean;
        systemPrompt: string | null;
        bulkGenId: string | null;
        generationStartTime: string | null;
        generationEndTime: string | null;
        creationContext: string;
        content: {
            type: "videos" | "images";
            mediaEntId: string | null;
            videoUrl: string | null;
            imageUrl: string | null;
            id: string;
            imageHandle: null;
            videoHandle: null;
            prompt: string | null;
            imagePrompt: string | null;
            videoPrompt: string | null;
            isFavorited: boolean;
            isLoading: boolean;
            error: string | null;
            createdAt: string;
            batchId: string;
            structuredOutput: {
                config?: {
                    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | undefined;
                    metadata?: {
                        dimensions: {
                            width: number;
                            height: number;
                        };
                        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                    } | null | undefined;
                    directGeneration?: boolean | undefined;
                    promptModel?: string | undefined;
                    imageModel?: string | undefined;
                    videoModel?: string | undefined;
                    resolution?: string | undefined;
                    batchVariation?: boolean | undefined;
                    generationType?: string | undefined;
                    sourceContentItemIds?: {
                        id: string;
                        source: string;
                    }[] | undefined;
                    directPromptImageHandle?: {
                        image_url: string;
                        image_ent_id: string;
                        source?: string | undefined;
                    } | null | undefined;
                    lastFrameImageUrl?: string | null | undefined;
                    lastFrameImageEntId?: string | null | undefined;
                    sourceVideoUrl?: string | null | undefined;
                    audioSourceUrl?: string | null | undefined;
                    extendDirective?: string | null | undefined;
                } | null | undefined;
                metadata?: {
                    dimensions: {
                        width: number;
                        height: number;
                    };
                    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
                } | null | undefined;
            } | null;
            orderIndex: number;
            hasUploadedAncestor: boolean;
            updatedAt: string;
            projectId?: string | null | undefined;
            contentItemId?: string | null | undefined;
            relationship?: string | undefined;
            sourceProjectId?: string | null | undefined;
            isInTimeline?: boolean | undefined;
            addedAt?: string | undefined;
            aspectRatio?: number | null | undefined;
            data?: unknown;
            sourceContentItemIds?: {
                id: string;
                source: string;
            }[] | null | undefined;
            srefValues?: unknown;
            canRetry?: boolean | undefined;
            originProjectId?: string | null | undefined;
            thumbnailUrl?: string | null | undefined;
        }[];
        needsPolling?: boolean | undefined;
    } | null;
}>;
/** One item in a `GET /api/generation-batches/:batchId/stream` event. */
declare const BatchStreamItemSchema: z.ZodObject<{
    id: z.ZodString;
    /** Not always present; defaults to `videos` for generation batches. */
    type: z.ZodOptional<z.ZodEnum<["videos", "images"]>>;
    isLoading: z.ZodBoolean;
    videoUrl: z.ZodNullable<z.ZodString>;
    videoHandle: z.ZodNullable<z.ZodNull>;
    imageUrl: z.ZodNullable<z.ZodString>;
    imageHandle: z.ZodNullable<z.ZodNull>;
    /** `data` is an object early on, then becomes a JSON string. */
    data: z.ZodNullable<z.ZodUnknown>;
    error: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
    imageHandle: null;
    videoHandle: null;
    isLoading: boolean;
    error: string | null;
    type?: "videos" | "images" | undefined;
    data?: unknown;
}, {
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
    imageHandle: null;
    videoHandle: null;
    isLoading: boolean;
    error: string | null;
    type?: "videos" | "images" | undefined;
    data?: unknown;
}>;
/** One SSE `data:` event from the batch stream. */
declare const BatchStreamEventSchema: z.ZodObject<{
    success: z.ZodBoolean;
    isComplete: z.ZodBoolean;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        /** Not always present; defaults to `videos` for generation batches. */
        type: z.ZodOptional<z.ZodEnum<["videos", "images"]>>;
        isLoading: z.ZodBoolean;
        videoUrl: z.ZodNullable<z.ZodString>;
        videoHandle: z.ZodNullable<z.ZodNull>;
        imageUrl: z.ZodNullable<z.ZodString>;
        imageHandle: z.ZodNullable<z.ZodNull>;
        /** `data` is an object early on, then becomes a JSON string. */
        data: z.ZodNullable<z.ZodUnknown>;
        error: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        imageHandle: null;
        videoHandle: null;
        isLoading: boolean;
        error: string | null;
        type?: "videos" | "images" | undefined;
        data?: unknown;
    }, {
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        imageHandle: null;
        videoHandle: null;
        isLoading: boolean;
        error: string | null;
        type?: "videos" | "images" | undefined;
        data?: unknown;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    items: {
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        imageHandle: null;
        videoHandle: null;
        isLoading: boolean;
        error: string | null;
        type?: "videos" | "images" | undefined;
        data?: unknown;
    }[];
    isComplete: boolean;
}, {
    success: boolean;
    items: {
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        imageHandle: null;
        videoHandle: null;
        isLoading: boolean;
        error: string | null;
        type?: "videos" | "images" | undefined;
        data?: unknown;
    }[];
    isComplete: boolean;
}>;
type SourceContentItemId = z.infer<typeof SourceContentItemIdSchema>;
type DirectPromptImageHandle = z.infer<typeof DirectPromptImageHandleSchema>;
type GenerationConfig = z.infer<typeof GenerationConfigSchema>;
type StructuredOutput = z.infer<typeof StructuredOutputSchema>;
type BatchContentItem = z.infer<typeof BatchContentItemSchema>;
type GenerationBatch = z.infer<typeof GenerationBatchSchema>;
type BatchListResponse = z.infer<typeof BatchListResponseSchema>;
type BatchCreateResponse = z.infer<typeof BatchCreateResponseSchema>;
type BatchUpdateResponse = z.infer<typeof BatchUpdateResponseSchema>;
type BatchGetResponse = z.infer<typeof BatchGetResponseSchema>;
type BatchStreamItem = z.infer<typeof BatchStreamItemSchema>;
type BatchStreamEvent = z.infer<typeof BatchStreamEventSchema>;

/**
 * Generation endpoints (`/api/generate/videos`, `/api/generation-batches`).
 *
 * These schemas describe what the *client sends*. Unlike the response
 * schemas (which are intentionally loose to survive API drift), the request
 * schemas are strict: they validate user input and pin the exact wire format
 * observed in the captured traces.
 */
/** Shared t2v config fields sent for both frame-based and prompt-only inputs. */
declare const T2VBaseConfigSchema: z.ZodObject<{
    directGeneration: z.ZodLiteral<true>;
    promptModel: z.ZodString;
    aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
    imageModel: z.ZodString;
    videoModel: z.ZodString;
    resolution: z.ZodString;
    batchVariation: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    directGeneration: true;
    promptModel: string;
    imageModel: string;
    videoModel: string;
    resolution: string;
    batchVariation: boolean;
}, {
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    directGeneration: true;
    promptModel: string;
    imageModel: string;
    videoModel: string;
    resolution: string;
    batchVariation: boolean;
}>;
/** Frame-based (image) input config: adds the start/end frame references. */
declare const T2VFrameConfigSchema: z.ZodObject<{
    directGeneration: z.ZodLiteral<true>;
    promptModel: z.ZodString;
    aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
    imageModel: z.ZodString;
    videoModel: z.ZodString;
    resolution: z.ZodString;
    batchVariation: z.ZodBoolean;
} & {
    sourceContentItemIds: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        source: string;
    }, {
        id: string;
        source: string;
    }>, "many">;
    directPromptImageHandle: z.ZodObject<{
        image_url: z.ZodString;
        image_ent_id: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        image_url: string;
        image_ent_id: string;
        source?: string | undefined;
    }, {
        image_url: string;
        image_ent_id: string;
        source?: string | undefined;
    }>;
    lastFrameImageUrl: z.ZodOptional<z.ZodString>;
    lastFrameImageEntId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    directGeneration: true;
    promptModel: string;
    imageModel: string;
    videoModel: string;
    resolution: string;
    batchVariation: boolean;
    sourceContentItemIds: {
        id: string;
        source: string;
    }[];
    directPromptImageHandle: {
        image_url: string;
        image_ent_id: string;
        source?: string | undefined;
    };
    lastFrameImageUrl?: string | undefined;
    lastFrameImageEntId?: string | undefined;
}, {
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    directGeneration: true;
    promptModel: string;
    imageModel: string;
    videoModel: string;
    resolution: string;
    batchVariation: boolean;
    sourceContentItemIds: {
        id: string;
        source: string;
    }[];
    directPromptImageHandle: {
        image_url: string;
        image_ent_id: string;
        source?: string | undefined;
    };
    lastFrameImageUrl?: string | undefined;
    lastFrameImageEntId?: string | undefined;
}>;
/**
 * Single input of a t2v generation. When a start frame is provided the input
 * is an `image`; otherwise the generation runs from a bare `prompt`.
 */
declare const T2VGenerateInputSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"image">;
    imageUrl: z.ZodString;
    imageEntId: z.ZodString;
    prompt: z.ZodString;
    originalPrompt: z.ZodString;
    config: z.ZodObject<{
        directGeneration: z.ZodLiteral<true>;
        promptModel: z.ZodString;
        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
        imageModel: z.ZodString;
        videoModel: z.ZodString;
        resolution: z.ZodString;
        batchVariation: z.ZodBoolean;
    } & {
        sourceContentItemIds: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            source: string;
        }, {
            id: string;
            source: string;
        }>, "many">;
        directPromptImageHandle: z.ZodObject<{
            image_url: z.ZodString;
            image_ent_id: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        }, {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        }>;
        lastFrameImageUrl: z.ZodOptional<z.ZodString>;
        lastFrameImageEntId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        directPromptImageHandle: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        };
        lastFrameImageUrl?: string | undefined;
        lastFrameImageEntId?: string | undefined;
    }, {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        directPromptImageHandle: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        };
        lastFrameImageUrl?: string | undefined;
        lastFrameImageEntId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "image";
    imageEntId: string;
    imageUrl: string;
    prompt: string;
    config: {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        directPromptImageHandle: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        };
        lastFrameImageUrl?: string | undefined;
        lastFrameImageEntId?: string | undefined;
    };
    originalPrompt: string;
}, {
    type: "image";
    imageEntId: string;
    imageUrl: string;
    prompt: string;
    config: {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        directPromptImageHandle: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        };
        lastFrameImageUrl?: string | undefined;
        lastFrameImageEntId?: string | undefined;
    };
    originalPrompt: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"prompt">;
    value: z.ZodString;
    original_prompt: z.ZodString;
    config: z.ZodObject<{
        directGeneration: z.ZodLiteral<true>;
        promptModel: z.ZodString;
        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
        imageModel: z.ZodString;
        videoModel: z.ZodString;
        resolution: z.ZodString;
        batchVariation: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
    }, {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    value: string;
    type: "prompt";
    config: {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
    };
    original_prompt: string;
}, {
    value: string;
    type: "prompt";
    config: {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
    };
    original_prompt: string;
}>]>;
declare const T2VGenerateRequestSchema: z.ZodObject<{
    inputs: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"image">;
        imageUrl: z.ZodString;
        imageEntId: z.ZodString;
        prompt: z.ZodString;
        originalPrompt: z.ZodString;
        config: z.ZodObject<{
            directGeneration: z.ZodLiteral<true>;
            promptModel: z.ZodString;
            aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
            imageModel: z.ZodString;
            videoModel: z.ZodString;
            resolution: z.ZodString;
            batchVariation: z.ZodBoolean;
        } & {
            sourceContentItemIds: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">;
            directPromptImageHandle: z.ZodObject<{
                image_url: z.ZodString;
                image_ent_id: z.ZodString;
                source: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }, {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            }>;
            lastFrameImageUrl: z.ZodOptional<z.ZodString>;
            lastFrameImageEntId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            directPromptImageHandle: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            };
            lastFrameImageUrl?: string | undefined;
            lastFrameImageEntId?: string | undefined;
        }, {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            directPromptImageHandle: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            };
            lastFrameImageUrl?: string | undefined;
            lastFrameImageEntId?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        imageEntId: string;
        imageUrl: string;
        prompt: string;
        config: {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            directPromptImageHandle: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            };
            lastFrameImageUrl?: string | undefined;
            lastFrameImageEntId?: string | undefined;
        };
        originalPrompt: string;
    }, {
        type: "image";
        imageEntId: string;
        imageUrl: string;
        prompt: string;
        config: {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            directPromptImageHandle: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            };
            lastFrameImageUrl?: string | undefined;
            lastFrameImageEntId?: string | undefined;
        };
        originalPrompt: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"prompt">;
        value: z.ZodString;
        original_prompt: z.ZodString;
        config: z.ZodObject<{
            directGeneration: z.ZodLiteral<true>;
            promptModel: z.ZodString;
            aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
            imageModel: z.ZodString;
            videoModel: z.ZodString;
            resolution: z.ZodString;
            batchVariation: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
        }, {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: "prompt";
        config: {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
        };
        original_prompt: string;
    }, {
        value: string;
        type: "prompt";
        config: {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
        };
        original_prompt: string;
    }>]>, "many">;
    config: z.ZodObject<{
        directGeneration: z.ZodLiteral<true>;
        promptModel: z.ZodString;
        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
        imageModel: z.ZodString;
        videoModel: z.ZodString;
        resolution: z.ZodString;
        batchVariation: z.ZodBoolean;
    } & {
        generationType: z.ZodLiteral<"t2v">;
        sourceContentItemIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            source: string;
        }, {
            id: string;
            source: string;
        }>, "many">>;
        directPromptImageHandle: z.ZodOptional<z.ZodObject<{
            image_url: z.ZodString;
            image_ent_id: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        }, {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        }>>;
        lastFrameImageUrl: z.ZodOptional<z.ZodString>;
        lastFrameImageEntId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
        generationType: "t2v";
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | undefined;
        lastFrameImageUrl?: string | undefined;
        lastFrameImageEntId?: string | undefined;
    }, {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
        generationType: "t2v";
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | undefined;
        lastFrameImageUrl?: string | undefined;
        lastFrameImageEntId?: string | undefined;
    }>;
    batchId: z.ZodString;
    mg_request_id: z.ZodString;
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    batchId: string;
    config: {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
        generationType: "t2v";
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | undefined;
        lastFrameImageUrl?: string | undefined;
        lastFrameImageEntId?: string | undefined;
    };
    inputs: ({
        type: "image";
        imageEntId: string;
        imageUrl: string;
        prompt: string;
        config: {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            directPromptImageHandle: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            };
            lastFrameImageUrl?: string | undefined;
            lastFrameImageEntId?: string | undefined;
        };
        originalPrompt: string;
    } | {
        value: string;
        type: "prompt";
        config: {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
        };
        original_prompt: string;
    })[];
    mg_request_id: string;
}, {
    projectId: string;
    batchId: string;
    config: {
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        directGeneration: true;
        promptModel: string;
        imageModel: string;
        videoModel: string;
        resolution: string;
        batchVariation: boolean;
        generationType: "t2v";
        sourceContentItemIds?: {
            id: string;
            source: string;
        }[] | undefined;
        directPromptImageHandle?: {
            image_url: string;
            image_ent_id: string;
            source?: string | undefined;
        } | undefined;
        lastFrameImageUrl?: string | undefined;
        lastFrameImageEntId?: string | undefined;
    };
    inputs: ({
        type: "image";
        imageEntId: string;
        imageUrl: string;
        prompt: string;
        config: {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            directPromptImageHandle: {
                image_url: string;
                image_ent_id: string;
                source?: string | undefined;
            };
            lastFrameImageUrl?: string | undefined;
            lastFrameImageEntId?: string | undefined;
        };
        originalPrompt: string;
    } | {
        value: string;
        type: "prompt";
        config: {
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            directGeneration: true;
            promptModel: string;
            imageModel: string;
            videoModel: string;
            resolution: string;
            batchVariation: boolean;
        };
        original_prompt: string;
    })[];
    mg_request_id: string;
}>;
/** Single extend input for an extend generation. */
declare const ExtendGenerateInputSchema: z.ZodObject<{
    type: z.ZodLiteral<"extend">;
    mediaEntId: z.ZodString;
    videoUrl: z.ZodString;
    prompt: z.ZodString;
    extendDirective: z.ZodOptional<z.ZodString>;
    config: z.ZodObject<{
        metadata: z.ZodObject<{
            dimensions: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
        }, "strip", z.ZodTypeAny, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }>;
        videoModel: z.ZodString;
        imageModel: z.ZodString;
        generationType: z.ZodLiteral<"extend">;
        sourceVideoUrl: z.ZodString;
        audioSourceUrl: z.ZodOptional<z.ZodString>;
        directGeneration: z.ZodLiteral<true>;
        sourceContentItemIds: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            source: string;
        }, {
            id: string;
            source: string;
        }>, "many">;
        extendDirective: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        metadata: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        };
        directGeneration: true;
        imageModel: string;
        videoModel: string;
        generationType: "extend";
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        sourceVideoUrl: string;
        audioSourceUrl?: string | undefined;
        extendDirective?: string | undefined;
    }, {
        metadata: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        };
        directGeneration: true;
        imageModel: string;
        videoModel: string;
        generationType: "extend";
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        sourceVideoUrl: string;
        audioSourceUrl?: string | undefined;
        extendDirective?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "extend";
    mediaEntId: string;
    videoUrl: string;
    prompt: string;
    config: {
        metadata: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        };
        directGeneration: true;
        imageModel: string;
        videoModel: string;
        generationType: "extend";
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        sourceVideoUrl: string;
        audioSourceUrl?: string | undefined;
        extendDirective?: string | undefined;
    };
    extendDirective?: string | undefined;
}, {
    type: "extend";
    mediaEntId: string;
    videoUrl: string;
    prompt: string;
    config: {
        metadata: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        };
        directGeneration: true;
        imageModel: string;
        videoModel: string;
        generationType: "extend";
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        sourceVideoUrl: string;
        audioSourceUrl?: string | undefined;
        extendDirective?: string | undefined;
    };
    extendDirective?: string | undefined;
}>;
declare const ExtendGenerateRequestSchema: z.ZodObject<{
    inputs: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"extend">;
        mediaEntId: z.ZodString;
        videoUrl: z.ZodString;
        prompt: z.ZodString;
        extendDirective: z.ZodOptional<z.ZodString>;
        config: z.ZodObject<{
            metadata: z.ZodObject<{
                dimensions: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
            }, "strip", z.ZodTypeAny, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }, {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            }>;
            videoModel: z.ZodString;
            imageModel: z.ZodString;
            generationType: z.ZodLiteral<"extend">;
            sourceVideoUrl: z.ZodString;
            audioSourceUrl: z.ZodOptional<z.ZodString>;
            directGeneration: z.ZodLiteral<true>;
            sourceContentItemIds: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                source: string;
            }, {
                id: string;
                source: string;
            }>, "many">;
            extendDirective: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            metadata: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            };
            directGeneration: true;
            imageModel: string;
            videoModel: string;
            generationType: "extend";
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            sourceVideoUrl: string;
            audioSourceUrl?: string | undefined;
            extendDirective?: string | undefined;
        }, {
            metadata: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            };
            directGeneration: true;
            imageModel: string;
            videoModel: string;
            generationType: "extend";
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            sourceVideoUrl: string;
            audioSourceUrl?: string | undefined;
            extendDirective?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "extend";
        mediaEntId: string;
        videoUrl: string;
        prompt: string;
        config: {
            metadata: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            };
            directGeneration: true;
            imageModel: string;
            videoModel: string;
            generationType: "extend";
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            sourceVideoUrl: string;
            audioSourceUrl?: string | undefined;
            extendDirective?: string | undefined;
        };
        extendDirective?: string | undefined;
    }, {
        type: "extend";
        mediaEntId: string;
        videoUrl: string;
        prompt: string;
        config: {
            metadata: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            };
            directGeneration: true;
            imageModel: string;
            videoModel: string;
            generationType: "extend";
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            sourceVideoUrl: string;
            audioSourceUrl?: string | undefined;
            extendDirective?: string | undefined;
        };
        extendDirective?: string | undefined;
    }>, "many">;
    config: z.ZodObject<{
        metadata: z.ZodObject<{
            dimensions: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
        }, "strip", z.ZodTypeAny, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }, {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        }>;
        videoModel: z.ZodString;
        imageModel: z.ZodString;
        generationType: z.ZodLiteral<"extend">;
        sourceVideoUrl: z.ZodString;
        audioSourceUrl: z.ZodOptional<z.ZodString>;
        directGeneration: z.ZodLiteral<true>;
        sourceContentItemIds: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            source: string;
        }, {
            id: string;
            source: string;
        }>, "many">;
        extendDirective: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        metadata: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        };
        directGeneration: true;
        imageModel: string;
        videoModel: string;
        generationType: "extend";
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        sourceVideoUrl: string;
        audioSourceUrl?: string | undefined;
        extendDirective?: string | undefined;
    }, {
        metadata: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        };
        directGeneration: true;
        imageModel: string;
        videoModel: string;
        generationType: "extend";
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        sourceVideoUrl: string;
        audioSourceUrl?: string | undefined;
        extendDirective?: string | undefined;
    }>;
    batchId: z.ZodString;
    mg_request_id: z.ZodString;
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    batchId: string;
    config: {
        metadata: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        };
        directGeneration: true;
        imageModel: string;
        videoModel: string;
        generationType: "extend";
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        sourceVideoUrl: string;
        audioSourceUrl?: string | undefined;
        extendDirective?: string | undefined;
    };
    inputs: {
        type: "extend";
        mediaEntId: string;
        videoUrl: string;
        prompt: string;
        config: {
            metadata: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            };
            directGeneration: true;
            imageModel: string;
            videoModel: string;
            generationType: "extend";
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            sourceVideoUrl: string;
            audioSourceUrl?: string | undefined;
            extendDirective?: string | undefined;
        };
        extendDirective?: string | undefined;
    }[];
    mg_request_id: string;
}, {
    projectId: string;
    batchId: string;
    config: {
        metadata: {
            dimensions: {
                width: number;
                height: number;
            };
            aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        };
        directGeneration: true;
        imageModel: string;
        videoModel: string;
        generationType: "extend";
        sourceContentItemIds: {
            id: string;
            source: string;
        }[];
        sourceVideoUrl: string;
        audioSourceUrl?: string | undefined;
        extendDirective?: string | undefined;
    };
    inputs: {
        type: "extend";
        mediaEntId: string;
        videoUrl: string;
        prompt: string;
        config: {
            metadata: {
                dimensions: {
                    width: number;
                    height: number;
                };
                aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
            };
            directGeneration: true;
            imageModel: string;
            videoModel: string;
            generationType: "extend";
            sourceContentItemIds: {
                id: string;
                source: string;
            }[];
            sourceVideoUrl: string;
            audioSourceUrl?: string | undefined;
            extendDirective?: string | undefined;
        };
        extendDirective?: string | undefined;
    }[];
    mg_request_id: string;
}>;
/** Shared response shape of `POST /api/generate/videos`. */
declare const GenerateVideosResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    batchId: z.ZodString;
    videoGenEntIds: z.ZodArray<z.ZodString, "many">;
    needsPolling: z.ZodBoolean;
    hasPartialErrors: z.ZodBoolean;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        imageUrl: z.ZodNullable<z.ZodString>;
        isLoading: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        imageUrl: string | null;
        id: string;
        isLoading: boolean;
        error: string | null;
    }, {
        imageUrl: string | null;
        id: string;
        isLoading: boolean;
        error: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    batchId: string;
    success: boolean;
    items: {
        imageUrl: string | null;
        id: string;
        isLoading: boolean;
        error: string | null;
    }[];
    needsPolling: boolean;
    videoGenEntIds: string[];
    hasPartialErrors: boolean;
}, {
    batchId: string;
    success: boolean;
    items: {
        imageUrl: string | null;
        id: string;
        isLoading: boolean;
        error: string | null;
    }[];
    needsPolling: boolean;
    videoGenEntIds: string[];
    hasPartialErrors: boolean;
}>;
/**
 * Skeleton batch registered via `POST /api/generation-batches` right after
 * generation submission so the server starts tracking progress.
 */
declare const BatchSkeletonSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["videos", "images"]>;
    prompt: z.ZodString;
    timestamp: z.ZodString;
    content: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["videos", "images"]>;
        isLoading: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        type: "videos" | "images";
        id: string;
        isLoading: boolean;
    }, {
        type: "videos" | "images";
        id: string;
        isLoading: boolean;
    }>, "many">;
    isComplete: z.ZodLiteral<false>;
    config: z.ZodUnknown;
    promptModel: z.ZodOptional<z.ZodString>;
    imageModel: z.ZodOptional<z.ZodString>;
    videoModel: z.ZodOptional<z.ZodString>;
    generationStartTime: z.ZodOptional<z.ZodString>;
    isDirectGeneration: z.ZodOptional<z.ZodLiteral<true>>;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "videos" | "images";
    id: string;
    prompt: string;
    timestamp: string;
    isComplete: false;
    content: {
        type: "videos" | "images";
        id: string;
        isLoading: boolean;
    }[];
    projectId?: string | undefined;
    config?: unknown;
    promptModel?: string | undefined;
    imageModel?: string | undefined;
    videoModel?: string | undefined;
    generationStartTime?: string | undefined;
    isDirectGeneration?: true | undefined;
}, {
    type: "videos" | "images";
    id: string;
    prompt: string;
    timestamp: string;
    isComplete: false;
    content: {
        type: "videos" | "images";
        id: string;
        isLoading: boolean;
    }[];
    projectId?: string | undefined;
    config?: unknown;
    promptModel?: string | undefined;
    imageModel?: string | undefined;
    videoModel?: string | undefined;
    generationStartTime?: string | undefined;
    isDirectGeneration?: true | undefined;
}>;
/** A batch update sent via `PUT /api/generation-batches`. */
declare const BatchUpdatePayloadSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["videos", "images"]>;
        isLoading: z.ZodBoolean;
        videoUrl: z.ZodNullable<z.ZodString>;
        videoHandle: z.ZodNullable<z.ZodUnknown>;
        imageUrl: z.ZodNullable<z.ZodString>;
        imageHandle: z.ZodNullable<z.ZodUnknown>;
        /** Note: serialized as a JSON *string* in the PUT body. */
        data: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "videos" | "images";
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        isLoading: boolean;
        error: string | null;
        data: string | null;
        imageHandle?: unknown;
        videoHandle?: unknown;
    }, {
        type: "videos" | "images";
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        isLoading: boolean;
        error: string | null;
        data: string | null;
        imageHandle?: unknown;
        videoHandle?: unknown;
    }>, "many">;
    isComplete: z.ZodBoolean;
    generationEndTime: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    isComplete: boolean;
    generationEndTime: string;
    content: {
        type: "videos" | "images";
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        isLoading: boolean;
        error: string | null;
        data: string | null;
        imageHandle?: unknown;
        videoHandle?: unknown;
    }[];
}, {
    id: string;
    isComplete: boolean;
    generationEndTime: string;
    content: {
        type: "videos" | "images";
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
        isLoading: boolean;
        error: string | null;
        data: string | null;
        imageHandle?: unknown;
        videoHandle?: unknown;
    }[];
}>;
type T2VGenerateInput = z.infer<typeof T2VGenerateInputSchema>;
type T2VGenerateRequest = z.infer<typeof T2VGenerateRequestSchema>;
type ExtendGenerateInput = z.infer<typeof ExtendGenerateInputSchema>;
type ExtendGenerateRequest = z.infer<typeof ExtendGenerateRequestSchema>;
type GenerateVideosResponse = z.infer<typeof GenerateVideosResponseSchema>;
type BatchSkeleton = z.infer<typeof BatchSkeletonSchema>;
type BatchUpdatePayload = z.infer<typeof BatchUpdatePayloadSchema>;

interface ListBatchesOptions {
    limit?: number;
    offset?: number;
}
interface StreamBatchOptions {
    signal?: AbortSignal;
    /** Called with every parsed stream event as it arrives. */
    onEvent?: (event: BatchStreamEvent) => void | Promise<void>;
}
/** Generation-batch endpoints. */
declare class BatchesResource {
    private readonly http;
    constructor(http: HttpClient);
    /** Lists batches for a project (`GET /api/projects/:projectId/batches`). */
    list(projectId: string, options?: ListBatchesOptions): Promise<BatchListResponse>;
    /** Fetches a single tracked batch (`GET /api/generation-batches/:batchId`). */
    get(batchId: string): Promise<BatchGetResponse>;
    /**
     * Streams batch progress over SSE (`GET /api/generation-batches/:batchId/stream`).
     *
     * The endpoint emits `data:` lines that repeat the full item state each
     * time something changes, ending with `isComplete: true` once every item
     * has resolved. Resolves once the stream fully closes.
     */
    stream(batchId: string, options?: StreamBatchOptions): Promise<void>;
    /**
     * Registers a batch for tracking (`POST /api/generation-batches`).
     *
     * Called immediately after `POST /api/generate/videos` with the batch
     * skeleton so the server starts reporting progress. The response is
     * sometimes two concatenated JSON blobs; both are parsed defensively.
     */
    create(skeleton: BatchSkeleton): Promise<BatchCreateResponse>;
    /** Updates the state of a batch (`PUT /api/generation-batches`). */
    update(payload: BatchUpdatePayload): Promise<BatchUpdateResponse>;
    private validateCreate;
}

/** Content-item deletion (`/api/content-items/bulk-delete`). */
/** Payload for `DELETE /api/content-items/bulk-delete`. */
declare const BulkDeletePayloadSchema: z.ZodObject<{
    contentItemIds: z.ZodArray<z.ZodString, "many">;
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    contentItemIds: string[];
}, {
    projectId: string;
    contentItemIds: string[];
}>;
/** Response from `DELETE /api/content-items/bulk-delete`. */
declare const BulkDeleteResponseSchema: z.ZodObject<{
    deletedItems: z.ZodNumber;
    removedFromProject: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    deletedItems: number;
    removedFromProject: number;
}, {
    deletedItems: number;
    removedFromProject: number;
}>;
type BulkDeletePayload = z.infer<typeof BulkDeletePayloadSchema>;
type BulkDeleteResponse = z.infer<typeof BulkDeleteResponseSchema>;

/** Content-item endpoints (`/api/content-items`). */
declare class ContentItemsResource {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Bulk-deletes content items from a project (`DELETE /api/content-items/bulk-delete`).
     *
     * Content item ids are the `contentItemId` values on assets and batch
     * entries (e.g. generated-video content items). Deletion is idempotent.
     */
    bulkDelete(projectId: string, contentItemIds: readonly string[]): Promise<BulkDeleteResponse>;
}

/** `POST /api/upload-media` — multipart file upload. */
declare const UploadMediaResponseSchema: z.ZodObject<{
    mediaEntId: z.ZodString;
    cdnUrl: z.ZodString;
    dimensions: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
    }, {
        width: number;
        height: number;
    }>;
    aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
    uploadToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    mediaEntId: string;
    dimensions: {
        width: number;
        height: number;
    };
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    cdnUrl: string;
    uploadToken: string;
}, {
    mediaEntId: string;
    dimensions: {
        width: number;
        height: number;
    };
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    cdnUrl: string;
    uploadToken: string;
}>;
type UploadMediaResponse = z.infer<typeof UploadMediaResponseSchema>;
/** One file entry in the `POST /api/projects/:projectId/upload` body. */
declare const ProjectUploadFileSchema: z.ZodObject<{
    mediaEntId: z.ZodString;
    uploadToken: z.ZodString;
    cdnUrl: z.ZodString;
    filename: z.ZodString;
    dimensions: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
    }, {
        width: number;
        height: number;
    }>;
    aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
}, "strip", z.ZodTypeAny, {
    mediaEntId: string;
    dimensions: {
        width: number;
        height: number;
    };
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    cdnUrl: string;
    uploadToken: string;
    filename: string;
}, {
    mediaEntId: string;
    dimensions: {
        width: number;
        height: number;
    };
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    cdnUrl: string;
    uploadToken: string;
    filename: string;
}>;
type ProjectUploadFile = z.infer<typeof ProjectUploadFileSchema>;
/** Payload for `POST /api/projects/:projectId/upload`. */
declare const ProjectUploadRequestSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodObject<{
        mediaEntId: z.ZodString;
        uploadToken: z.ZodString;
        cdnUrl: z.ZodString;
        filename: z.ZodString;
        dimensions: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
        }, {
            width: number;
            height: number;
        }>;
        aspectRatio: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
    }, "strip", z.ZodTypeAny, {
        mediaEntId: string;
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        cdnUrl: string;
        uploadToken: string;
        filename: string;
    }, {
        mediaEntId: string;
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        cdnUrl: string;
        uploadToken: string;
        filename: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    files: {
        mediaEntId: string;
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        cdnUrl: string;
        uploadToken: string;
        filename: string;
    }[];
}, {
    files: {
        mediaEntId: string;
        dimensions: {
            width: number;
            height: number;
        };
        aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
        cdnUrl: string;
        uploadToken: string;
        filename: string;
    }[];
}>;
type ProjectUploadRequest = z.infer<typeof ProjectUploadRequestSchema>;
/** A content item created by attaching an uploaded file to a project. */
declare const ProjectUploadedContentItemSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<"images">;
    imageUrl: z.ZodNullable<z.ZodString>;
    videoUrl: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "images";
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
}, {
    type: "images";
    videoUrl: string | null;
    imageUrl: string | null;
    id: string;
}>;
type ProjectUploadedContentItem = z.infer<typeof ProjectUploadedContentItemSchema>;
/** Response from `POST /api/projects/:projectId/upload`. */
declare const ProjectUploadResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    contentItems: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"images">;
        imageUrl: z.ZodNullable<z.ZodString>;
        videoUrl: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "images";
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
    }, {
        type: "images";
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
    }>, "many">;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    count: number;
    contentItems: {
        type: "images";
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
    }[];
}, {
    success: boolean;
    count: number;
    contentItems: {
        type: "images";
        videoUrl: string | null;
        imageUrl: string | null;
        id: string;
    }[];
}>;
type ProjectUploadResponse = z.infer<typeof ProjectUploadResponseSchema>;

/** Anything the multipart uploader accepts as file content. */
type UploadableFile = Blob | File | Buffer | Uint8Array | ArrayBuffer | ReadableStream<Uint8Array> | string;
interface UploadMediaOptions {
    /** Filename sent in the multipart payload. */
    filename?: string;
    /** Overrides the MIME type sniffed from the filename. */
    contentType?: string;
}
/** Media upload endpoint (`POST /api/upload-media`). */
declare class MediaResource {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Uploads an image or video. The returned `mediaEntId` / `cdnUrl` are the
     * start-frame inputs for t2v generation.
     */
    upload(file: UploadableFile, options?: UploadMediaOptions): Promise<UploadMediaResponse>;
    /**
     * Associates uploaded media with a project (`POST /api/projects/:id/upload`).
     *
     * This is the second half of the upload flow: after `upload()` returns a
     * media reference, calling this attaches the file to the project so it
     * becomes a project content item (the `contentItems[].id` returned here is
     * the value to pass as the start frame's `contentItemId` for t2v).
     */
    attachToProject(projectId: string, files: ProjectUploadFile[]): Promise<ProjectUploadResponse>;
    /**
     * Uploads a file and attaches it to a project in one call.
     *
     * Returns both the raw upload result and the attached content items. The
     * first content item's `id` is the start-frame `contentItemId` to pass to
     * `videos.generateAndWait` / `videos.extendAndWait`.
     */
    uploadToProject(projectId: string, file: UploadableFile, options?: UploadMediaOptions): Promise<{
        upload: UploadMediaResponse;
        attach: ProjectUploadResponse;
    }>;
}

/** Project list / create endpoints (`/api/projects`). */
declare const ProjectSummarySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    thumbnailUrl: z.ZodNullable<z.ZodString>;
    exportStatus: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    isShared: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    thumbnailUrl: string | null;
    name: string;
    exportStatus: string;
    isShared: boolean;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    thumbnailUrl: string | null;
    name: string;
    exportStatus: string;
    isShared: boolean;
}>;
declare const ProjectPageSchema: z.ZodObject<{
    count: z.ZodNumber;
    hasMore: z.ZodBoolean;
    nextOffset: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    count: number;
    nextOffset: number | null;
    hasMore: boolean;
}, {
    count: number;
    nextOffset: number | null;
    hasMore: boolean;
}>;
declare const ProjectListResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    projects: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        thumbnailUrl: z.ZodNullable<z.ZodString>;
        exportStatus: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        isShared: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        thumbnailUrl: string | null;
        name: string;
        exportStatus: string;
        isShared: boolean;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        thumbnailUrl: string | null;
        name: string;
        exportStatus: string;
        isShared: boolean;
    }>, "many">;
    page: z.ZodObject<{
        count: z.ZodNumber;
        hasMore: z.ZodBoolean;
        nextOffset: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        count: number;
        nextOffset: number | null;
        hasMore: boolean;
    }, {
        count: number;
        nextOffset: number | null;
        hasMore: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    projects: {
        id: string;
        createdAt: string;
        updatedAt: string;
        thumbnailUrl: string | null;
        name: string;
        exportStatus: string;
        isShared: boolean;
    }[];
    page: {
        count: number;
        nextOffset: number | null;
        hasMore: boolean;
    };
}, {
    success: boolean;
    projects: {
        id: string;
        createdAt: string;
        updatedAt: string;
        thumbnailUrl: string | null;
        name: string;
        exportStatus: string;
        isShared: boolean;
    }[];
    page: {
        count: number;
        nextOffset: number | null;
        hasMore: boolean;
    };
}>;
declare const CompositionSchema: z.ZodObject<{
    id: z.ZodString;
    tracks: z.ZodArray<z.ZodUnknown, "many">;
    duration: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    tracks: unknown[];
    duration: number;
}, {
    id: string;
    tracks: unknown[];
    duration: number;
}>;
/** Full project as returned by `POST /api/projects`. */
declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    name: z.ZodString;
    composition: z.ZodObject<{
        id: z.ZodString;
        tracks: z.ZodArray<z.ZodUnknown, "many">;
        duration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        tracks: unknown[];
        duration: number;
    }, {
        id: string;
        tracks: unknown[];
        duration: number;
    }>;
    exportStatus: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    name: string;
    exportStatus: string;
    composition: {
        id: string;
        tracks: unknown[];
        duration: number;
    };
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    name: string;
    exportStatus: string;
    composition: {
        id: string;
        tracks: unknown[];
        duration: number;
    };
}>;
declare const ProjectCreateResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    project: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        name: z.ZodString;
        composition: z.ZodObject<{
            id: z.ZodString;
            tracks: z.ZodArray<z.ZodUnknown, "many">;
            duration: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            tracks: unknown[];
            duration: number;
        }, {
            id: string;
            tracks: unknown[];
            duration: number;
        }>;
        exportStatus: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        name: string;
        exportStatus: string;
        composition: {
            id: string;
            tracks: unknown[];
            duration: number;
        };
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        name: string;
        exportStatus: string;
        composition: {
            id: string;
            tracks: unknown[];
            duration: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    project: {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        name: string;
        exportStatus: string;
        composition: {
            id: string;
            tracks: unknown[];
            duration: number;
        };
    };
}, {
    success: boolean;
    project: {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        name: string;
        exportStatus: string;
        composition: {
            id: string;
            tracks: unknown[];
            duration: number;
        };
    };
}>;
/** Response from `DELETE /api/projects/:projectId?deleteAssets=true`. */
declare const ProjectDeleteResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    deletedOrphanCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
    deletedOrphanCount: number;
}, {
    message: string;
    success: boolean;
    deletedOrphanCount: number;
}>;
type ProjectSummary = z.infer<typeof ProjectSummarySchema>;
type ProjectPage = z.infer<typeof ProjectPageSchema>;
type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;
type Project = z.infer<typeof ProjectSchema>;
type ProjectCreateResponse = z.infer<typeof ProjectCreateResponseSchema>;
type ProjectDeleteResponse = z.infer<typeof ProjectDeleteResponseSchema>;

interface ListProjectsOptions {
    /** Max results per page. */
    limit?: number;
    /** Offset for pagination. */
    offset?: number;
    /** Sort order. */
    sort?: "newest" | "oldest";
}
interface DeleteProjectOptions {
    /** Also delete orphaned assets referenced by the project. Defaults to true. */
    deleteAssets?: boolean;
}
/** Project endpoints (`/api/projects`). */
declare class ProjectsResource {
    private readonly http;
    constructor(http: HttpClient);
    /** Lists the signed-in user's projects. */
    list(options?: ListProjectsOptions): Promise<ProjectListResponse>;
    /** Creates a new project. */
    create(name: string): Promise<ProjectCreateResponse>;
    /**
     * Deletes a project (`DELETE /api/projects/:projectId`).
     *
     * With `deleteAssets: true` the server also removes assets that are only
     * referenced by this project, so a test project can be cleaned up entirely.
     */
    delete(projectId: string, options?: DeleteProjectOptions): Promise<ProjectDeleteResponse>;
}

interface WaitOptions {
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
interface WaitForOptions<T> extends WaitOptions {
    /** Fetches the current state. */
    fetch: () => Promise<T>;
    /** Whether the state satisfies the target condition. */
    isDone: (state: T) => boolean;
}
/**
 * Polls `fetch` until `isDone` is satisfied, the timeout elapses, or the
 * signal aborts.
 */
declare function waitFor<T>(options: WaitForOptions<T>): Promise<T>;

/**
 * Shared primitives.
 *
 * Timestamps are intentionally left as plain strings: the API occasionally
 * returns non-ISO values (e.g. the pipe-separated `updatedAt` from
 * `/api/sync`), and strict datetime validation would only cause false drift
 * alarms on a fragile platform.
 */
/** RFC 4122 UUID, used for users, projects, batches and assets. */
declare const UuidSchema: z.ZodString;
/** Opaque media entity ids handed out by the platform (e.g. "1166369879902864"). */
declare const MediaEntIdSchema: z.ZodString;
/** Client-generated content item ids, e.g. "batch-...-content-0". */
declare const ContentItemIdSchema: z.ZodString;
/** The few aspect ratios the platform accepts. */
declare const AspectRatioSchema: z.ZodEnum<["16:9", "9:16", "1:1", "4:3", "3:4"]>;
declare const DimensionsSchema: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    width: number;
    height: number;
}, {
    width: number;
    height: number;
}>;
/** Uploaded media references the API uses in place of URLs. */
declare const MediaReferenceSchema: z.ZodObject<{
    mediaEntId: z.ZodString;
    imageEntId: z.ZodNullable<z.ZodString>;
    videoUrl: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mediaEntId: string;
    imageEntId: string | null;
    videoUrl: string | null;
    imageUrl: string | null;
}, {
    mediaEntId: string;
    imageEntId: string | null;
    videoUrl: string | null;
    imageUrl: string | null;
}>;
type Uuid = z.infer<typeof UuidSchema>;
type MediaEntId = z.infer<typeof MediaEntIdSchema>;
type ContentItemId = z.infer<typeof ContentItemIdSchema>;
type AspectRatio = z.infer<typeof AspectRatioSchema>;
type Dimensions = z.infer<typeof DimensionsSchema>;
type MediaReference = z.infer<typeof MediaReferenceSchema>;

/** A media reference usable as a start frame (an uploaded image). */
interface StartFrame {
    /** URL of the image (e.g. `cdnUrl` from an upload). */
    imageUrl: string;
    /** Media entity id of the image (e.g. `mediaEntId` from an upload). */
    imageEntId: string;
    /** Content item id of the image in the project, when known. */
    contentItemId?: string;
    /** Pixel dimensions of the image; used to derive the aspect ratio. */
    dimensions?: Dimensions;
}
/** An optional end-frame for t2v generation. */
interface EndFrame {
    imageUrl: string;
    imageEntId: string;
    contentItemId?: string;
}
/** A video that can be extended. */
interface VideoSource {
    mediaEntId: string;
    videoUrl: string;
    /** Content item id of the video in the project, when known. */
    contentItemId?: string;
    /** Dimensions of the video; used to build `config.metadata`. */
    metadata?: {
        dimensions: Dimensions;
        aspectRatio: AspectRatio;
    };
}
/** Options for a text-to-video generation. */
interface T2VGenerateOptions {
    projectId: string;
    /** The prompt describing the scene to animate. */
    prompt: string;
    /**
     * The start-frame image the video is generated from. Omit to run a
     * prompt-only (no reference frame) generation.
     */
    startFrame?: StartFrame;
    /** Optional end-frame image. */
    endFrame?: EndFrame;
    /**
     * Aspect ratio override.
     *
     * When a start frame is provided the platform keys the output to the
     * frame's dimensions, so this defaults to the ratio of the start frame
     * image (pass `dimensions` on the frame to have it derived). For
     * prompt-only generations there is no frame to derive from, so this
     * defaults to `9:16` (the platform default) and the config value is
     * respected.
     */
    aspectRatio?: AspectRatio;
    /** Model that animates the video. */
    videoModel?: string;
    /** Model used for prompt images. */
    imageModel?: string;
    /** Model that refines the prompt. */
    promptModel?: string;
    /** Output resolution. */
    resolution?: string;
    /** Generate style variants of the prompt. */
    batchVariation?: boolean;
    /** How many variants to generate (each is a separate input). */
    variations?: number;
}
/** Options for a video-extend generation. */
interface ExtendGenerateOptions {
    projectId: string;
    /** The prompt governing the extension. */
    prompt: string;
    /** The video to extend. */
    source: VideoSource;
    /** Direction for how the video should be extended. */
    extendDirective?: string;
    /** Audio track carried into the extension; defaults to the source URL. */
    audioSourceUrl?: string;
    videoModel?: string;
    imageModel?: string;
}
interface GenerateAndWaitResult {
    /** The batch as reported by the server once complete. */
    batch: GenerationBatch;
    /** Completed video content items of the batch. */
    videos: BatchContentItem[];
}
interface ExtendAndWaitResult {
    /** The completed video asset, as reported by the assets endpoint. */
    video: Asset;
}
interface ExtendToDurationOptions extends ExtendGenerateOptions {
    /** Target total duration in seconds (e.g. 30 for a 30s video). */
    targetSeconds: number;
    /** Duration of the source video in seconds; defaults to 5s (fresh generation). */
    sourceDurationSeconds?: number;
    poll?: WaitOptions;
    /** Called after each extension completes. */
    onExtend?: (info: {
        video: Asset;
        totalDurationSeconds: number;
        extensions: number;
    }) => void;
}
/**
 * Video generation endpoints and high-level orchestration
 * (`POST /api/generate/videos` + batch registration + polling).
 */
declare class VideosResource {
    private readonly http;
    private readonly batches;
    private readonly assets;
    constructor(http: HttpClient, batches: BatchesResource, assets: AssetsResource);
    /**
     * Submits a text-to-video generation from a start frame and registers the
     * batch for tracking. Does not wait for completion — use `generateAndWait`.
     *
     * The skeleton is registered *before* `POST /generate/videos` (matching the
     * browser flow): a generation submitted for an unregistered batch is
     * materialized as a detached epoch-suffixed media item, leaving an
     * unresolved "pending" strip on the project timeline. Registering first
     * makes the server place the output directly on the registered content
     * slots.
     */
    generateT2V(options: T2VGenerateOptions): Promise<GenerateVideosResponse>;
    /**
     * Submits a video extension and registers the batch for tracking.
     * Does not wait for completion — use `extendAndWait`.
     */
    generateExtend(options: ExtendGenerateOptions): Promise<GenerateVideosResponse>;
    /**
     * Generates videos from a start frame and polls until the batch completes.
     * Returns the completed batch and its finished video content items.
     */
    generateAndWait(options: T2VGenerateOptions, poll?: WaitOptions): Promise<GenerateAndWaitResult>;
    /**
     * Extends a video and polls until the new asset is ready.
     */
    extendAndWait(options: ExtendGenerateOptions, poll?: WaitOptions): Promise<ExtendAndWaitResult>;
    /**
     * Repeatedly extends a video until it reaches `targetSeconds`.
     *
     * Fresh generations are 5s; every extend adds 4s. Returns the final video
     * asset and the resulting total duration.
     */
    extendToDuration(options: ExtendToDurationOptions): Promise<{
        video: Asset;
        totalDurationSeconds: number;
        extensions: number;
    }>;
    /** Polls the generation-batches endpoint until the batch completes. */
    waitForBatch(batchId: string, poll?: WaitOptions): Promise<GenerateAndWaitResult>;
    /** Stream variant of `waitForBatch`: consumes SSE until the stream closes. */
    private waitForBatchStream;
    /**
     * Waits for the batch to finish, finalizes it (PUT), then resolves the
     * resulting video asset from the project's asset list.
     */
    waitForExtendAsset(projectId: string, batchId: string, poll?: WaitOptions): Promise<ExtendAndWaitResult>;
    private buildT2VRequest;
    private buildExtendRequest;
    private registerBatch;
}

type VibesClientOptions = HttpClientOptions;
/**
 * Typed client for the unofficial vibes.ai API.
 *
 * Authentication is cookie-based. The easiest source is the browser itself —
 * `browserSession()` reads the `meta_session` cookie straight from your
 * browser's cookie database (read-only; the browser can stay open) and keeps
 * it fresh:
 *
 * @example
 * ```ts
 * const client = new VibesClient({
 *   session: browserSession(),
 * });
 * ```
 *
 * Alternatively pass the browser session cookie string
 * (e.g. `meta_session=...; cookie_ack=true`) via `session`. The value can be
 * a function (sync or async) so the session can rotate without recreating the
 * client.
 *
 * @example
 * ```ts
 * const client = new VibesClient({
 *   session: () => readSessionFromFile(),
 * });
 *
 * const { user } = await client.auth.me();
 * const { project } = await client.projects.create("My movie");
 * ```
 */
declare class VibesClient {
    readonly http: HttpClient;
    readonly auth: AuthResource;
    readonly projects: ProjectsResource;
    readonly media: MediaResource;
    readonly assets: AssetsResource;
    readonly batches: BatchesResource;
    readonly videos: VideosResource;
    readonly contentItems: ContentItemsResource;
    constructor(options?: VibesClientOptions);
}

/** Browsers sweet-cookie knows + Chromium forks read through the chrome backend. */
type BrowserKind = BrowserName | "helium" | "chromium" | "brave";
interface BrowserSessionConfig {
    /** Browser name for explicit single-source mode; auto-detect when unset. */
    browser?: BrowserKind;
    /** Chrome-profile dir with Default/Cookies (overrides browser). */
    profileDir?: string;
    /** Static session cookie checked before any browser sync (default: $VIBES_SESSION_COOKIE). */
    sessionFromEnv?: string;
    /** Log resolution steps to stderr. */
    verbose?: boolean;
    /** Cookie names to collect (default: meta_session + cookie_ack). */
    cookieNames?: readonly string[];
    /** Origin used for cookie filtering. Defaults to https://vibes.ai/. */
    url?: string;
    /** Minimum interval between two syncs (default 5000ms). */
    throttleMs?: number;
    /** Injectable cookie reader (used by tests). */
    readCookies?: (opts: {
        url: string;
        names: readonly string[];
        browsers: BrowserName[];
        chromeProfile?: string;
        timeoutMs: number;
    }) => Promise<{
        cookies: Cookie[];
        warnings: string[];
    }>;
}
/**
 * Read the vibes.ai session cookie header straight from a browser's cookie
 * database. Returns e.g. `meta_session=...; cookie_ack=true`.
 *
 * Throws `VibesAuthError` when no browser holds a `meta_session` cookie for
 * vibes.ai — sign in to vibes.ai in your browser and retry.
 */
declare function syncSessionFromBrowser(cfg?: BrowserSessionConfig): Promise<string>;
/**
 * Session provider that resolves the vibes.ai session cookie in order:
 *
 *   1. `sessionFromEnv` / `$VIBES_SESSION_COOKIE` — static cookie for
 *      servers and headless deployments; never re-read from the browser.
 *   2. The browser chain (helium -> chrome -> chromium -> brave -> edge ->
 *      firefox -> safari), refreshed from disk at most every `throttleMs`
 *      (default 5s), so a rotated `meta_session` is picked up without
 *      recreating the client.
 *
 * The same provider works on the server (env cookie) and locally (browser
 * cookie).
 *
 * @example
 * ```ts
 * const client = new VibesClient({ session: browserSession() });
 * ```
 */
declare function browserSession(cfg?: BrowserSessionConfig): () => Promise<string | undefined>;

/** Error hierarchy for the vibes-ai client. */
/** Base class for every error thrown by this library. */
declare class VibesError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
/**
 * Thrown when the session cookie cannot be obtained from the configured source
 * (manual string, cookie file, or browser sync).
 */
declare class VibesAuthError extends VibesError {
    constructor(message: string, options?: ErrorOptions);
}
/** Thrown when the API responds with a non-2xx status. */
declare class VibesHttpError extends VibesError {
    readonly method: string;
    readonly url: string;
    readonly status: number;
    readonly statusText: string;
    /** Raw response body, when it could be parsed as JSON. */
    readonly body: unknown;
    constructor(method: string, url: string, status: number, statusText: string, body: unknown);
}
/**
 * Thrown when a response does not match the expected schema.
 *
 * The platform API is unversioned and changes shape silently — this error is
 * the first line of defense. It carries the validation issues and a snapshot
 * of the offending payload so drift can be diagnosed quickly.
 */
declare class VibesValidationError extends VibesError {
    readonly issues: string[];
    readonly payload: unknown;
    constructor(issues: string[], payload: unknown);
}
/** Thrown when the body of a request cannot be serialized/parsed as JSON. */
declare class VibesParseError extends VibesError {
    readonly raw: unknown;
    constructor(message: string, raw: unknown);
}
/** Thrown when a `waitFor*` polling operation times out. */
declare class VibesPollTimeoutError extends VibesError {
    readonly batchId: string | undefined;
    readonly elapsedMs: number;
    readonly lastState: unknown;
    constructor(elapsedMs: number, lastState: unknown, batchId?: string);
}

/**
 * Observed constants of the vibes.ai platform.
 *
 * These are derived from request traces captured from the production web app
 * (see `requests/`). Because the platform is an unofficial, unversioned API,
 * they may drift — tests in `test/schema` and `test/live` guard against that.
 */
declare const API_BASE_URL = "https://vibes.ai";
/** Endpoints served under this base path. */
declare const API_PREFIX = "/api";
/**
 * Duration of a freshly generated (non-extended) video, in seconds.
 *
 * Observed in generated asset URLs (`duration_s` field of the CDN signature)
 * and confirmed manually: plain t2v generations are 5 seconds long.
 */
declare const GENERATED_VIDEO_DURATION_S = 5;
/**
 * How many seconds a single extend operation appends to a video.
 *
 * Observed in extend requests/responses: each extend adds 4 seconds to the
 * source video.
 */
declare const EXTEND_VIDEO_DURATION_INCREMENT_S = 4;
/** Video models seen on the platform. */
declare const VIDEO_MODEL: {
    readonly SHORT: "midjen-short";
    readonly EXTEND: "midjen-extend";
};
/** Image model used for direct-generation prompts. */
declare const IMAGE_MODEL = "midjen-base";
/** Prompt enhancement model. */
declare const PROMPT_MODEL = "gemini-2.5-flash";
/** Supported output resolutions. */
declare const RESOLUTION: "720p";
/**
 * Number of video variants produced when `batchVariation` is enabled.
 * Observed: the web app submits 4 identical inputs per batch.
 */
declare const DEFAULT_VARIATION_COUNT = 4;
/** Source roles used in `sourceContentItemIds`. */
declare const SOURCE_ROLE: {
    readonly START_FRAME: "start_frame";
    readonly END_FRAME: "end_frame";
    readonly EXTEND_VIDEO: "extend_video";
};
/** Aspect ratios supported by the platform. */
declare const ASPECT_RATIO: {
    readonly "16:9": "16:9";
    readonly "9:16": "9:16";
    readonly "1:1": "1:1";
};
/** Generation types understood by `/api/generate/*`. */
declare const GENERATION_TYPE: {
    readonly T2V: "t2v";
    readonly T2I: "t2i";
    readonly EXTEND: "extend";
};
/** Polling defaults for `waitFor` helpers. */
declare const POLL_DEFAULTS: {
    readonly intervalMs: 3000;
    readonly timeoutMs: number;
    readonly jitterMs: 500;
};
/** Retry defaults for the HTTP layer. */
declare const RETRY_DEFAULTS: {
    readonly maxRetries: 3;
    readonly baseDelayMs: 500;
    readonly maxDelayMs: 8000;
    /** Which status codes trigger a retry. */
    readonly retryStatuses: readonly [408, 429, 500, 502, 503, 504];
};

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
/**
 * Generates a UUID v7 (time-ordered, 128 bits).
 *
 * Format: `tttttttt-tttt-vvvv-ssss-aaaaaaaaaaaa` where the first 48 bits are
 * the Unix epoch in milliseconds, allowing sortable ids.
 */
declare function uuidv7(): string;
/** Generates a t2v generation batch id: `batch-<uuidv7>`. */
declare function batchId(): string;
/** Generates an extend batch id: `extend-<epochMs>-<8 hex chars>`. */
declare function extendBatchId(now?: Date): string;
/** Generates the request id sent as `mg_request_id`: `www-<uuidv7>`. */
declare function mgRequestId(): string;
/** Content item id for a batch slot: `<batchId>-content-<index>`. */
declare function contentItemId(batchId: string, index: number): string;

/**
 * Aspect-ratio helpers.
 *
 * Key platform behaviour discovered from traces: the video model follows the
 * **dimensions of the start-frame image** (and extend follows the source
 * video's dimensions), not the `aspectRatio` config field. The config field
 * is treated as a hint. This is why a 16:9 start frame produces a 16:9 video
 * even when the config says `9:16`.
 */

/**
 * Maps pixel dimensions to the closest known aspect ratio string.
 *
 * Returns the ratio whose width/height fraction is closest to the input,
 * falling back to `9:16` (the platform default) when nothing matches.
 */
declare function dimensionsToAspectRatio(dimensions: Dimensions): AspectRatio;
/**
 * Derives the aspect ratio that should be sent to the API for a generation.
 *
 * The start-frame image dictates the output ratio, so this prefers the
 * provided dimensions and only falls back to the caller-supplied ratio (or
 * the platform default) when dimensions are unknown.
 */
declare function resolveAspectRatio(dimensions: Dimensions | undefined, requested: AspectRatio | undefined): AspectRatio;

export { API_BASE_URL, API_PREFIX, ASPECT_RATIO, type AspectRatio, AspectRatioSchema, type Asset, AssetSchema, AssetsResource, type AssetsResponse, AssetsResponseSchema, AuthResource, type BatchContentItem, BatchContentItemSchema, type BatchCreateResponse, BatchCreateResponseSchema, type BatchGetResponse, BatchGetResponseSchema, type BatchListResponse, BatchListResponseSchema, type BatchSkeleton, BatchSkeletonSchema, type BatchStreamEvent, BatchStreamEventSchema, type BatchStreamItem, BatchStreamItemSchema, type BatchUpdatePayload, BatchUpdatePayloadSchema, type BatchUpdateResponse, BatchUpdateResponseSchema, BatchesResource, type BrowserSessionConfig, type BulkDeletePayload, BulkDeletePayloadSchema, type BulkDeleteResponse, BulkDeleteResponseSchema, CompositionSchema, type ContentItemId, ContentItemIdSchema, ContentItemsResource, DEFAULT_RETRY_OPTIONS, DEFAULT_VARIATION_COUNT, type DeleteProjectOptions, type Dimensions, DimensionsSchema, type DirectPromptImageHandle, DirectPromptImageHandleSchema, EXTEND_VIDEO_DURATION_INCREMENT_S, type EndFrame, type ExtendAndWaitResult, type ExtendGenerateInput, ExtendGenerateInputSchema, type ExtendGenerateOptions, type ExtendGenerateRequest, ExtendGenerateRequestSchema, type ExtendToDurationOptions, GENERATED_VIDEO_DURATION_S, GENERATION_TYPE, type GenerateAndWaitResult, type GenerateVideosResponse, GenerateVideosResponseSchema, type GenerationBatch, GenerationBatchSchema, type GenerationConfig, GenerationConfigSchema, HttpClient, type HttpClientOptions, IMAGE_MODEL, type ListBatchesOptions, type ListProjectAssetsOptions, type ListProjectsOptions, type MeResponse, MeResponseSchema, type MediaEntId, MediaEntIdSchema, type MediaReference, MediaReferenceSchema, MediaResource, POLL_DEFAULTS, PROMPT_MODEL, type Project, type ProjectAssetItem, ProjectAssetItemSchema, type ProjectAssetsResponse, ProjectAssetsResponseSchema, type ProjectCreateResponse, ProjectCreateResponseSchema, type ProjectDeleteResponse, ProjectDeleteResponseSchema, type ProjectListResponse, ProjectListResponseSchema, type ProjectPage, ProjectPageSchema, ProjectSchema, type ProjectSummary, ProjectSummarySchema, type ProjectUploadFile, ProjectUploadFileSchema, type ProjectUploadRequest, ProjectUploadRequestSchema, type ProjectUploadResponse, ProjectUploadResponseSchema, type ProjectUploadedContentItem, ProjectUploadedContentItemSchema, ProjectsResource, RESOLUTION, RETRY_DEFAULTS, type RequestOptions, type RetryOptions, SOURCE_ROLE, type SessionProvider, type SourceContentItemId, SourceContentItemIdSchema, type StartFrame, type StructuredOutput, StructuredOutputSchema, type SyncResponse, SyncResponseSchema, T2VBaseConfigSchema, T2VFrameConfigSchema, type T2VGenerateInput, T2VGenerateInputSchema, type T2VGenerateOptions, type T2VGenerateRequest, T2VGenerateRequestSchema, type UploadMediaOptions, type UploadMediaResponse, UploadMediaResponseSchema, type UploadableFile, type User, UserSchema, type Uuid, UuidSchema, VIDEO_MODEL, VibesAuthError, VibesClient, type VibesClientOptions, VibesError, VibesHttpError, VibesParseError, VibesPollTimeoutError, VibesValidationError, type VideoSource, VideosResource, type WaitForOptions, type WaitOptions, batchId, browserSession, contentItemId, dimensionsToAspectRatio, extendBatchId, mgRequestId, parseFirstJsonObject, resolveAspectRatio, syncSessionFromBrowser, uuidv7, waitFor, withRetry };
