import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runHypergraphL3RecursiveAnchorCycle } from "@/services/storefront/hypergraph-l3-recursive-anchor-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runHypergraphL3RecursiveAnchorCycle();
  logger.info("hypergraph_l3_recursive_anchor_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
