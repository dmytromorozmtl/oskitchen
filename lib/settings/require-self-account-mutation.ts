import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

/**
 * Documented self-service exception: password, email, avatar, and personal profile fields
 * may only mutate the authenticated session user's account (not workspace.settings).
 */
export async function requireSelfAccountMutation(operation: string) {
  const actor = await requireTenantActor();
  return { ok: true as const, ...actor, operation };
}

/** Workspace business identity on the owner profile (company name). */
export async function requireOwnerProfileBusinessMutation(operation: string) {
  const access = await requireMutationPermission("workspace.settings");
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "settings_profile.permission_denied",
      entityType: "UserProfile",
      metadata: { operation, requiredPermission: "workspace.settings" },
    });
    return { ok: false as const, error: access.error };
  }
  const actor = await requireTenantActor();
  if (actor.sessionUserId !== actor.dataUserId) {
    await recordAuditLog({
      userId: actor.sessionUserId,
      workspaceId: actor.workspaceId,
      action: "settings_profile.permission_denied",
      entityType: "UserProfile",
      metadata: { operation, reason: "owner_profile_only" },
    });
    return { ok: false as const, error: "You do not have permission to perform this action." };
  }
  return { ok: true as const, ...actor };
}
