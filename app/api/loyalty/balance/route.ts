import { NextRequest, NextResponse } from "next/server";

import { canLookupRewardsBalance } from "@/lib/crm/require-rewards-mutation";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logRewardsPermissionDenied } from "@/services/crm/rewards-permission-audit";
import {
  getLoyaltyBalance,
  getOrCreateLoyaltyProgram,
} from "@/services/loyalty/loyalty-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireWorkspacePermissionActor();
    if (!canLookupRewardsBalance(actor, "loyalty")) {
      await logRewardsPermissionDenied(actor, {
        requiredPermission: "loyalty.manage",
        operation: "loyalty.balance.lookup",
        module: "loyalty",
      });
      return NextResponse.json(
        { error: "You do not have permission to perform this action." },
        { status: 403 },
      );
    }

    const { dataUserId } = actor;
    const customerId = request.nextUrl.searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json({ error: "customerId required" }, { status: 400 });
    }

    const [balance, program] = await Promise.all([
      getLoyaltyBalance(dataUserId, customerId),
      getOrCreateLoyaltyProgram(dataUserId),
    ]);

    return NextResponse.json({
      balance,
      active: program.active,
      redeemPointsThreshold: program.redeemPointsThreshold,
      redeemValueCents: program.redeemValueCents,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
