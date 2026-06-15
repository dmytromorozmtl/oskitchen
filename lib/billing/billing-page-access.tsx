import { createElement, type ReactNode } from "react";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { requireUserProfile } from "@/lib/auth";
import { createBillingActorScope } from "@/lib/billing/billing-actor-scope";
import {
  canUseBilling,
  type BillingCapability,
} from "@/lib/billing/billing-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export function billingViewDeniedCard(): ReactNode {
  return createElement(PermissionDeniedSurfaceCard, { surfaceId: "billing_hub" });
}

export function billingManageDeniedCard(): ReactNode {
  return createElement(PermissionDeniedSurfaceCard, { surfaceId: "billing_hub" });
}

export function billingCancelDeniedCard(): ReactNode {
  return createElement(PermissionDeniedSurfaceCard, { surfaceId: "billing_hub" });
}

export async function requireBillingPageAccess(cap: BillingCapability): Promise<
  | {
      ok: true;
      actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
      scope: ReturnType<typeof createBillingActorScope>;
      canWriteOverrides: boolean;
      canCheckout: boolean;
      canOpenPortal: boolean;
      canCancel: boolean;
      canViewDiagnostics: boolean;
    }
  | { ok: false; deny: ReactNode }
> {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = createBillingActorScope(actor, {
    role: profile.role ?? null,
    email: profile.email ?? null,
  });
  if (!canUseBilling(scope, cap, { granted: actor.granted })) {
    const deny =
      cap === "billing.cancel" || cap === "billing.downgrade"
        ? billingCancelDeniedCard()
        : cap === "billing.view"
          ? billingViewDeniedCard()
          : billingManageDeniedCard();
    return { ok: false, deny };
  }
  return {
    ok: true,
    actor,
    scope,
    canWriteOverrides: canUseBilling(scope, "billing.override.write", { granted: actor.granted }),
    canCheckout: canUseBilling(scope, "billing.checkout", { granted: actor.granted }),
    canOpenPortal: canUseBilling(scope, "billing.portal.open", { granted: actor.granted }),
    canCancel: canUseBilling(scope, "billing.cancel", { granted: actor.granted }),
    canViewDiagnostics: canUseBilling(scope, "billing.view.diagnostics", { granted: actor.granted }),
  };
}
