import { NextResponse } from "next/server";
import { z } from "zod";

import { authCallbackUrl } from "@/lib/auth/public-site-url";
import { prisma } from "@/lib/prisma";
import {
  decryptStorefrontOrderCustomerEmail,
} from "@/lib/storefront/storefront-order-pii";
import { createClient } from "@/lib/supabase/server";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { verifyTurnstileToken } from "@/lib/storefront/turnstile";

const schema = z.object({
  storeSlug: z.string().min(2).max(120),
  orderToken: z.string().min(8).max(128),
  captchaToken: z.string().optional(),
});

/** Send Supabase magic-link OTP so a guest can create an account from their order email. */
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

  const rate = await enforceStorefrontRouteRateLimit(request, "guest-account", parsed.data.storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: parsed.data.storeSlug, enabled: true, published: true },
    select: { id: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
  }

  const order = await prisma.storefrontOrder.findFirst({
    where: {
      storefrontId: sf.id,
      publicToken: parsed.data.orderToken,
    },
    select: { customerEmail: true },
  });
  const email = decryptStorefrontOrderCustomerEmail(order?.customerEmail)?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Order not found or has no email on file." }, { status: 404 });
  }
  const supabase = await createClient();
  const redirectTo = authCallbackUrl("/dashboard");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) {
    return NextResponse.json({ error: "Could not send sign-in link. Try again later." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Check your email for a sign-in link to create your account." });
}
