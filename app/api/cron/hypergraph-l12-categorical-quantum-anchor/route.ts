import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runHypergraphL12CategoricalQuantumAnchorCycle } from "@/services/storefront/hypergraph-l12-categorical-quantum-anchor-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runHypergraphL12CategoricalQuantumAnchorCycle();
  logger.info("hypergraph_l12_categorical_quantum_anchor_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
