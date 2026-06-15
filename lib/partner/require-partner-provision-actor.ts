import { recordAuditLog } from "@/lib/audit-log";
import { canProvisionPartnerOrganizations } from "@/lib/partner/partner-permissions";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";

/**
 * Partner org shell creation — platform GTM roles + kitchen OWNER / SUPER_ADMIN bridge
 * (`canProvisionPartnerOrganizations`). Not workspace `growth.manage` alone.
 */
export async function requirePartnerProvisionActor(input?: {
  operation?: string;
}): Promise<
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string }
> {
  const actor = await requireWorkspacePermissionActor();
  const allowed = await canProvisionPartnerOrganizations(
    actor.sessionUserId,
    actor.email,
    actor.workspaceRole,
  );
  if (!allowed) {
    await recordAuditLog({
      userId: actor.sessionUserId,
      workspaceId: actor.workspaceId ?? null,
      action: "partner_provision.permission_denied",
      entityType: "PartnerAccount",
      metadata: {
        operation: input?.operation ?? "partner.create_organization",
        bridge: "canProvisionPartnerOrganizations",
      },
    });
    return { ok: false, error: "You do not have permission to create partner organizations." };
  }
  return { ok: true, actor };
}
