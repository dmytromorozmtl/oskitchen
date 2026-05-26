import type { BusinessType, BetaProgramStage } from "@prisma/client";

import { businessTypeFitSummary } from "@/lib/beta/beta-fit-scoring";
import { BETA_STAGE_LABEL } from "@/lib/beta/beta-status";

export type FounderInsightPack = {
  fitSummary: string;
  onboardingRisk: string;
  arrOpportunity: string;
  expansionOpportunity: string;
  churnLikelihood: string;
  idealModules: string[];
  recommendedOnboardingPath: string;
};

type InsightInput = {
  businessType: BusinessType;
  programStage: BetaProgramStage;
  fitScore: number;
  riskScore: number;
  activationProbability: number;
  arrPotentialScore: number;
  expansionScore: number;
  country: string | null;
  biggestPain: string | null;
};

/** Deterministic “AI-style” founder briefing — replace with LLM when policy allows. */
export function generateFounderInsights(input: InsightInput): FounderInsightPack {
  const fitSummary = `${businessTypeFitSummary(input.businessType)} Current pipeline stage: ${BETA_STAGE_LABEL[input.programStage]}. Fit score ${input.fitScore}/100 with risk ${input.riskScore}/100.`;

  const onboardingRisk =
    input.riskScore >= 60
      ? "Elevated onboarding risk: shallow context, weak digital footprint, or ambiguous operating model. Prefer a discovery call before heavy implementation."
      : input.riskScore >= 40
        ? "Moderate risk — standard playbook with tighter checkpoints on integrations and data import."
        : "Lower risk profile for self-serve onboarding with light founder touch.";

  const arrOpportunity =
    input.arrPotentialScore >= 65
      ? "ARR-shaped opportunity: prioritize commercial packaging, invoicing alignment, and success milestones tied to revenue events."
      : "Volume-led opportunity: lead with operational efficiency wins, then expand seats/modules as usage proves out.";

  const expansionOpportunity =
    input.expansionScore >= 60
      ? "Expansion vector: multiple locations or brands — plan rollout waves and template kitchens after first activation."
      : "Single-site depth: focus on workflow excellence before pitching multi-location expansion.";

  const churnLikelihood =
    input.activationProbability < 45
      ? "Churn watch: activation probability is below median — shorten time-to-first-value and add proactive check-ins."
      : input.activationProbability >= 72
        ? "Healthy activation outlook if onboarding stays crisp; capture testimonials early."
        : "Balanced trajectory — standard retention playbook applies.";

  const idealModules = pickIdealModules(input.businessType);

  const geo = (input.country ?? "").trim();
  const recommendedOnboardingPath = [
    "Week 0: channel connectivity + menu truth (sandbox acceptable).",
    "Week 1: production + packing path for their highest-volume SKU line.",
    geo ? `Locale note: ${geo} — confirm tax/label expectations early.` : null,
    input.biggestPain?.trim()
      ? `Anchor success metrics to stated pain: ${input.biggestPain.slice(0, 160)}${input.biggestPain.length > 160 ? "…" : ""}`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    fitSummary,
    onboardingRisk,
    arrOpportunity,
    expansionOpportunity,
    churnLikelihood,
    idealModules,
    recommendedOnboardingPath,
  };
}

function pickIdealModules(bt: BusinessType): string[] {
  const base = ["Order hub", "Production board", "Notifications"];
  if (bt === "MEAL_PREP") return [...base, "Meal plans", "Packing / labels"];
  if (bt === "CATERING") return [...base, "Quotes & events", "Routes"];
  if (bt === "GHOST_KITCHEN" || bt === "MULTI_BRAND" || bt === "CLOUD_KITCHEN") {
    return [...base, "Brands", "Channel mapping", "Integration health"];
  }
  if (bt === "BAKERY") return [...base, "Bakery preorder", "Labels"];
  return base;
}
