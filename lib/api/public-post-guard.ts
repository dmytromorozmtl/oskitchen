import { NextResponse } from "next/server";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { getSessionUser } from "@/lib/auth";
import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import type { RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/storefront/turnstile";
import { timingSafeEqualText } from "@/lib/security/timing-safe";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

function readBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, ...tokenParts] = authHeader.trim().split(/\s+/);
  if (scheme.toLowerCase() !== "bearer" || tokenParts.length === 0) {
    return null;
  }
  const token = tokenParts.join(" ").trim();
  return token.length > 0 ? token : null;
}

/** Fail closed when the ingest bearer secret env var is unset (503) or wrong (401). */
export function requireIngestBearerSecret(
  request: Request,
  options: {
    secretEnv: string | undefined;
    missingMessage?: string;
    unauthorizedMessage?: string;
  },
): NextResponse | null {
  return requireBearerWebhookSecret(request, {
    secret: options.secretEnv,
    missingMessage: options.missingMessage ?? "Ingest not configured",
    unauthorizedMessage: options.unauthorizedMessage ?? "Unauthorized",
  });
}

/**
 * Rate limit + Turnstile for public marketing POSTs.
 * In production, returns 503 when Turnstile is not configured (no open spam ingest).
 */
export async function enforcePublicMarketingPostGuard(
  request: Request,
  options: {
    policyKey: RateLimitPolicyKey;
    bucketPrefix: string;
    captchaToken?: string | null;
  },
): Promise<NextResponse | null> {
  const ip = getClientIpFromRequest(request);
  const rl = await consumeRateLimitToken(`${options.bucketPrefix}:${ip}`, options.policyKey);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  if (!isTurnstileConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { ok: false, error: "Lead capture not configured" },
        { status: 503 },
      );
    }
    return null;
  }

  const captcha = await verifyTurnstileToken(options.captchaToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { ok: false, error: captcha.error ?? "Security check failed." },
      { status: 400 },
    );
  }

  return null;
}

/**
 * Authenticated dashboard POST or optional bearer ingest secret.
 * Fails closed when neither session nor `NPS_INGEST_SECRET` is configured.
 */
export async function requireSessionOrIngestBearer(
  request: Request,
  options: {
    secretEnv: string | undefined;
    missingMessage?: string;
  },
): Promise<{ ok: true; userId: string } | { ok: false; response: NextResponse }> {
  const secret = options.secretEnv?.trim();
  if (secret) {
    const token = readBearerToken(request.headers.get("authorization"));
    if (token && timingSafeEqualText(token, secret)) {
      return { ok: true, userId: "ingest" };
    }
    if (token) {
      return {
        ok: false,
        response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
      };
    }
  }

  const session = await getSessionUser();
  if (session?.id) {
    return { ok: true, userId: session.id };
  }

  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: options.missingMessage ?? "Feedback ingest not configured" },
        { status: 503 },
      ),
    };
  }

  return {
    ok: false,
    response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
  };
}
