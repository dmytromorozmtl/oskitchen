import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runMultiAgentOrchestratorCron } from "@/services/storefront/multi-agent-orchestrator-cycle-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runMultiAgentOrchestratorCron();
  logger.info("multi_agent_orchestrator_cron_route", result);
  return NextResponse.json({ ok: true, ...result });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
