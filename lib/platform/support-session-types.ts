import type { PlatformSupportSessionMode, PlatformSupportSessionStatus } from "@prisma/client";

export type { PlatformSupportSessionMode, PlatformSupportSessionStatus };

export type SupportSessionCookieName = "kos_support_session";

export const SUPPORT_SESSION_COOKIE = "kos_support_session" as const;

export const SUPPORT_SESSION_MAX_HOURS = 8;
