import {
  PRICE_INTELLIGENCE_PATH,
  PRICE_INTELLIGENCE_POLICY_ID,
} from "@/lib/marketplace/price-intelligence-policy";
import type {
  PriceIntelligenceAutoSwitchPolicy,
  PriceIntelligenceCheapestLeader,
  PriceIntelligenceSnapshot,
  PriceIntelligenceSwitchRecommendation,
} from "@/lib/marketplace/price-intelligence-types";

export function buildPriceIntelligenceSnapshot(input: {
  workspaceId: string;
  autoSwitch: PriceIntelligenceAutoSwitchPolicy;
  recommendations: PriceIntelligenceSwitchRecommendation[];
  cheapestLeaders: PriceIntelligenceCheapestLeader[];
  itemsScanned: number;
  analyzedAt?: Date;
}): PriceIntelligenceSnapshot {
  const autoSwitchReady = input.recommendations.filter((row) => row.autoSwitchEligible).length;
  const totalMonthlySavingsUsd = Math.round(
    input.recommendations.reduce((sum, row) => sum + row.monthlySavingsUsd, 0) * 100,
  ) / 100;

  return {
    policyId: PRICE_INTELLIGENCE_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    autoSwitch: input.autoSwitch,
    recommendations: input.recommendations,
    cheapestLeaders: input.cheapestLeaders,
    summary: {
      switchesAvailable: input.recommendations.length,
      autoSwitchReady,
      totalMonthlySavingsUsd,
      itemsScanned: input.itemsScanned,
    },
    basePath: PRICE_INTELLIGENCE_PATH,
  };
}
