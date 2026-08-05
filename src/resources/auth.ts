import { type HttpClient } from "../http/http-client.js";
import { MeResponseSchema, type MeResponse } from "../schemas/auth.js";

/** Auth endpoints: session validity and the current user. */
export class AuthResource {
  constructor(private readonly http: HttpClient) {}

  /** Returns the signed-in user (`GET /api/auth/me`). */
  async me(): Promise<MeResponse> {
    return this.http.request<MeResponse>({
      method: "GET",
      path: "/auth/me",
      schema: MeResponseSchema,
    });
  }

  /** Validates the session token (`GET /api/auth/check-token`). */
  async checkToken(): Promise<MeResponse> {
    return this.http.request<MeResponse>({
      method: "GET",
      path: "/auth/check-token",
      schema: MeResponseSchema,
    });
  }
}
