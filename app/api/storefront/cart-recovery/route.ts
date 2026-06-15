import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { verifyTurnstileToken } from "@/lib/storefront/turnstile";
import {
  loadCartRecoveryByToken,
  upsertStorefrontCartRecovery,
} from "@/services/storefront/storefront-cart-recovery-service";

const trackSchema = z.object({
  storeSlug: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  cart: z.record(z.string().uuid(), z.number().int().positive().max(500)),
  marketingConsent: z.boolean().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const captcha = await verifyTurnstileToken(parsed.data.captchaToken);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error ?? "Security check failed." }, { status: 400 });
  }

  const rate = await enforceStorefrontRouteRateLimit(request, "cart-recovery", parsed.data.storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: parsed.data.storeSlug, enabled: true, published: true },
    select: { id: true, storeSlug: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
  }

  const token = await upsertStorefrontCartRecovery({
    storefrontId: sf.id,
    storeSlug: sf.storeSlug,
    customerEmail: parsed.data.customerEmail,
    cart: parsed.data.cart,
    marketingConsent: parsed.data.marketingConsent === true,
  });

  return NextResponse.json({ ok: true, token });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }
  const loaded = await loadCartRecoveryByToken(token);
  if (!loaded) {
    return NextResponse.json({ error: "Recovery link expired or invalid." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, ...loaded });
}
