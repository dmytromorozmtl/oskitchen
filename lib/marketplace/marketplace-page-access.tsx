import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logMarketplacePermissionDenied } from "@/services/marketplace/marketplace-permission-audit";

export type MarketplaceHubAccess = {
  actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
  canRead: boolean;
  canCartWrite: boolean;
  canCreateOrders: boolean;
};

export async function resolveMarketplaceHubAccess(): Promise<MarketplaceHubAccess> {
  const actor = await requireWorkspacePermissionActor();
  return {
    actor,
    canRead: hasPermission(actor.granted, "marketplace:read"),
    canCartWrite: hasPermission(actor.granted, "marketplace:cart:write"),
    canCreateOrders: hasPermission(actor.granted, "marketplace:orders:create"),
  };
}

export function marketplaceReadDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Marketplace",
    description: "You do not have permission to view the B2B marketplace in this workspace.",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export async function requireMarketplaceReadPage(input?: {
  operation?: string;
  route?: string;
}): Promise<
  | ({ ok: true } & MarketplaceHubAccess)
  | { ok: false; deny: ReactNode }
> {
  const hub = await resolveMarketplaceHubAccess();
  if (!hub.canRead) {
    await logMarketplacePermissionDenied(hub.actor, {
      requiredPermission: "marketplace:read",
      operation: input?.operation ?? "marketplace.page.read",
      metadata: input?.route ? { route: input.route } : undefined,
    });
    return { ok: false, deny: marketplaceReadDeniedCard() };
  }
  return { ok: true, ...hub };
}
