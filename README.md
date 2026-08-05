# vibes-ai

Unofficial, typed Node.js client for the [vibes.ai](https://vibes.ai) AI video
generation API. Supports text-to-video (with optional start/end frames or
prompt-only), video extend, project/media management, and SSE streaming for
batch completion.

> **Not affiliated with vibes.ai.** The platform exposes no public API, so this
> client is built from request traces captured from the production web app
> (`requests/`) and is guarded by contract tests (`test/schema`,
> `test/integration`). Wire formats may drift — file a bug with a fresh trace
> if something breaks.

## Install

```bash
npm install vibes-ai                          # when published to the registry
npm install git+https://github.com/akashdeep000/vibes-ai-unofficial-api.git
```

The git install ships a pre-built `dist/` in the repository, so it works even on
npm setups that restrict dependency install scripts. Requires Node >= 18.17.

## Authentication

The API is authenticated with your browser session cookie. Log in to
vibes.ai, open DevTools → Network → any request, and copy the `cookie` header
value (it contains `meta_session=...; cookie_ack=true`). Pass it to the client
— either as a static string or a function that reads a fresh session
(rotating sessions without recreating the client).

```ts
import { VibesClient } from "vibes-ai";

const client = new VibesClient({
  session: () => readSessionFromEnv(), // or: "meta_session=...; cookie_ack=true"
});
```

## Quick start

```ts
import { VibesClient } from "vibes-ai";
import { readFileSync } from "node:fs";

const client = new VibesClient({ session: process.env.VIBES_SESSION_COOKIE });

// 1. Who am I + a project to work in.
const { user } = await client.auth.me();
const { project } = await client.projects.create("My first video");

// 2. Upload a start frame and attach it to the project timeline.
const { upload, attach } = await client.media.uploadToProject(
  project.id,
  new Uint8Array(readFileSync("start.png")),
  { filename: "start.png" },
);

// 3. Generate a video from the frame and wait for it (SSE streaming).
const { batch, videos } = await client.videos.generateAndWait(
  {
    projectId: project.id,
    prompt: "cinematic aerial view of a misty valley at golden hour",
    startFrame: {
      imageUrl: upload.cdnUrl,
      imageEntId: upload.mediaEntId,
      dimensions: upload.dimensions,
      contentItemId: attach.contentItems[0].id,
    },
    variations: 1,
  },
  { stream: true, timeoutMs: 15 * 60_000 },
);

console.log(videos[0].videoUrl); // -> https://scontent-...mp4
```

### Prompt-only (no reference frame)

Omit `startFrame` (and optionally pass an `endFrame`):

```ts
const { videos } = await client.videos.generateAndWait({
  projectId: project.id,
  prompt: "silver waves rippling across a dark ocean at night",
  aspectRatio: "16:9", // default when no frame: 9:16
  variations: 1,
});
```

### Extend a video to a target duration

Each extend appends **4 seconds** (a fresh generation is 5s). `extendToDuration`
loops `extendAndWait` until the target is reached:

```ts
const { video, totalDurationSeconds, extensions } = await client.videos.extendToDuration({
  projectId: project.id,
  prompt: "continue the dolly push-in, gentle motion",
  targetSeconds: 30,
  source: {
    mediaEntId: videos[0].mediaEntId,
    videoUrl: videos[0].videoUrl,
    contentItemId: videos[0].contentItemId,
  },
  onExtend: ({ totalDurationSeconds }) => console.log("now", totalDurationSeconds, "s"),
});
```

## Key platform behaviors (learned from traces)

- **Register before generating.** Every generation first registers a
  skeleton batch (`POST /api/generation-batches`) and only then submits the
  generation (`POST /api/generate/videos`). A generation submitted for an
  unregistered batch is materialized as a _detached_ media item with an
  epoch-suffixed id, leaving a "pending" strip on the project timeline. The
  client always registers first.
- **Aspect ratio keying.** The video model follows the **start-frame
  dimensions**, not the `aspectRatio` config value. Prompt-only generations
  (no frame) respect the requested ratio. Verified live: a 16:9 start frame
  with a mismatched 9:16 end frame still yields 16:9 output.
- **Durations.** t2v = 5s; each extend = +4s.
- **SSE stream.** `GET /api/generation-batches/:id/stream` emits `data:` JSON
  events until completion. `waitForBatch` / `waitForExtendAsset` use it when
  `poll.stream` is true, falling back to polling otherwise.
- **Cleanup.** Generated assets accumulate in your account; delete projects
  with `client.projects.delete(id, { deleteAssets: true })` when done.

## API surface

| Resource              | Methods                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `client.auth`         | `me()`, `checkToken()` — session checks                                                                                       |
| `client.projects`     | `list`, `create`, `delete` (with `deleteAssets`)                                                                              |
| `client.media`        | `upload`, `attachToProject`, `uploadToProject` (upload + attach)                                                              |
| `client.assets`       | `list`, `listByProjectId`, `sync` — resolved timeline assets                                                                  |
| `client.batches`      | `list`, `get`, `stream`, `create` (skeleton), `update` (finalize)                                                             |
| `client.videos`       | `generateT2V`, `generateAndWait`, `generateExtend`, `extendAndWait`, `extendToDuration`, `waitForBatch`, `waitForExtendAsset` |
| `client.contentItems` | `bulkDelete`                                                                                                                  |

Errors are typed: `VibesHttpError` (non-2xx), `VibesValidationError`
(schema drift), `VibesPollTimeoutError` (wait deadline). Zod request/response
schemas are exported from `vibes-ai` for your own parsing.

## Waiting and streaming

`waitFor(fetch, isDone, options)` polls with optional jitter and a hard
deadline. `WaitOptions`: `intervalMs` (default 3000), `timeoutMs` (default
15 min), `jitterMs`, `signal` (AbortSignal), `onPoll`, `stream` (SSE).

```ts
await client.videos.generateAndWait(
  { projectId, prompt, startFrame, variations: 1 },
  {
    stream: true, // SSE instead of polling
    timeoutMs: 15 * 60_000,
    onPoll: (state) => console.log(state), // stream events or poll states
  },
);
```

## Development

```bash
npm run verify          # typecheck + lint + format + tests
npm run test:live       # live tests against the real API (VIBES_RUN_LIVE=1)
npm run extract:fixtures # regenerate test/fixtures from requests/*.md traces
npm run build           # tsup: ESM + CJS + .d.ts into dist/
```

- `test/schema` — every captured trace in `test/fixtures/` must parse against
  the matching schema (drift detection).
- `test/integration` — full mock-based flows (register → generate → stream →
  finalize PUT) pinning the exact wire format.
- `test/live` — real API smoke tests, skipped unless `VIBES_RUN_LIVE=1`.
- `requests/` — raw "copy as fetch" browser traces that fixtures are
  extracted from; add a trace when you discover a new endpoint shape.
- `*.mts` root scripts (`step1.mts`, `debug-*.mts`) — one-shot live harnesses
  used during development.
