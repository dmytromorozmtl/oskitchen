import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { runSoc2Type2EvidenceBinder } from "@/services/storefront/soc2-type2-evidence-binder-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runSoc2Type2EvidenceBinder();
  logger.info("soc2_type2_evidence_binder_cron", result);

  if (!result.ok) {
    void sendPagerDutyEvent({
      severity: "error",
      summary: `SOC2 Type II evidence binder failed: ${result.error ?? "upload"}`,
      source: "soc2_type2_evidence_binder",
      dedupKey: "soc2-type2-evidence-binder",
    });
    return NextResponse.json(result, { status: 500 });
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
