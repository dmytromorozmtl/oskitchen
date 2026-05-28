import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { archiveStorefrontExperimentAudits } from "@/services/storefront/storefront-experiment-audit-archive-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
const stats = await archiveStorefrontExperimentAudits();
  logger.info("storefront_experiment_audit_archive_cron", stats);
  return NextResponse.json({ ok: true, ...stats });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
