import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  hasLegacyPermission,
  normalizeRole,
  type PermissionKey as LegacyPermissionKey,
} from "@/lib/permissions/legacy";
import { hasPermission } from "@/lib/permissions/guards";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";

const LEGACY_FALLBACK: Partial<Record<PermissionKey, LegacyPermissionKey>> = {
  "workspace.settings": "manage_settings",
  "orders.manage": "manage_orders",
  "customers.manage": "manage_customers",
  "production.manage": "manage_production",
  "packing.manage": "manage_packing",
  "routes.manage": "manage_orders",
  "integrations.manage": "manage_integrations",
  "billing.manage": "manage_billing",
  "staff.manage": "manage_team",
};

export type MutationAccessResult =
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string };

/** Workspace RBAC with legacy matrix fallback (Phase B). */
export async function requireMutationPermission(
  required: PermissionKey,
): Promise<MutationAccessResult> {
  try {
    const actor = await requireWorkspacePermissionActor();
    if (hasPermission(actor.granted, required)) {
      return { ok: true, actor };
    }
    const legacyKey = LEGACY_FALLBACK[required];
    if (legacyKey && hasLegacyPermission(normalizeRole(actor.workspaceRole), legacyKey)) {
      return { ok: true, actor };
    }
    return { ok: false, error: "You do not have permission to perform this action." };
  } catch {
    return { ok: false, error: "You do not have permission to perform this action." };
  }
}
