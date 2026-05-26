import { NextRequest, NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  getLoyaltyBalance,
  getOrCreateLoyaltyProgram,
} from "@/services/loyalty/loyalty-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { dataUserId } = await requireTenantActor();
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
