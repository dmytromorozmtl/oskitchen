import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { requireUserProfile } from "@/lib/auth";
import { createBillingActorScope } from "@/lib/billing/billing-actor-scope";
import {
  canUseBilling,
  type BillingCapability,
} from "@/lib/billing/billing-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

function deniedCard(title: string, description: string): ReactNode {
  return createElement(PosAccessCard, {
    title,
    description,
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export function billingViewDeniedCard(): ReactNode {
  return deniedCard(
    "Billing",
    "You do not have permission to view billing for this workspace.",
  );
}

export function billingManageDeniedCard(): ReactNode {
  return deniedCard(
    "Billing management",
    "You do not have permission to manage subscriptions, checkout, or payment methods in this workspace.",
  );
}

export function billingCancelDeniedCard(): ReactNode {
  return deniedCard(
    "Cancel or downgrade",
    "You do not have permission to cancel or downgrade the subscription for this workspace.",
  );
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
