import type { BetaLead } from "@prisma/client";

import { computeBetaProgramScores, type BetaProgramScoreInput } from "@/lib/beta/beta-fit-scoring";
import { prisma } from "@/lib/prisma";

function toScoreInput(lead: BetaLead): BetaProgramScoreInput {
  return {
    weeklyOrderVolume: lead.weeklyOrderVolume,
    businessType: lead.businessType,
    currentChannels: lead.currentChannels,
    biggestPain: lead.biggestPain,
    interestedFeatures: lead.interestedFeatures,
    country: lead.country,
    businessWebsite: lead.businessWebsite,
    locationsCount: lead.locationsCount,
    teamSize: lead.teamSize,
    onboardingUrgency: lead.onboardingUrgency,
    integrationsNeeded: lead.integrationsNeeded,
  };
}

export async function refreshBetaLeadScores(leadId: string) {
  const lead = await prisma.betaLead.findUniqueOrThrow({ where: { id: leadId } });
  const s = computeBetaProgramScores(toScoreInput(lead));
  return prisma.betaLead.update({
    where: { id: leadId },
    data: {
      score: s.fitScore,
      expansionScore: s.expansionScore,
      activationProbability: s.activationProbability,
      riskScore: s.riskScore,
      onboardingReadiness: s.onboardingReadiness,
      expansionPotential: s.expansionPotential,
      onboardingComplexity: s.onboardingComplexity,
      estimatedOnboardingDays: s.estimatedOnboardingDays,
      arrPotentialScore: s.arrPotentialScore,
      lastActivityAt: new Date(),
    },
  });
}

export function previewScoresForInput(input: BetaProgramScoreInput) {
  return computeBetaProgramScores(input);
}
