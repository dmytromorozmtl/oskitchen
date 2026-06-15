import {
  inferWeatherFromDate,
  localEventMultiplier,
  weatherMultiplier,
} from "@/lib/ai/dynamic-pricing-builders";
import type { DynamicPricingWeather } from "@/lib/ai/dynamic-pricing-types";
import {
  AI_MARKETING_CHURN_WINBACK_THRESHOLD,
  AI_MARKETING_MANAGER_POLICY_ID,
} from "@/lib/ai/marketing-manager-policy";
import type {
  AutoCampaignRecommendation,
  AutoCampaignType,
  MarketingManagerDailyBrief,
  MarketingManagerSnapshot,
  MarketingSignalSeverity,
  WeatherPromoRecommendation,
} from "@/lib/ai/marketing-manager-types";
import type { EmailFlowId } from "@/services/marketing/email-marketing-service";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function campaignSeverity(status: AutoCampaignRecommendation["status"], audienceSize: number): MarketingSignalSeverity {
  if (status === "ready" && audienceSize >= 25) return "high";
  if (status === "ready" && audienceSize > 0) return "normal";
  if (status === "draft" && audienceSize >= 10) return "normal";
  if (status === "blocked") return "low";
  return "low";
}

const FLOW_LABELS: Record<EmailFlowId, string> = {
  welcome: "Welcome email",
  abandoned_cart: "Abandoned cart",
  post_purchase: "Post-purchase",
  win_back: "Win-back",
};

export function buildAutoCampaignRecommendations(input: {
  flows: { id: EmailFlowId; label: string; configured: boolean }[];
  ordersLast7d: number;
  churnRiskCount: number;
  openCarts: number;
  marketingConsentCount: number;
  newCustomers30d: number;
}): AutoCampaignRecommendation[] {
  const campaigns: AutoCampaignRecommendation[] = [];

  for (const flow of input.flows) {
    let audienceSize = 0;
    let trigger = "";
    let status: AutoCampaignRecommendation["status"] = "blocked";
    let estimatedLiftPercent = 0;
    let recommendation = "";
    const id = flow.id as AutoCampaignType;

    switch (flow.id) {
      case "welcome":
        audienceSize = input.newCustomers30d;
        trigger = "New storefront signup or first order";
        status = flow.configured && audienceSize > 0 ? "ready" : flow.configured ? "draft" : "blocked";
        estimatedLiftPercent = 8;
        recommendation =
          audienceSize > 0
            ? `Send welcome series to ${audienceSize} recent signup${audienceSize === 1 ? "" : "s"} — highlight bestsellers and loyalty.`
            : "Enable welcome flow before next acquisition push.";
        break;
      case "win_back":
        audienceSize = input.churnRiskCount;
        trigger = `Churn score ≥ ${AI_MARKETING_CHURN_WINBACK_THRESHOLD}`;
        status =
          flow.configured && audienceSize > 0
            ? "ready"
            : audienceSize > 0
              ? "draft"
              : "blocked";
        estimatedLiftPercent = 12;
        recommendation =
          audienceSize > 0
            ? `Target ${audienceSize} at-risk guest${audienceSize === 1 ? "" : "s"} with personalized offer — consent required.`
            : "No high-risk customers — monitor churn weekly.";
        break;
      case "post_purchase":
        audienceSize = input.ordersLast7d;
        trigger = "Order completed in last 7 days";
        status = flow.configured && input.ordersLast7d >= 5 ? "ready" : flow.configured ? "draft" : "blocked";
        estimatedLiftPercent = 6;
        recommendation =
          input.ordersLast7d >= 5
            ? `Follow up ${input.ordersLast7d} recent orders with review request and cross-sell.`
            : "Low order volume — queue post-purchase for next busy week.";
        break;
      case "abandoned_cart":
        audienceSize = input.openCarts;
        trigger = "Open cart with marketing consent";
        status =
          flow.configured && audienceSize > 0
            ? "ready"
            : audienceSize > 0
              ? "draft"
              : "blocked";
        estimatedLiftPercent = 15;
        recommendation =
          audienceSize > 0
            ? `Recover ${audienceSize} open cart${audienceSize === 1 ? "" : "s"} — 1h / 24h / 72h drip with optional discount.`
            : "No recoverable carts — promote checkout completion on storefront.";
        break;
    }

    if (input.marketingConsentCount === 0 && flow.id !== "welcome") {
      status = "blocked";
      recommendation = `${recommendation} Collect marketing consent before sending.`.trim();
    }

    campaigns.push({
      id,
      label: FLOW_LABELS[flow.id],
      channel: "email",
      audienceSize,
      trigger,
      status,
      severity: campaignSeverity(status, audienceSize),
      estimatedLiftPercent,
      recommendation,
    });
  }

  return campaigns.sort((left, right) => {
    const statusRank = { ready: 3, draft: 2, blocked: 1 };
    return statusRank[right.status] - statusRank[left.status] || right.audienceSize - left.audienceSize;
  });
}

function weatherPromoForMode(weather: DynamicPricingWeather): WeatherPromoRecommendation | null {
  const wx = weatherMultiplier(weather);
  if (wx.multiplier === 1) return null;

  switch (weather) {
    case "rain":
      return {
        id: `weather-${weather}`,
        weather,
        promoType: "delivery_boost",
        headline: "Rain day comfort promo",
        offer: "Free delivery on orders $30+",
        menuFocus: "Bowls, pasta, and delivery favorites",
        demandMultiplier: wx.multiplier,
        severity: "high",
        recommendation: "Push delivery bundle before dinner rush — rain lifts off-premise demand.",
      };
    case "heat":
      return {
        id: `weather-${weather}`,
        weather,
        promoType: "menu_bundle",
        headline: "Heat wave refresh deal",
        offer: "15% off cold drinks & salads combo",
        menuFocus: "Iced beverages, salads, lighter plates",
        demandMultiplier: wx.multiplier,
        severity: "normal",
        recommendation: "Feature cold items on storefront hero and email segment.",
      };
    case "cold":
      return {
        id: `weather-${weather}`,
        weather,
        promoType: "menu_bundle",
        headline: "Cold snap warm-up",
        offer: "Soup + main bundle at fixed price",
        menuFocus: "Soups, hot bowls, and comfort mains",
        demandMultiplier: wx.multiplier,
        severity: "normal",
        recommendation: "Highlight hot menu on social and win-back list for lapsed guests.",
      };
    default:
      return null;
  }
}

function eventPromoForDate(date: Date): WeatherPromoRecommendation | null {
  const evt = localEventMultiplier(date);
  if (!evt) return null;

  return {
    id: `event-${date.toISOString().slice(0, 10)}`,
    weather: "event",
    promoType: evt.label.includes("Holiday") ? "seasonal" : "loyalty_bonus",
    headline: evt.label,
    offer: evt.label.includes("Valentine")
      ? "Prix fixe for two — dessert included"
      : evt.label.includes("Holiday")
        ? "Festive family package — preorder window"
        : "Weekend loyalty double points",
    menuFocus: evt.detail,
    demandMultiplier: evt.multiplier,
    severity: evt.multiplier >= 1.06 ? "high" : "normal",
    recommendation: `Calendar signal: ${evt.detail}. Auto-schedule email blast 48h before peak.`,
  };
}

export function buildWeatherPromoRecommendations(
  date: Date,
  weather?: DynamicPricingWeather,
): WeatherPromoRecommendation[] {
  const mode = weather ?? inferWeatherFromDate(date);
  const promos: WeatherPromoRecommendation[] = [];

  const weatherPromo = weatherPromoForMode(mode);
  if (weatherPromo) promos.push(weatherPromo);

  const eventPromo = eventPromoForDate(date);
  if (eventPromo) promos.push(eventPromo);

  return promos.sort((left, right) => right.demandMultiplier - left.demandMultiplier);
}

export function buildMarketingManagerDailyBrief(input: {
  weather: DynamicPricingWeather;
  autoCampaigns: AutoCampaignRecommendation[];
  weatherPromos: WeatherPromoRecommendation[];
  ordersLast7d: number;
  analyzedAt: Date;
}): MarketingManagerDailyBrief {
  const readyCampaigns = input.autoCampaigns.filter((row) => row.status === "ready");
  const highSeverity =
    input.autoCampaigns.filter((row) => row.severity === "high" || row.severity === "critical").length +
    input.weatherPromos.filter((row) => row.severity === "high" || row.severity === "critical").length;

  const headline =
    highSeverity > 0
      ? `${highSeverity} high-priority marketing signal${highSeverity === 1 ? "" : "s"} — ${input.weather} weather mode`
      : readyCampaigns.length > 0
        ? `${readyCampaigns.length} campaign${readyCampaigns.length === 1 ? "" : "s"} ready to launch`
        : `Marketing baseline — ${input.ordersLast7d} orders in the last 7 days`;

  const executiveSummary =
    input.weatherPromos.length > 0
      ? `Weather and calendar signals suggest ${input.weatherPromos.length} promo opportunit${input.weatherPromos.length === 1 ? "y" : "ies"}. ${readyCampaigns.length} automated email flow${readyCampaigns.length === 1 ? " is" : "s are"} ready.`
      : `No weather uplift today (${input.weather}). Review automated flows and churn segments before the next peak.`;

  const bullets = [
    readyCampaigns[0]
      ? `Ready: ${readyCampaigns[0].label} — ${readyCampaigns[0].audienceSize} recipients`
      : null,
    input.weatherPromos[0] ? `Promo: ${input.weatherPromos[0].headline} — ${input.weatherPromos[0].offer}` : null,
    input.autoCampaigns.find((row) => row.id === "win_back" && row.audienceSize > 0)
      ? `Win-back: ${input.autoCampaigns.find((row) => row.id === "win_back")!.audienceSize} at-risk guests`
      : null,
    input.autoCampaigns.find((row) => row.id === "abandoned_cart" && row.audienceSize > 0)
      ? `Carts: ${input.autoCampaigns.find((row) => row.id === "abandoned_cart")!.audienceSize} open for recovery`
      : null,
    input.ordersLast7d > 0 ? `Volume: ${input.ordersLast7d} orders last 7 days` : null,
  ].filter((line): line is string => line != null);

  return {
    generatedAtIso: input.analyzedAt.toISOString(),
    headline,
    executiveSummary,
    bullets,
    weatherMode: input.weather,
    activeCampaignCount: readyCampaigns.length,
    weatherPromoCount: input.weatherPromos.length,
  };
}

export function buildMarketingManagerSnapshot(input: {
  workspaceId: string;
  klaviyoConfigured: boolean;
  ordersLast7d: number;
  churnRiskCount: number;
  openCarts: number;
  activeHolidayPackages: number;
  marketingConsentCount: number;
  newCustomers30d: number;
  flows: { id: EmailFlowId; label: string; configured: boolean }[];
  analyzedAt?: Date;
  weather?: DynamicPricingWeather;
}): MarketingManagerSnapshot {
  const analyzedAt = input.analyzedAt ?? new Date();
  const weather = input.weather ?? inferWeatherFromDate(analyzedAt);

  const autoCampaigns = buildAutoCampaignRecommendations({
    flows: input.flows,
    ordersLast7d: input.ordersLast7d,
    churnRiskCount: input.churnRiskCount,
    openCarts: input.openCarts,
    marketingConsentCount: input.marketingConsentCount,
    newCustomers30d: input.newCustomers30d,
  });

  const weatherPromos = buildWeatherPromoRecommendations(analyzedAt, weather);

  const alertCount =
    autoCampaigns.filter((row) => row.status === "ready").length + weatherPromos.length;

  const hasData =
    input.ordersLast7d > 0 ||
    input.churnRiskCount > 0 ||
    input.openCarts > 0 ||
    weatherPromos.length > 0;
  const confidence = round2(
    Math.min(0.9, (hasData ? 0.6 : 0.45) + (input.klaviyoConfigured ? 0.15 : 0) + alertCount * 0.03),
  );

  const dailyBrief = buildMarketingManagerDailyBrief({
    weather,
    autoCampaigns,
    weatherPromos,
    ordersLast7d: input.ordersLast7d,
    analyzedAt,
  });

  return {
    policyId: AI_MARKETING_MANAGER_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: analyzedAt.toISOString(),
    autoCampaigns,
    weatherPromos,
    dailyBrief,
    summary: {
      klaviyoConfigured: input.klaviyoConfigured,
      ordersLast7d: input.ordersLast7d,
      churnRiskCount: input.churnRiskCount,
      openCarts: input.openCarts,
      activeHolidayPackages: input.activeHolidayPackages,
      marketingConsentCount: input.marketingConsentCount,
      alertCount,
      confidence,
    },
    aiAssisted: true,
  };
}
