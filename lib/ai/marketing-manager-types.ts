import type { AI_MARKETING_MANAGER_POLICY_ID } from "@/lib/ai/marketing-manager-policy";
import type { DynamicPricingWeather } from "@/lib/ai/dynamic-pricing-types";

export type MarketingSignalSeverity = "critical" | "high" | "normal" | "low";

export type AutoCampaignType = "welcome" | "abandoned_cart" | "post_purchase" | "win_back";

export type AutoCampaignStatus = "ready" | "draft" | "blocked";

export type AutoCampaignRecommendation = {
  id: AutoCampaignType;
  label: string;
  channel: "email" | "sms";
  audienceSize: number;
  trigger: string;
  status: AutoCampaignStatus;
  severity: MarketingSignalSeverity;
  estimatedLiftPercent: number;
  recommendation: string;
};

export type WeatherPromoType = "delivery_boost" | "menu_bundle" | "loyalty_bonus" | "seasonal";

export type WeatherPromoRecommendation = {
  id: string;
  weather: DynamicPricingWeather | "event";
  promoType: WeatherPromoType;
  headline: string;
  offer: string;
  menuFocus: string;
  demandMultiplier: number;
  severity: MarketingSignalSeverity;
  recommendation: string;
};

export type MarketingManagerDailyBrief = {
  generatedAtIso: string;
  headline: string;
  executiveSummary: string;
  bullets: string[];
  weatherMode: DynamicPricingWeather;
  activeCampaignCount: number;
  weatherPromoCount: number;
};

export type MarketingManagerSnapshot = {
  policyId: typeof AI_MARKETING_MANAGER_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  autoCampaigns: AutoCampaignRecommendation[];
  weatherPromos: WeatherPromoRecommendation[];
  dailyBrief: MarketingManagerDailyBrief;
  summary: {
    klaviyoConfigured: boolean;
    ordersLast7d: number;
    churnRiskCount: number;
    openCarts: number;
    activeHolidayPackages: number;
    marketingConsentCount: number;
    alertCount: number;
    confidence: number;
  };
  aiAssisted: true;
};
