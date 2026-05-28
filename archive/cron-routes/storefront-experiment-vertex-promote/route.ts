import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runExperimentVertexPromoteCycle } from "@/services/storefront/experiment-vertex-promote-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runExperimentVertexPromoteCycle();
  logger.info("storefront_experiment_vertex_promote_cron", result);
  return NextResponse.json({ ok: true, ...result });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
