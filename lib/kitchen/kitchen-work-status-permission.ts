import type { ProductionWorkStatus } from "@prisma/client";

import type { PermissionKey } from "@/lib/permissions/permissions";

const EXPO_WORK_STATUSES = new Set<ProductionWorkStatus>(["HANDOFF", "PACK_HANDOFF"]);

/** Canonical permission for a production work-item transition from the kitchen screen. */
export function kitchenPermissionForWorkStatus(status: ProductionWorkStatus): PermissionKey {
  if (EXPO_WORK_STATUSES.has(status)) return "kitchen.expo.manage";
  return "kitchen.bump";
}
