import type { BetaFeedbackCategory, BetaFeedbackSeverity, BetaProgramStage } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listBetaFeedbackForLead(betaLeadId: string) {
  return prisma.betaFeedback.findMany({
    where: { betaLeadId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createBetaFeedback(input: {
  betaLeadId: string;
  category: BetaFeedbackCategory;
  severity?: BetaFeedbackSeverity;
  feedback: string;
  requestedFeature?: string | null;
  source?: string | null;
}) {
  return prisma.betaFeedback.create({
    data: {
      betaLeadId: input.betaLeadId,
      category: input.category,
      severity: input.severity ?? "MEDIUM",
      feedback: input.feedback,
      requestedFeature: input.requestedFeature?.trim() || null,
      source: input.source?.trim() || null,
    },
  });
}
