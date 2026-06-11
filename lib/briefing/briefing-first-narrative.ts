import type { OwnerDailyBriefingIntegrationHealthSlice } from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import { BRIEFING_FIRST_NARRATIVE_EXAMPLE } from "@/lib/design/briefing-first-design-policy";

export type BriefingFirstNarrativeInput = {
  ordersToday: number;
  revenueToday: number;
  revenueWeek: number;
  ordersYesterday?: number;
  revenueYesterday?: number;
  posTransactionsToday: number;
  integrationHealth: OwnerDailyBriefingIntegrationHealthSlice | null;
  nextActionTitle: string;
};

export type BriefingFirstNarrativeSegments = {
  performance: string;
  insight: string;
  next: string;
  formatted: string;
};

const DELIVERY_PROVIDERS = new Set(["doordash", "uber_eats", "grubhub", "shopify", "woocommerce"]);

function formatSignedPct(pct: number): string {
  const rounded = Math.round(pct);
  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `${rounded}%`;
  return "flat";
}

function buildPerformanceSegment(input: BriefingFirstNarrativeInput): string {
  const revenueYesterday = input.revenueYesterday ?? 0;
  const ordersYesterday = input.ordersYesterday ?? 0;

  if (revenueYesterday > 0) {
    const pct = ((input.revenueToday - revenueYesterday) / revenueYesterday) * 100;
    return `Yesterday ${formatSignedPct(pct)}`;
  }

  if (ordersYesterday > 0) {
    const pct = ((input.ordersToday - ordersYesterday) / ordersYesterday) * 100;
    return `Yesterday ${formatSignedPct(pct)}`;
  }

  const weeklyBaseline = input.revenueWeek > 0 ? input.revenueWeek / 7 : 0;
  if (weeklyBaseline > 0 && input.revenueToday > 0) {
    const pct = ((input.revenueToday - weeklyBaseline) / weeklyBaseline) * 100;
    return `Today ${formatSignedPct(pct)}`;
  }

  if (input.ordersToday > 0) {
    return `Today ${input.ordersToday} orders`;
  }

  return "Today — no orders yet";
}

function resolveChannelInsight(input: BriefingFirstNarrativeInput): string {
  const connections = input.integrationHealth?.connections ?? [];
  const healthyDelivery = connections.find(
    (connection) =>
      !connection.hasError &&
      connection.status !== "ERROR" &&
      DELIVERY_PROVIDERS.has(connection.provider.toLowerCase()),
  );

  if (healthyDelivery) {
    return `${healthyDelivery.name} orders`;
  }

  const healthyConnection = connections.find(
    (connection) => !connection.hasError && connection.status !== "ERROR",
  );
  if (healthyConnection) {
    return `${healthyConnection.name} channel`;
  }

  if (input.posTransactionsToday > 0) {
    return "POS orders";
  }

  if (input.ordersToday > 0) {
    return "Orders across channels";
  }

  return "Connect a sales channel";
}

function formatNextSegment(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "review Today";
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45).trimEnd()}…`;
}

export function buildBriefingFirstNarrative(
  input: BriefingFirstNarrativeInput,
): BriefingFirstNarrativeSegments {
  const performance = buildPerformanceSegment(input);
  const insight = resolveChannelInsight(input);
  const next = formatNextSegment(input.nextActionTitle);
  const formatted = `${performance}. ${insight}. Next: ${next}.`;

  return { performance, insight, next, formatted };
}

/** Reference narrative used in design docs and empty-state fallbacks. */
export function briefingFirstNarrativeExample(): string {
  return BRIEFING_FIRST_NARRATIVE_EXAMPLE;
}
