import { createCopilotActorScope, type CopilotScopedActor } from "@/lib/ai/copilot-actor-scope";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import type { CopilotCapability } from "@/lib/ai/copilot-types";
import { recordAuditLog } from "@/lib/audit-log";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export async function requireCopilotMutation(input: {
  capability: CopilotCapability;
  operation: string;
}): Promise<{ ok: true; scope: CopilotScopedActor } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  const scope = createCopilotActorScope(actor);
  if (!canUseCopilot(scope, input.capability)) {
    await recordAuditLog({
      userId: actor.sessionUserId,
      workspaceId: actor.workspaceId ?? null,
      action: "copilot.permission_denied",
      entityType: "Copilot",
      metadata: {
        operation: input.operation,
        requiredCapability: input.capability,
      },
    });
    return { ok: false, error: "You do not have permission to use Copilot." };
  }
  return { ok: true, scope };
}
