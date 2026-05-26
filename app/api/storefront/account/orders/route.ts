import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { buildStorefrontOrderCustomerEmailEqualsWhere } from "@/lib/storefront/storefront-order-pii";
import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import { verifyTurnstileToken } from "@/lib/storefront/turnstile";

const schema = z.object({
  storeSlug: z.string().min(2).max(120),
  email: z.string().email(),
  captchaToken: z.string().optional(),
});

/** Guest order lookup by email (rate-limited). Shopify-style “track order” lite. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const captcha = await verifyTurnstileToken(parsed.data.captchaToken);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error ?? "Security check failed." }, { status: 400 });
  }

  const rate = await enforceStorefrontRateLimitFromRequest(
    request,
    "storefront_contact_submit",
    `${parsed.data.storeSlug}:${parsed.data.email}`,
  );
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: parsed.data.storeSlug, enabled: true, published: true },
    select: { id: true, storeSlug: true, publicName: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const orders = await prisma.storefrontOrder.findMany({
    where: {
      AND: [
        {
          storefrontId: sf.id,
          isTestOrder: false,
        },
        buildStorefrontOrderCustomerEmailEqualsWhere(email),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      publicToken: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    storeName: sf.publicName,
    orders: orders.map((o) => ({
      token: o.publicToken,
      orderNumber: o.orderNumber,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      href: `/s/${sf.storeSlug}/order/${o.publicToken}`,
    })),
  });
}
