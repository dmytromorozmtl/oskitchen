import type { BusinessType } from "@prisma/client";

import { getBusinessModeExperience } from "@/lib/business-mode-registry";

export type KpiDefinition = {
  id: string;
  label: string;
  description: string;
};

const UNIVERSAL: readonly KpiDefinition[] = [
  { id: "orders_today", label: "Orders today", description: "Count of orders created today." },
  { id: "revenue_7d", label: "Revenue (7d)", description: "Paid pipeline revenue for the rolling week." },
  { id: "tasks_open", label: "Open tasks", description: "Operational follow-ups not completed." },
  { id: "integration_errors", label: "Integration errors", description: "Connections in error state." },
];

const BY_MODE: Partial<Record<BusinessType, readonly KpiDefinition[]>> = {
  MEAL_PREP: [
    { id: "preorder_fill", label: "Preorder fill", description: "Share of capacity sold vs plan." },
    { id: "route_coverage", label: "Route coverage", description: "Stops scheduled vs orders needing delivery." },
    { id: "label_queue", label: "Label queue", description: "Nutrition / pack labels still pending." },
  ],
  RESTAURANT: [
    { id: "prep_completion", label: "Prep completion", description: "Production tasks finished for service window." },
    { id: "top_items", label: "Top menu items", description: "Best sellers by revenue or count." },
    { id: "shortages", label: "Shortage risk", description: "Signals from ingredient demand vs on-hand." },
  ],
  CAFE: [
    { id: "specials_mix", label: "Specials mix", description: "Share of revenue from rotating specials." },
    { id: "pickup_wait", label: "Pickup throughput", description: "Pickup orders vs on-time handoff." },
  ],
  BAR: [
    { id: "pour_margin", label: "Pour margin", description: "Margin after recipe costing discipline." },
    { id: "event_pipeline", label: "Event pipeline", description: "Open quotes / deposits for private events." },
  ],
  BAKERY: [
    { id: "slot_utilization", label: "Pickup slot fill", description: "Booked slots vs offered capacity." },
    { id: "batch_yield", label: "Batch yield", description: "Planned vs actual sellable units." },
  ],
  CATERING: [
    { id: "quote_conversion", label: "Quote conversion", description: "Accepted quotes vs sent." },
    { id: "guest_counts", label: "Guest counts", description: "Upcoming headcount vs production plan." },
  ],
  GHOST_KITCHEN: [
    { id: "brand_mix", label: "Brand mix", description: "Revenue share across virtual brands." },
    { id: "aggregator_health", label: "Aggregator health", description: "Webhook / sync backlog signals." },
  ],
  CLOUD_KITCHEN: [
    { id: "location_load", label: "Location load", description: "Orders per kitchen site vs capacity." },
  ],
  MULTI_BRAND: [
    { id: "portfolio_margin", label: "Portfolio margin", description: "Blended margin across concepts." },
  ],
};

export function kpisForBusinessType(
  businessType: BusinessType | null | undefined,
): readonly KpiDefinition[] {
  const mode = businessType ?? "MEAL_PREP";
  const extra = BY_MODE[mode] ?? [];
  return [...UNIVERSAL, ...extra];
}

export function kpiIdsForDashboardWidgets(
  businessType: BusinessType | null | undefined,
): readonly string[] {
  return getBusinessModeExperience(businessType).defaultDashboardWidgets;
}
