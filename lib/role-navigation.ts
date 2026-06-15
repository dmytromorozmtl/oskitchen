import type { UserRole } from "@prisma/client";

/**
 * Workspace `UserRole` is currently OWNER | STAFF in Prisma.
 * Target model (future): Chef → production/kitchen; Packer → packing/verify; Driver → routes;
 * Accountant → reports/billing; Viewer → read-only dashboard — map via `OrganizationMemberRole`
 * when multi-user workspaces ship.
 *
 * Prefer `resolvePostAuthPathForSessionUser` for sign-in — it applies Era 18 persona landing.
 */
export function defaultPostAuthPath(role: UserRole, onboardingCompleted: boolean): string {
  if (!onboardingCompleted) return "/onboarding";
  if (role === "STAFF") return "/dashboard";
  return "/dashboard/today";
}
