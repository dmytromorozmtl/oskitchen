import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logRewardsPermissionDenied } from "@/services/crm/rewards-permission-audit";

function deniedCard(message: string): ReactNode {
  return createElement(
    Card,
    { className: "border-border/80 shadow-sm" },
    createElement(
      CardContent,
      { className: "py-8 text-center text-sm text-muted-foreground" },
      message,
    ),
  );
}

export async function requireGiftCardsPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const canView =
    hasPermission(actor.granted, "giftcards.manage") ||
    hasPermission(actor.granted, "customers.manage");
  const canManage = hasPermission(actor.granted, "giftcards.manage");

  if (!canView) {
    await logRewardsPermissionDenied(actor, {
      requiredPermission: "giftcards.manage",
      operation: "gift_cards.page.view",
      module: "gift_cards",
    });
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to view gift cards."),
    };
  }

  return { ok: true as const, actor, canManage };
}

export async function requireLoyaltyPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const canView =
    hasPermission(actor.granted, "loyalty.manage") ||
    hasPermission(actor.granted, "customers.manage");
  const canManage = hasPermission(actor.granted, "loyalty.manage");

  if (!canView) {
    await logRewardsPermissionDenied(actor, {
      requiredPermission: "loyalty.manage",
      operation: "loyalty.page.view",
      module: "loyalty",
    });
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to view the loyalty program."),
    };
  }

  return { ok: true as const, actor, canManage };
}
