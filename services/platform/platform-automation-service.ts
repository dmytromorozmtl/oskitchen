import { prisma } from "@/lib/prisma";

export async function platformAutomationFailedCount(): Promise<number> {
  return prisma.automationExecution.count({ where: { status: "FAILED" } }).catch(() => 0);
}
