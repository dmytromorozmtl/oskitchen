import { isSuperAdminEmail } from "@/lib/platform-owner";

import type { ImportActorScope, ImportCapability } from "@/lib/import-center/import-types";
import { canUseImportCenterCapability } from "@/lib/import-center/workspace-import-permission";
import { hasLegacyPermission, normalizeRole } from "@/lib/permissions/legacy";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { hasPermission } from "@/lib/permissions/guards";

const LEGACY_CAPABILITY_FALLBACK: Partial<
  Record<ImportCapability, Parameters<typeof hasLegacyPermission>[1]>
> = {
  "import.view": "manage_products",
  "import.upload": "manage_products",
  "import.commit": "manage_settings",
  "import.rollback": "manage_settings",
  "import.history": "manage_reports",
  "import.templates": "manage_products",
};

/**
 * @deprecated Prefer `canUseImportCenterCapability(actor.granted, cap)` with workspace RBAC.
 * Retained for narrow legacy profile-role checks during migration.
 */
export function canUseImportCenter(
  scope: ImportActorScope,
  cap: ImportCapability,
  granted?: ReadonlySet<PermissionKey>,
): boolean {
  if (isSuperAdminEmail(scope.email)) return true;
  if (scope.isOwner) return true;
  if (granted && canUseImportCenterCapability(granted, cap)) return true;
  const legacyRole = normalizeRole(
    (scope.role?.toUpperCase() ?? "STAFF") as import("@prisma/client").UserRole,
  );
  const legacyKey = LEGACY_CAPABILITY_FALLBACK[cap];
  return legacyKey ? hasLegacyPermission(legacyRole, legacyKey) : false;
}

export { canUseImportCenterCapability } from "@/lib/import-center/workspace-import-permission";
