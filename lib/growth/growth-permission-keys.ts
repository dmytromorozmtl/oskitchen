import type { PermissionKey } from "@/lib/permissions/permissions";
import type { GrowthCapability } from "@/lib/growth/growth-types";

/** Map growth capabilities to canonical workspace permission keys. */
export function workspacePermissionForGrowthCapability(
  capability: GrowthCapability,
): PermissionKey {
  return capability === "growth.view" ? "growth.view" : "growth.manage";
}
