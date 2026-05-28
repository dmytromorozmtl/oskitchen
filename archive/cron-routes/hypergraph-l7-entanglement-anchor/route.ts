import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runHypergraphL7EntanglementAnchorCycle } from "@/services/storefront/hypergraph-l7-entanglement-anchor-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runHypergraphL7EntanglementAnchorCycle();
  logger.info("hypergraph_l7_entanglement_anchor_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
