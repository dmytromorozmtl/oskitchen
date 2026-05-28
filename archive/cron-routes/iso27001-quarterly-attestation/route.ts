import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { runIso27001QuarterlyAttestation } from "@/services/storefront/iso27001-attestation-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runIso27001QuarterlyAttestation();
  logger.info("iso27001_attestation_cron", result);

  if (!result.ok) {
    void sendPagerDutyEvent({
      severity: "error",
      summary: "ISO 27001 quarterly attestation upload failed",
      source: "iso27001_attestation",
      dedupKey: "iso27001-quarterly-attestation",
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
