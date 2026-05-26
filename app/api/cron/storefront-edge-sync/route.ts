import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { drainStorefrontEdgeSyncJobs } from "@/services/storefront/storefront-edge-sync-job-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
const stats = await drainStorefrontEdgeSyncJobs(25);
  logger.info("storefront_edge_sync_cron", stats);
  return NextResponse.json({ ok: true, ...stats });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
