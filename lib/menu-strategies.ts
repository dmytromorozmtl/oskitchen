import type { BusinessType } from "@prisma/client";

import type { MenuStrategyId } from "@/lib/business-mode-registry";
import { getBusinessModeExperience } from "@/lib/business-mode-registry";

export type MenuStrategyDefinition = {
  id: MenuStrategyId;
  label: string;
  summary: string;
  storefrontBehavior: string;
  cutoffBehavior: string;
};

const DEFS: Record<MenuStrategyId, MenuStrategyDefinition> = {
  WEEKLY_PREORDER: {
    id: "WEEKLY_PREORDER",
    label: "Weekly preorder",
    summary: "Menus bound to calendar weeks with explicit preorder deadlines.",
    storefrontBehavior: "Highlights active week; hides off-window SKUs by policy.",
    cutoffBehavior: "Hard stop at menu.preorderDeadline; reminders tied to settings.",
  },
  DAILY_MENU: {
    id: "DAILY_MENU",
    label: "Daily menu",
    summary: "Day-part or daily availability without multi-week commitment.",
    storefrontBehavior: "Shows today/tomorrow lanes; optional sold-out flags.",
    cutoffBehavior: "Soft same-day cutoffs configured per channel.",
  },
  SEASONAL_MENU: {
    id: "SEASONAL_MENU",
    label: "Seasonal menu",
    summary: "Longer arcs (seasons, festivals) with fewer rotations.",
    storefrontBehavior: "Hero seasonal collections; archive past seasons.",
    cutoffBehavior: "Event-style deadlines per season block.",
  },
  EVENT_MENU: {
    id: "EVENT_MENU",
    label: "Event menu",
    summary: "One-off menus tied to calendar events.",
    storefrontBehavior: "Surfaces only during event windows.",
    cutoffBehavior: "Locks with calendar event start.",
  },
  CATERING_MENU: {
    id: "CATERING_MENU",
    label: "Catering packages",
    summary: "Package-based pricing with guest counts.",
    storefrontBehavior: "Quote-first or deposit flows — you control published pricing.",
    cutoffBehavior: "Business-defined lock before production day.",
  },
  DRINKS_MENU: {
    id: "DRINKS_MENU",
    label: "Drinks menu",
    summary: "Beverage-forward categories; responsible-service copy stays yours.",
    storefrontBehavior: "Emphasizes drinks; food as add-on.",
    cutoffBehavior: "Service-time based; no automated alcohol compliance claims.",
  },
  BAKERY_PREORDER: {
    id: "BAKERY_PREORDER",
    label: "Bakery preorder",
    summary: "Pickup slots, lead times, and batch windows.",
    storefrontBehavior: "Slot picker + product caps.",
    cutoffBehavior: "Lead time per SKU class; enforced at checkout where enabled.",
  },
  SPECIALS_MENU: {
    id: "SPECIALS_MENU",
    label: "Specials board",
    summary: "Rotating specials alongside stable retail SKUs.",
    storefrontBehavior: "Featured tiles for daily/weekly specials.",
    cutoffBehavior: "Cutoff per special or inherits menu default.",
  },
  MULTI_BRAND_MENU: {
    id: "MULTI_BRAND_MENU",
    label: "Multi-brand menu",
    summary: "Brand-scoped catalogs with shared kitchen primitives.",
    storefrontBehavior: "Brand switcher; routes map to brand lanes.",
    cutoffBehavior: "Per-brand deadlines supported via separate menus.",
  },
};

export function menuStrategyDefinition(id: MenuStrategyId): MenuStrategyDefinition {
  return DEFS[id];
}

export function menuStrategyForBusinessType(
  businessType: BusinessType | null | undefined,
): MenuStrategyDefinition {
  const id = getBusinessModeExperience(businessType).defaultMenuStrategy;
  return DEFS[id];
}
