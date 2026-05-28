import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  areDemoWorkspaceMutationsAllowed,
  demoWorkspaceBlockedInProductionMessage,
} from "@/lib/production-guards";

export type DemoMutationAccessResult =
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string };

export async function requireDemoWorkspaceMutation(input: {
  operation: string;
}): Promise<DemoMutationAccessResult> {
  if (!areDemoWorkspaceMutationsAllowed()) {
    return { ok: false, error: demoWorkspaceBlockedInProductionMessage() };
  }

  const access = await requireMutationPermission("templates.manage");
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "demo.permission_denied",
      entityType: "DemoWorkspace",
      metadata: {
        operation: input.operation,
        requiredPermission: "templates.manage",
      },
    });
    return { ok: false, error: access.error };
  }

  return { ok: true, actor: access.actor };
}
