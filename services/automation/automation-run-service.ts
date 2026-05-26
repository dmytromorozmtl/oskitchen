import { AutomationExecutionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function countAutomationRunsForUser(userId: string, windowDays = 7) {
  const since = new Date(Date.now() - windowDays * 864e5);
  const [failed, success] = await Promise.all([
    prisma.automationExecution.count({
      where: {
        status: AutomationExecutionStatus.FAILED,
        startedAt: { gte: since },
        rule: { userId },
      },
    }),
    prisma.automationExecution.count({
      where: {
        status: AutomationExecutionStatus.SUCCESS,
        startedAt: { gte: since },
        rule: { userId },
      },
    }),
  ]);
  return { failed, success, windowDays };
}
