import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { runBqPrivateLinkAuditCycle } from "@/services/storefront/experiment-bq-private-link-audit-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runBqPrivateLinkAuditCycle();
  logger.info("bq_private_link_audit_cron", result);

  if (!result.ok && result.drift > 0) {
    void sendPagerDutyEvent({
      severity: "warning",
      summary: `BQ Private Link audit drift (${result.drift} storefronts)`,
      source: "bq_private_link_audit",
      dedupKey: "bq-private-link-audit",
    });
  }

  return NextResponse.json(result);
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
