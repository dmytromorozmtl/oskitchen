import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  isAutonomousScientistEnabled,
  markProposalRunning,
  mergeScientistIntoJson,
  readAutonomousScientist,
} from "@/lib/storefront/theme-experiment-autonomous-scientist";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export async function runAutonomousScientistCycle(): Promise<{
  evaluated: number;
  promoted: number;
}> {
  if (!isAutonomousScientistEnabled()) return { evaluated: 0, promoted: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 50,
  });

  let evaluated = 0;
  let promoted = 0;

  for (const sf of storefronts) {
    const snap = readAutonomousScientist(sf.themeExperimentJson);
    if (!snap) continue;

    const proposed = snap.proposals.find((p) => p.status === "proposed");
    if (!proposed) continue;

    evaluated++;
    const metrics = await getThemeExperimentArmMetrics(sf.id, 14, sf.themeExperimentJson);
    const decision = evaluateExperimentProdDecision(metrics, undefined, {
      themeExperimentJson: sf.themeExperimentJson,
    });

    let next = markProposalRunning(snap, proposed.proposalId);

    if (decision.recommendation === "publish_draft" && !snap.guardrails.requireHumanApproval) {
      next = {
        ...next,
        proposals: next.proposals.map((p) =>
          p.proposalId === proposed.proposalId ? { ...p, status: "concluded" as const } : p,
        ),
        lastConcludeAt: new Date().toISOString(),
      };
      promoted++;
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: mergeScientistIntoJson(sf.themeExperimentJson, next) as object },
    });
  }

  logger.info("autonomous_scientist_cycle", { evaluated, promoted });
  return { evaluated, promoted };
}
