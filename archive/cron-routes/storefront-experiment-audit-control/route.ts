import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { runExperimentAuditControlChecks } from "@/services/storefront/experiment-audit-control-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runExperimentAuditControlChecks();
  logger.info("storefront_experiment_audit_control_cron", result);

  if (!result.ok) {
    void sendPagerDutyEvent({
      severity: "warning",
      summary: "Experiment audit stream control check failed",
      source: "experiment_audit_control",
      dedupKey: "experiment-audit-control-daily",
      customDetails: { checks: JSON.stringify(result.checks) },
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
