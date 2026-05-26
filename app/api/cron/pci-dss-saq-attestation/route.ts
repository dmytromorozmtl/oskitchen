import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { runPciDssSaqAttestation } from "@/services/storefront/pci-dss-saq-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runPciDssSaqAttestation();
  logger.info("pci_dss_saq_cron", result);

  if (!result.overallPassed) {
    void sendPagerDutyEvent({
      severity: "warning",
      summary: `PCI-DSS SAQ-A attestation failed for ${result.quarter}`,
      source: "pci_dss_saq",
      dedupKey: "pci-dss-saq-quarterly",
    });
  }

  if (!result.ok) {
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
