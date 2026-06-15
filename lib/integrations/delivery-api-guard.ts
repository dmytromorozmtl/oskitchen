import { NextResponse } from "next/server";

import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

/** Rate limit + session-scoped delivery adapter calls. */
export async function enforceDeliveryApiRateLimit(
  request: Request,
  ownerUserId: string,
): Promise<NextResponse | null> {
  const ip = getClientIpFromRequest(request);
  const rl = await consumeRateLimitToken(`delivery_api:${ownerUserId}:${ip}`, "delivery_api");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }
  return null;
}
