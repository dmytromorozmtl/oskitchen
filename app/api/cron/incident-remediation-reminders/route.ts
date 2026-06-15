import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { runProductionIncidentRemediationFollowUp } from "@/services/incidents/production-incident-remediation-follow-up-service";
import { reconcileProductionIncidentRemediationTasks } from "@/services/incidents/production-incident-remediation-task-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const [taskSync, summary] = await Promise.all([
      reconcileProductionIncidentRemediationTasks(),
      runProductionIncidentRemediationFollowUp(),
    ]);
    logger.info("incident-remediation-reminders", { ...summary, taskSync });
    return NextResponse.json({
      ok: true,
      taskSync,
      ...summary,
    });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
