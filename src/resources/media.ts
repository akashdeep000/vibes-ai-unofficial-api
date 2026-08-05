import { type HttpClient } from "../http/http-client.js";
import {
  ProjectUploadRequestSchema,
  ProjectUploadResponseSchema,
  UploadMediaResponseSchema,
  type ProjectUploadFile,
  type ProjectUploadResponse,
  type UploadMediaResponse,
} from "../schemas/media.js";

/** Anything the multipart uploader accepts as file content. */
export type UploadableFile =
  Blob | File | Buffer | Uint8Array | ArrayBuffer | ReadableStream<Uint8Array> | string;

export interface UploadMediaOptions {
  /** Filename sent in the multipart payload. */
  filename?: string;
  /** Overrides the MIME type sniffed from the filename. */
  contentType?: string;
}

function toBlob(file: UploadableFile, contentType: string | undefined): Blob {
  const props = contentType !== undefined ? { type: contentType } : {};
  if (file instanceof Blob) {
    return contentType ? new Blob([file], props) : file;
  }
  if (file instanceof ArrayBuffer || ArrayBuffer.isView(file)) {
    return new Blob([file as BlobPart], props);
  }
  if (file instanceof ReadableStream) {
    throw new TypeError(
      "ReadableStream uploads are not supported; pass a Blob, Buffer or Uint8Array",
    );
  }
  return new Blob([file], props);
}

function defaultContentType(filename: string | undefined): string | undefined {
  if (!filename) return undefined;
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    default:
      return undefined;
  }
}

/** Media upload endpoint (`POST /api/upload-media`). */
export class MediaResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Uploads an image or video. The returned `mediaEntId` / `cdnUrl` are the
   * start-frame inputs for t2v generation.
   */
  async upload(
    file: UploadableFile,
    options: UploadMediaOptions = {},
  ): Promise<UploadMediaResponse> {
    const contentType = options.contentType ?? defaultContentType(options.filename);
    const form = new FormData();
    form.append("file", toBlob(file, contentType), options.filename);

    return this.http.request<UploadMediaResponse>({
      method: "POST",
      path: "/upload-media",
      formData: form,
      schema: UploadMediaResponseSchema,
      // Uploads are larger and slower; give them a generous default.
      requestTimeoutMs: 5 * 60_000,
    });
  }

  /**
   * Associates uploaded media with a project (`POST /api/projects/:id/upload`).
   *
   * This is the second half of the upload flow: after `upload()` returns a
   * media reference, calling this attaches the file to the project so it
   * becomes a project content item (the `contentItems[].id` returned here is
   * the value to pass as the start frame's `contentItemId` for t2v).
   */
  async attachToProject(
    projectId: string,
    files: ProjectUploadFile[],
  ): Promise<ProjectUploadResponse> {
    const body = ProjectUploadRequestSchema.parse({ files });
    return this.http.request<ProjectUploadResponse>({
      method: "POST",
      path: `/projects/${projectId}/upload`,
      json: body,
      schema: ProjectUploadResponseSchema,
    });
  }

  /**
   * Uploads a file and attaches it to a project in one call.
   *
   * Returns both the raw upload result and the attached content items. The
   * first content item's `id` is the start-frame `contentItemId` to pass to
   * `videos.generateAndWait` / `videos.extendAndWait`.
   */
  async uploadToProject(
    projectId: string,
    file: UploadableFile,
    options: UploadMediaOptions = {},
  ): Promise<{ upload: UploadMediaResponse; attach: ProjectUploadResponse }> {
    const upload = await this.upload(file, options);
    const attach = await this.attachToProject(projectId, [
      {
        mediaEntId: upload.mediaEntId,
        uploadToken: upload.uploadToken,
        cdnUrl: upload.cdnUrl,
        filename: options.filename ?? `upload-${Date.now()}.png`,
        dimensions: upload.dimensions,
        aspectRatio: upload.aspectRatio,
      },
    ]);
    return { upload, attach };
  }
}
