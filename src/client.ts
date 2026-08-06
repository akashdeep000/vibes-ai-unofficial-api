import { HttpClient, type HttpClientOptions } from "./http/http-client.js";
import { AssetsResource } from "./resources/assets.js";
import { AuthResource } from "./resources/auth.js";
import { BatchesResource } from "./resources/batches.js";
import { ContentItemsResource } from "./resources/content-items.js";
import { MediaResource } from "./resources/media.js";
import { ProjectsResource } from "./resources/projects.js";
import { VideosResource } from "./resources/videos.js";

export type VibesClientOptions = HttpClientOptions;

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
export class VibesClient {
  readonly http: HttpClient;
  readonly auth: AuthResource;
  readonly projects: ProjectsResource;
  readonly media: MediaResource;
  readonly assets: AssetsResource;
  readonly batches: BatchesResource;
  readonly videos: VideosResource;
  readonly contentItems: ContentItemsResource;

  constructor(options: VibesClientOptions = {}) {
    this.http = new HttpClient(options);
    this.auth = new AuthResource(this.http);
    this.projects = new ProjectsResource(this.http);
    this.media = new MediaResource(this.http);
    this.assets = new AssetsResource(this.http);
    this.batches = new BatchesResource(this.http);
    this.videos = new VideosResource(this.http, this.batches, this.assets);
    this.contentItems = new ContentItemsResource(this.http);
  }
}
