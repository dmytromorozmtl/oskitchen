import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runCenCenelecDigitalProductGovernanceRegistrySyncCycle } from "@/services/storefront/_experiments/cen-cenelec-digital-product-governance-registry-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runCenCenelecDigitalProductGovernanceRegistrySyncCycle();
  logger.info("cen_cenelec_digital_product_governance_registry_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
