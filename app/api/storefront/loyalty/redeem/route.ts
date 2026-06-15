import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { redeemLoyaltyPoints } from "@/services/storefront/loyalty-service";

const schema = z.object({
  storeSlug: z.string().min(2).max(120),
  email: z.string().email(),
  points: z.number().int().positive().max(100000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const rate = await enforceStorefrontRouteRateLimit(request, "guest-account", parsed.data.storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: parsed.data.storeSlug, enabled: true, published: true },
    select: { id: true },
  });
  if (!sf) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const result = await redeemLoyaltyPoints({
    storefrontId: sf.id,
    customerEmail: parsed.data.email,
    points: parsed.data.points,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true as const, creditAmount: result.creditAmount });
}
