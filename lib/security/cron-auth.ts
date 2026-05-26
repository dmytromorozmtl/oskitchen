import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

export type CronAuthResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/** Returns true when experimental/regulatory cron routes may run. Default: disabled. */
export function isExperimentalCronsEnabled(): boolean {
  return process.env.ENABLE_EXPERIMENTAL_CRONS === "true";
}

/**
 * Verifies `Authorization: Bearer <CRON_SECRET>`.
 * Returns 503 when CRON_SECRET is unset (fail closed).
 */
export function verifyCronSecret(request: Request): CronAuthResult {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    logger.warn("CRON_SECRET not set — refusing cron");
    return {
      ok: false,
      response: NextResponse.json({ error: "Cron not configured" }, { status: 503 }),
    };
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return {
      ok: false,
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
      response: NextResponse.json({ skipped: true, reason: "ENABLE_EXPERIMENTAL_CRONS not set" }, { status: 200 }),
    };
  }
  return { ok: true };
}
