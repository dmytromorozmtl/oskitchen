import { NextRequest, NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { lookupGiftCard } from "@/services/gift-cards/gift-card-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { dataUserId } = await requireTenantActor();
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
