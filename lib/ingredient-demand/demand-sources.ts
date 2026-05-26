import type { BusinessType } from "@prisma/client";

import type { DemandSourceType } from "./types";

export type DemandSourceMeta = {
  id: DemandSourceType;
  label: string;
  description: string;
  defaultEnabled: boolean;
  defaultConfidence: number;
  /** Rough guidance for which verticals usually enable this source first. */
  relevantBusinessTypes: BusinessType[];
};

export const DEMAND_SOURCE_CATALOG: DemandSourceMeta[] = [
  {
    id: "CONFIRMED_ORDERS",
    label: "Confirmed orders",
    description: "Kitchen-confirmed and in-flight fulfillment orders with pickup or prep dates.",
    defaultEnabled: true,
    defaultConfidence: 1,
    relevantBusinessTypes: [
      "MEAL_PREP",
      "RESTAURANT",
      "CATERING",
      "BAKERY",
      "CAFE",
      "BAR",
      "GHOST_KITCHEN",
      "CLOUD_KITCHEN",
      "MULTI_BRAND",
      "OTHER",
    ],
  },
  {
    id: "DRAFT_ORDERS",
    label: "Draft / pending orders",
    description: "Pending orders — useful for soft prep before confirmation.",
    defaultEnabled: false,
    defaultConfidence: 0.55,
    relevantBusinessTypes: ["MEAL_PREP", "RESTAURANT", "CATERING", "GHOST_KITCHEN"],
  },
  {
    id: "STOREFRONT_PREORDERS",
    label: "Storefront preorders",
    description: "Same order table, filtered when storefront / preorder signals exist on the order.",
    defaultEnabled: true,
    defaultConfidence: 0.85,
    relevantBusinessTypes: ["MEAL_PREP", "BAKERY", "CAFE", "GHOST_KITCHEN", "OTHER"],
  },
  {
    id: "PRODUCTION_PLAN",
    label: "Production plan",
    description: "Planned batches and work items with product links and production dates.",
    defaultEnabled: true,
    defaultConfidence: 0.9,
    relevantBusinessTypes: [
      "MEAL_PREP",
      "RESTAURANT",
      "BAKERY",
      "CATERING",
      "BAR",
      "GHOST_KITCHEN",
      "CLOUD_KITCHEN",
      "MULTI_BRAND",
      "OTHER",
    ],
  },
  {
    id: "MENU_FORECAST",
    label: "Menu forecast",
    description: "Planned menu quantities (stub — wire menu planner forecasts when available).",
    defaultEnabled: false,
    defaultConfidence: 0.4,
    relevantBusinessTypes: ["RESTAURANT", "CAFE", "BAR", "GHOST_KITCHEN", "MULTI_BRAND"],
  },
  {
    id: "CATERING_EVENTS",
    label: "Catering events",
    description: "Guest counts and packages (stub — link catering event models when present).",
    defaultEnabled: false,
    defaultConfidence: 0.75,
    relevantBusinessTypes: ["CATERING"],
  },
  {
    id: "BAKERY_BATCHES",
    label: "Bakery batches",
    description: "Batch-oriented production (uses production plan with bakery-oriented modes).",
    defaultEnabled: false,
    defaultConfidence: 0.85,
    relevantBusinessTypes: ["BAKERY"],
  },
  {
    id: "BAR_PREP",
    label: "Bar prep",
    description: "Batch cocktail / garnish prep (uses production plan + bar modes).",
    defaultEnabled: false,
    defaultConfidence: 0.8,
    relevantBusinessTypes: ["BAR"],
  },
  {
    id: "CAFE_SPECIALS",
    label: "Café specials",
    description: "Daily specials channel (stub — tie to specials catalog when shipped).",
    defaultEnabled: false,
    defaultConfidence: 0.5,
    relevantBusinessTypes: ["CAFE"],
  },
  {
    id: "MANUAL_PLAN",
    label: "Manual plan",
    description: "Planner-entered quantities independent of live orders (stub).",
    defaultEnabled: false,
    defaultConfidence: 0.6,
    relevantBusinessTypes: ["MEAL_PREP", "RESTAURANT", "CATERING", "GHOST_KITCHEN"],
  },
  {
    id: "HISTORICAL_FORECAST",
    label: "Historical forecast",
    description: "Prior-period mix projection (stub — connect analytics service later).",
    defaultEnabled: false,
    defaultConfidence: 0.35,
    relevantBusinessTypes: ["RESTAURANT", "CAFE", "BAR", "GHOST_KITCHEN", "CLOUD_KITCHEN", "MULTI_BRAND"],
  },
];

export function sourceMeta(id: DemandSourceType): DemandSourceMeta | undefined {
  return DEMAND_SOURCE_CATALOG.find((s) => s.id === id);
}
