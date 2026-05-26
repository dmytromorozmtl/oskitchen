/**
 * Lightweight expansion / churn heuristics for founder dashboards (not ML).
 * Values are 0–100 for sorting and alerts; they are not financial advice.
 */

export type ExpansionSignals = {
  orderGrowthScore: number;
  staffScore: number;
  integrationScore: number;
  composite: number;
};

export function scoreExpansionHeuristic(input: {
  ordersLast30: number;
  ordersPrev30: number;
  staffCount: number;
  integrationConnectedCount: number;
}): ExpansionSignals {
  let orderGrowthScore = 40;
  const prev = Math.max(1, input.ordersPrev30);
  const ratio = input.ordersLast30 / prev;
  if (ratio >= 1.4) orderGrowthScore = 85;
  else if (ratio >= 1.1) orderGrowthScore = 65;
  else if (ratio < 0.85) orderGrowthScore = 25;

  const staffScore = Math.min(100, input.staffCount * 12);
  const integrationScore = Math.min(100, input.integrationConnectedCount * 25);

  const composite = Math.round((orderGrowthScore + staffScore + integrationScore) / 3);
  return { orderGrowthScore, staffScore, integrationScore, composite };
}

export type ChurnRiskSignals = {
  score: number;
  reasons: string[];
};

export function scoreChurnHeuristic(input: {
  daysSinceLastUsageEvent: number | null;
  onboardingCompleted: boolean;
  integrationErrors: number;
  subscriptionStatusLabel: string;
}): ChurnRiskSignals {
  const reasons: string[] = [];
  let score = 15;
  if (input.daysSinceLastUsageEvent != null && input.daysSinceLastUsageEvent > 14) {
    score += 35;
    reasons.push("No product usage (14d+)");
  }
  if (!input.onboardingCompleted) {
    score += 20;
    reasons.push("Onboarding incomplete");
  }
  if (input.integrationErrors > 0) {
    score += 15;
    reasons.push("Integration errors");
  }
  if (/past_due|canceled|unpaid/i.test(input.subscriptionStatusLabel)) {
    score += 30;
    reasons.push("Billing stress");
  }
  return { score: Math.min(100, score), reasons };
}
