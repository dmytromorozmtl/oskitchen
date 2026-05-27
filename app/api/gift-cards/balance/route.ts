import { NextRequest, NextResponse } from "next/server";

import { canLookupRewardsBalance } from "@/lib/crm/require-rewards-mutation";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logRewardsPermissionDenied } from "@/services/crm/rewards-permission-audit";
import { lookupGiftCard } from "@/services/gift-cards/gift-card-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireWorkspacePermissionActor();
    if (!canLookupRewardsBalance(actor, "gift_cards")) {
      await logRewardsPermissionDenied(actor, {
        requiredPermission: "giftcards.manage",
        operation: "gift_cards.balance.lookup",
        module: "gift_cards",
      });
      return NextResponse.json(
        { error: "You do not have permission to perform this action." },
        { status: 403 },
      );
    }

    const { dataUserId } = actor;
    const code = request.nextUrl.searchParams.get("code");
    if (!code?.trim()) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    const card = await lookupGiftCard(dataUserId, code.trim());
    if (!card) {
      return NextResponse.json({ error: "Invalid or inactive gift card" }, { status: 404 });
    }

    return NextResponse.json({
      id: card.id,
      code: card.code,
      balance: Number(card.balance),
      status: card.status,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
