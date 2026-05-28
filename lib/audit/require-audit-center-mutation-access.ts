import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";

async function requireAuditCenterMutation(
  permission: PermissionKey,
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "audit_center.permission_denied",
      entityType: "AuditCenter",
      metadata: {
        operation,
        requiredPermission: permission,
      },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

export async function requireAuditExportAccess(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  return requireAuditCenterMutation("audit.export", "audit_center.export");
}

export async function requireAuditRetentionMutationAccess(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  return requireAuditCenterMutation("workspace.settings", "audit_center.retention_upsert");
}
