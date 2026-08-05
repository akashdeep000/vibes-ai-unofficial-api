import { z } from "zod";
import { UuidSchema } from "./common.js";

/**
 * Account / session endpoints (`/api/auth/me`, `/api/auth/check-token`).
 *
 * Both endpoints return the same shape: `{ user: User }`.
 */

export const UserSchema = z.object({
  id: UuidSchema,
  username: z.string(),
  accountStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"]).catch("ACTIVE"),
  roles: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  abraUserId: z.string(),
  sessionId: UuidSchema.nullable(),
  kadabraProfile: z
    .object({
      id: UuidSchema,
      userId: UuidSchema,
      kadabraUserId: z.string(),
      incognitoAccess: z.enum(["NONE", "ALLOWED"]).catch("NONE"),
      kadabraProfileId: z.string(),
      kadabraProfileUsername: z.string().nullable(),
      kadabraProfilePictureURL: z.string().url().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      syncedAt: z.string().nullable(),
      dataSyncedAt: z.string().nullable(),
    })
    .nullable(),
});

export const MeResponseSchema = z.object({
  user: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
