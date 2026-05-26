import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import { verifyTurnstileToken } from "@/lib/storefront/turnstile";
import { CustomerSubscriptionStatus } from "@prisma/client";

const lookupSchema = z.object({
  storeSlug: z.string().min(2).max(120),
  email: z.string().email(),
  captchaToken: z.string().optional(),
});

const skipSchema = lookupSchema.extend({
  subscriptionId: z.string().uuid(),
  skipWeeks: z.number().int().min(1).max(4).default(1),
});

/** Guest subscription lookup + skip-week (rate-limited, email + captcha). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const skipParsed = skipSchema.safeParse(body);
  const lookupParsed = lookupSchema.safeParse(body);
  if (!skipParsed.success && !lookupParsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const data = skipParsed.success ? skipParsed.data : lookupParsed.data!;
  const captcha = await verifyTurnstileToken(data.captchaToken);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error ?? "Security check failed." }, { status: 400 });
  }

  const rate = await enforceStorefrontRateLimitFromRequest(
    request,
    "storefront_contact_submit",
    `${data.storeSlug}:${data.email}`,
  );
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: data.storeSlug, enabled: true, published: true },
    select: { userId: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
  }

  const email = data.email.trim().toLowerCase();
  const customer = await prisma.kitchenCustomer.findFirst({
    where: { userId: sf.userId, email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (!customer) {
    return NextResponse.json({ ok: true, subscriptions: [] });
  }

  if (skipParsed.success) {
    const sub = await prisma.customerSubscription.findFirst({
      where: {
        id: skipParsed.data.subscriptionId,
        userId: sf.userId,
        customerId: customer.id,
        status: CustomerSubscriptionStatus.ACTIVE,
      },
    });
    if (!sub) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }
    const next = sub.nextOrderDate ? new Date(sub.nextOrderDate) : new Date();
    next.setDate(next.getDate() + skipParsed.data.skipWeeks * 7);
    await prisma.customerSubscription.update({
      where: { id: sub.id },
      data: { nextOrderDate: next },
    });
  }

  const subscriptions = await prisma.customerSubscription.findMany({
    where: { userId: sf.userId, customerId: customer.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      planName: true,
      frequency: true,
      mealsPerWeek: true,
      status: true,
      nextOrderDate: true,
      pickupOrDelivery: true,
    },
  });

  return NextResponse.json({
    ok: true,
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      planName: s.planName,
      frequency: s.frequency,
      mealsPerWeek: s.mealsPerWeek,
      status: s.status,
      nextOrderDate: s.nextOrderDate?.toISOString().slice(0, 10) ?? null,
      pickupOrDelivery: s.pickupOrDelivery,
    })),
  });
}
