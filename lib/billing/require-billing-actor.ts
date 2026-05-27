import { requireUserProfile } from "@/lib/auth";
import {
  billingCapabilityToPermissionKey,
  canUseBilling,
  type BillingCapability,
} from "@/lib/billing/billing-permissions";
import { createBillingActorScope } from "@/lib/billing/billing-actor-scope";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";
import { logBillingPermissionDenied } from "@/services/billing/billing-permission-audit";

const DENIED_MESSAGES: Partial<Record<BillingCapability, string>> = {
  "billing.view": "You do not have permission to view billing.",
  "billing.view.diagnostics": "You do not have permission to view billing diagnostics.",
  "billing.checkout": "You do not have permission to start checkout.",
  "billing.portal.open": "You do not have permission to open the billing portal.",
  "billing.cancel": "You do not have permission to cancel or downgrade billing.",
  "billing.downgrade": "You do not have permission to downgrade billing.",
  "billing.override.write": "You do not have permission to change entitlements.",
  "billing.audit.view": "You do not have permission to view billing audit history.",
};

export async function requireBillingActor(
  cap: BillingCapability,
  input?: {
    operation?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<
  | {
      ok: true;
      actor: WorkspacePermissionActor;
      scope: ReturnType<typeof createBillingActorScope>;
      userId: string;
      profileId: string;
    }
  | { ok: false; error: string }
> {
  try {
    const actor = await requireWorkspacePermissionActor();
    const profile = await requireUserProfile();
    const scope = createBillingActorScope(actor, {
      role: profile.role ?? null,
      email: profile.email ?? null,
    });
    const requiredPermission = billingCapabilityToPermissionKey(cap);
    const access = await requireMutationPermission(requiredPermission);
    if (!access.ok) {
      await logBillingPermissionDenied(access.actor ?? actor, {
        requiredPermission,
        billingCapability: cap,
        operation: input?.operation ?? cap,
        metadata: input?.metadata,
      });
      return {
        ok: false,
        error: access.error ?? DENIED_MESSAGES[cap] ?? "You do not have permission for this billing action.",
      };
    }
    if (!canUseBilling(scope, cap, { granted: actor.granted })) {
      await logBillingPermissionDenied(actor, {
        requiredPermission,
        billingCapability: cap,
        operation: input?.operation ?? cap,
        metadata: input?.metadata,
      });
      return {
        ok: false,
        error: DENIED_MESSAGES[cap] ?? "You do not have permission for this billing action.",
      };
    }
    return { ok: true, actor, scope, userId: actor.userId, profileId: profile.id };
  } catch {
    return {
      ok: false,
      error: DENIED_MESSAGES[cap] ?? "You do not have permission for this billing action.",
    };
  }
}
