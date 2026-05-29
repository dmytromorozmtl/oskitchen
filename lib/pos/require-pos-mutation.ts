import { logDomainMutationDenied } from "@/lib/permissions/log-domain-mutation-denied";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export type PosMutationGate =
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string };

export async function requirePosMutation(input: {
  required: PermissionKey;
  operation: string;
  metadata?: Record<string, unknown>;
}): Promise<PosMutationGate> {
  const access = await requireMutationPermission(input.required);
  if (!access.ok) {
    await logDomainMutationDenied({
      action: "pos.permission_denied",
      entityType: "PosTerminal",
      actor: access.actor,
      metadata: {
        operation: input.operation,
        requiredPermission: input.required,
        ...(input.metadata ?? {}),
      },
    });
  }
  return access;
}
