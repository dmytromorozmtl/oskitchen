import { NextResponse } from "next/server";

import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import type { RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

/** Rate limit authenticated billing API mutations (checkout, portal). */
export async function enforceBillingApiRateLimit(
  request: Request,
  userId: string,
  policyKey: Extract<RateLimitPolicyKey, "billing_checkout" | "billing_portal">,
): Promise<NextResponse | null> {
  const ip = getClientIpFromRequest(request);
  const rl = await consumeRateLimitToken(`${policyKey}:${userId}:${ip}`, policyKey);
  if (rl.ok) return null;

  return NextResponse.json(
    { error: "Too many attempts. Please try again in a minute." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
    },
  );
}
