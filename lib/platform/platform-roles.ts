import type { PlatformRole } from "@prisma/client";

/**
 * Canonical Prisma `PlatformRole` values — internal staff only (separate from workspace `UserRole`).
 * `workspace.moroz@gmail.com` is bootstrapped to `SUPER_ADMIN` and always treated as founder.
 */
export const PLATFORM_ROLE_VALUES = [
  "SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "SUPPORT_ADMIN",
  "IMPLEMENTATION_ADMIN",
  "GROWTH_ADMIN",
  "PARTNER_ADMIN",
  "STANDARD_USER",
] as const satisfies readonly PlatformRole[];

/** Product vocabulary → maps to existing Prisma enum (no duplicate DB enums). */
export type PlatformRoleKind =
  | "PLATFORM_FOUNDER"
  | "PLATFORM_SUPERADMIN"
  | "PLATFORM_ADMIN"
  | "PLATFORM_SUPPORT_ADMIN"
  | "PLATFORM_SUPPORT_AGENT"
  | "PLATFORM_IMPLEMENTATION_MANAGER"
  | "PLATFORM_BILLING_ADMIN"
  | "PLATFORM_GROWTH_ADMIN"
  | "PLATFORM_DEVELOPER_ADMIN"
  | "PLATFORM_READONLY_AUDITOR";

export function prismaRolesForKind(kind: PlatformRoleKind): PlatformRole[] {
  switch (kind) {
    case "PLATFORM_FOUNDER":
    case "PLATFORM_SUPERADMIN":
      return ["SUPER_ADMIN"];
    case "PLATFORM_ADMIN":
      return ["PLATFORM_ADMIN"];
    case "PLATFORM_SUPPORT_ADMIN":
    case "PLATFORM_SUPPORT_AGENT":
      return ["SUPPORT_ADMIN"];
    case "PLATFORM_IMPLEMENTATION_MANAGER":
      return ["IMPLEMENTATION_ADMIN"];
    case "PLATFORM_BILLING_ADMIN":
      return ["PLATFORM_ADMIN", "SUPER_ADMIN"];
    case "PLATFORM_GROWTH_ADMIN":
      return ["GROWTH_ADMIN"];
    case "PLATFORM_DEVELOPER_ADMIN":
      return ["PLATFORM_ADMIN", "SUPER_ADMIN"];
    case "PLATFORM_READONLY_AUDITOR":
      return ["STANDARD_USER"];
    default:
      return [];
  }
}
