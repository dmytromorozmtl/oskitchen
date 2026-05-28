import { logDomainMutationDenied } from "@/lib/permissions/log-domain-mutation-denied";
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
    await logDomainMutationDenied({
      action: "demo.permission_denied",
      entityType: "DemoWorkspace",
      actor: access.actor,
      metadata: {
        operation: input.operation,
        requiredPermission: "templates.manage",
      },
    });
    return { ok: false, error: access.error };
  }

  return { ok: true, actor: access.actor };
}
