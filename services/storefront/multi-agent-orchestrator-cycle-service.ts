import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import { sendMultiAgentOrchestratorSlackMessage } from "@/lib/storefront/experiment-slack-approval";
import {
  isMultiAgentOrchestratorEnabled,
  runMultiAgentOrchestratorCycle,
} from "@/lib/storefront/theme-experiment-multi-agent-orchestrator";

export async function runMultiAgentOrchestratorCron(): Promise<{
  cycles: number;
  slackSent: number;
}> {
  if (!isMultiAgentOrchestratorEnabled()) return { cycles: 0, slackSent: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 50,
  });

  let cycles = 0;
  let slackSent = 0;

  for (const sf of storefronts) {
    const { json, snap, slackToken } = runMultiAgentOrchestratorCycle(sf.themeExperimentJson);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });
    cycles++;

    if (slackToken && snap.pendingSlack) {
      const plan = snap.plans[snap.plans.length - 1];
      const { sent } = await sendMultiAgentOrchestratorSlackMessage({
        storeSlug: sf.storeSlug,
        storefrontId: sf.id,
        planAction: plan?.action ?? "unknown",
        rationale: plan?.rationale ?? "",
        riskScore: plan?.riskScore ?? 0,
        approveToken: slackToken,
      });
      if (sent) slackSent++;
    }
  }

  logger.info("multi_agent_orchestrator_cron", { cycles, slackSent });
  return { cycles, slackSent };
}
