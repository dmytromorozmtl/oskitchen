import { NextResponse } from "next/server";

import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";
import { createB2bPayPortalCheckoutSession } from "@/services/integrations/shopify-b2b-invoice-pay-portal-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!token?.trim()) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const ip = getClientIpFromRequest(request);
  const rl = await consumeRateLimitToken(`b2b_pay_portal:${token}:${ip}`, "b2b_pay_portal_checkout");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const result = await createB2bPayPortalCheckoutSession(token);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url });
}
