import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { timingSafeEqualText } from "@/lib/security/timing-safe";

export type CronAuthResult =
  | { ok: true }
  | {
      ok: false;
      reason: "missing_secret" | "invalid_authorization" | "experimental_disabled";
      response: NextResponse;
    };

/** Returns true when experimental/regulatory cron routes may run. Default: disabled. */
export function isExperimentalCronsEnabled(): boolean {
  return process.env.ENABLE_EXPERIMENTAL_CRONS === "true";
}

/**
 * Verifies `Authorization: Bearer <CRON_SECRET>`.
 * Returns 503 when CRON_SECRET is unset (fail closed).
 */
function readCronBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const trimmed = authHeader.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null;
  const token = trimmed.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function verifyCronSecret(request: Request): CronAuthResult {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    logger.warn("CRON_SECRET not set — refusing cron");
    return {
      ok: false,
      reason: "missing_secret",
      response: NextResponse.json({ error: "Cron not configured" }, { status: 503 }),
    };
  }
  const token = readCronBearerToken(request.headers.get("authorization"));
  if (!token || !timingSafeEqualText(token, secret)) {
    return {
      ok: false,
      reason: "invalid_authorization",
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true };
}

/** Gate hypergraph/regulatory experiment crons unless explicitly enabled. */
export function verifyExperimentalCron(request: Request): CronAuthResult {
  const base = verifyCronSecret(request);
  if (!base.ok) return base;
  if (!isExperimentalCronsEnabled()) {
    return {
      ok: false,
      reason: "experimental_disabled",
      response: NextResponse.json({ skipped: true, reason: "ENABLE_EXPERIMENTAL_CRONS not set" }, { status: 200 }),
    };
  }
  return { ok: true };
}
