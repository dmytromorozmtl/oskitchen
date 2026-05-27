import type { BillingActorScope } from "@/lib/billing/billing-permissions";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export type BillingScopedActor = BillingActorScope & {
  granted?: ReadonlySet<PermissionKey>;
};

export function createBillingActorScope(
  actor: WorkspacePermissionActor,
  profile: { role?: string | null; email?: string | null },
): BillingScopedActor {
  return {
    role: profile.role ?? actor.workspaceRole,
    email: profile.email ?? actor.email,
    granted: actor.granted,
  };
}
