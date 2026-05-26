import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { runSoc2ExperimentEvidencePack } from "@/services/storefront/soc2-experiment-evidence-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
const result = await runSoc2ExperimentEvidencePack();
  logger.info("soc2_experiment_evidence_cron", result);

  if (!result.ok) {
    void sendPagerDutyEvent({
      severity: "error",
      summary: `SOC2 experiment evidence pack failed: ${result.error ?? "unknown"}`,
      source: "soc2_experiment_evidence",
      dedupKey: "soc2-experiment-evidence-weekly",
      customDetails: { error: result.error ?? null, storeCount: result.storeCount ?? 0 },
    });
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
