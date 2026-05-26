import type { BusinessType } from "@prisma/client";

import { scoreBetaLead, type LeadScoreInput } from "@/lib/growth/lead-scoring";

export type BetaProgramScoreInput = LeadScoreInput & {
  locationsCount?: number | null;
  teamSize?: number | null;
  onboardingUrgency?: string | null;
  integrationsNeeded?: string | null;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/**
 * Derives expansion, activation, risk, onboarding complexity, and ARR proxy scores (0–100).
 * Primary fit score reuses {@link scoreBetaLead} for consistency with Growth CRM.
 */
export function computeBetaProgramScores(input: BetaProgramScoreInput): {
  fitScore: number;
  qualificationLabel: ReturnType<typeof scoreBetaLead>["label"];
  expansionScore: number;
  activationProbability: number;
  riskScore: number;
  onboardingReadiness: number;
  expansionPotential: number;
  onboardingComplexity: number;
  estimatedOnboardingDays: number;
  arrPotentialScore: number;
} {
  const { score, label } = scoreBetaLead(input);

  const loc = input.locationsCount ?? 0;
  const team = input.teamSize ?? 0;
  let expansion = 40;
  if (loc >= 5) expansion += 22;
  else if (loc >= 2) expansion += 14;
  else if (loc >= 1) expansion += 6;

  if (team >= 25) expansion += 18;
  else if (team >= 8) expansion += 12;
  else if (team >= 3) expansion += 6;

  if (
    input.businessType === "CATERING" ||
    input.businessType === "GHOST_KITCHEN" ||
    input.businessType === "MULTI_BRAND"
  ) {
    expansion += 12;
  } else if (input.businessType === "MEAL_PREP") expansion += 8;

  expansion = clamp(expansion, 0, 100);

  let activation = score * 0.55 + expansion * 0.2;
  const urgency = (input.onboardingUrgency ?? "").toLowerCase();
  if (/\b(urgent|asap|week|launch)\b/.test(urgency)) activation += 12;
  if (input.integrationsNeeded?.trim()) activation += 6;
  activation = clamp(activation, 0, 100);

  let risk = 22;
  if (input.businessType === "OTHER") risk += 28;
  if (!input.businessWebsite?.trim()) risk += 12;
  const pain = input.biggestPain ?? "";
  if (pain.length < 12) risk += 10;
  if (team > 0 && team < 2 && loc > 2) risk += 8;
  risk = clamp(risk, 0, 100);

  let readiness = 55;
  if (input.businessWebsite?.trim()) readiness += 10;
  if (Array.isArray(input.currentChannels) && input.currentChannels.length > 1) readiness += 8;
  if (pain.length > 40) readiness += 12;
  if (team >= 3) readiness += 10;
  readiness = clamp(readiness, 0, 100);

  const expansionPotential = clamp((expansion * 0.65 + score * 0.35) as number, 0, 100);

  let complexity = 32;
  if (input.integrationsNeeded?.trim()) complexity += 18;
  if (loc >= 3) complexity += 14;
  if (Array.isArray(input.currentChannels)) {
    const ch = input.currentChannels.map((c) => String(c).toLowerCase());
    if (ch.some((c) => c.includes("shopify") || c.includes("woocommerce"))) complexity += 8;
  }
  complexity = clamp(complexity, 0, 100);

  const estimatedOnboardingDays = clamp(
    5 + Math.round(complexity / 18) + (loc >= 2 ? 4 : 0),
    3,
    45,
  );

  let arr = 30;
  if (input.businessType === "CATERING") arr += 28;
  if (input.businessType === "GHOST_KITCHEN" || input.businessType === "MULTI_BRAND") arr += 22;
  if (input.businessType === "MEAL_PREP") arr += 14;
  if (loc >= 3) arr += 12;
  if (team >= 15) arr += 10;
  arr = clamp(arr, 0, 100);

  return {
    fitScore: score,
    qualificationLabel: label,
    expansionScore: expansion,
    activationProbability: activation,
    riskScore: risk,
    onboardingReadiness: readiness,
    expansionPotential,
    onboardingComplexity: complexity,
    estimatedOnboardingDays,
    arrPotentialScore: arr,
  };
}

export function businessTypeFitSummary(type: BusinessType): string {
  switch (type) {
    case "MEAL_PREP":
      return "Meal prep operators map strongly to preorder boards, cutoffs, and packing flows.";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "Multi-channel ghost / cloud concepts benefit from order hub + production visibility.";
    case "CATERING":
      return "Catering teams often carry higher ACV — prioritize quotes, calendar, and production handoff.";
    case "BAKERY":
      return "Bakeries skew to preorder windows and label accuracy — strong beta feedback loop.";
    default:
      return "Evaluate operational depth and channel count before committing onboarding capacity.";
  }
}
