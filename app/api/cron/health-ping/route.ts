import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { emitCronFailure } from "@/services/observability/ops-signals";

export const dynamic = "force-dynamic";

/**
 * Experimental cron health ping — safe Sentry alert verification trigger.
 *
 * Normal: 200 ok. `?fail=1` emits `ops_signal:cron_failure` and returns 500.
 *
 * @see docs/SENTRY_ALERT_RULES.md §5
 * @see docs/sentry-alert-firing-p2-36-runbook.md
 */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const url = new URL(request.url);
    const shouldFail = url.searchParams.get("fail") === "1";

    if (shouldFail) {
      const err = new Error("health-ping intentional failure (Sentry alert verification)");
      emitCronFailure("/api/cron/health-ping", err);
      return NextResponse.json(
        {
          ok: false,
          error: "health_ping_failed",
          opsSignal: "cron_failure",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      slug: "health-ping",
      timestamp: new Date().toISOString(),
    });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
