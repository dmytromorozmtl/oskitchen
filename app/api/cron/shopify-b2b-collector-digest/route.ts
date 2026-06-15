import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { runB2bCollectorDigestCronForAllConnections } from "@/services/integrations/shopify-b2b-collector-queue-service";

export const dynamic = "force-dynamic";

/**
 * Daily B2B collector task digest — grouped by assignee, distinct from operator AR digest.
 */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const summary = await runB2bCollectorDigestCronForAllConnections();
    logger.info("shopify_b2b_collector_digest_cron", summary);
    return NextResponse.json({ ok: true, ...summary });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
