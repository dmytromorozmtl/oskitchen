import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { getLoyaltyBalance } from "@/services/storefront/loyalty-service";

const schema = z.object({
  storeSlug: z.string().min(2).max(120),
  email: z.string().email(),
});

export async function GET(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "account/session");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const url = new URL(request.url);
  const parsed = schema.safeParse({
    storeSlug: url.searchParams.get("storeSlug"),
    email: url.searchParams.get("email"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query." }, { status: 400 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: parsed.data.storeSlug, enabled: true, published: true },
    select: { id: true },
  });
  if (!sf) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const balance = await getLoyaltyBalance({
    storefrontId: sf.id,
    customerEmail: parsed.data.email,
  });
  return NextResponse.json({ ok: true as const, ...balance });
}
