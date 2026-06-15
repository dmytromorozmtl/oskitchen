import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";

export async function GET(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "cart-recovery");
  if (!rate.ok) {
    return new NextResponse(rate.message, { status: 429, headers: { "Content-Type": "text/plain" } });
  }

  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) {
    return new NextResponse("Missing token.", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  const row = await prisma.storefrontCartRecovery.findUnique({
    where: { recoveryToken: token },
    include: { storefront: { select: { publicName: true } } },
  });
  if (!row) {
    return new NextResponse("This link is invalid or expired.", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (!row.unsubscribedAt) {
    await prisma.storefrontCartRecovery.update({
      where: { id: row.id },
      data: { unsubscribedAt: new Date() },
    });
  }

  const name = row.storefront.publicName;
  return new NextResponse(
    `You are unsubscribed from cart reminder emails for ${name}. You can still complete checkout anytime.`,
    { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
