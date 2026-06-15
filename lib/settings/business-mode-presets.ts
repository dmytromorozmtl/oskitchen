import type { BusinessType } from "@prisma/client";

/**
 * Lightweight per-mode hints for the Settings Center workspace section.
 * The deep module recommendations still live in `lib/business-mode-registry.ts`.
 */
export type BusinessModePreset = {
  type: BusinessType;
  label: string;
  tagline: string;
  recommendedTerminology: { orders: string; menu: string; production: string };
  defaults: {
    sameDayOrders: boolean;
    deliveryEnabled: boolean;
    requireApprovalForCateringOrders: boolean;
    preorderRequiresMenu: boolean;
  };
};

export const BUSINESS_MODE_PRESETS: readonly BusinessModePreset[] = [
  {
    type: "MEAL_PREP",
    label: "Meal prep",
    tagline: "Weekly menus, subscriptions, nutrition, routes, recurring production.",
    recommendedTerminology: { orders: "Subscriptions", menu: "Weekly menu", production: "Production run" },
    defaults: { sameDayOrders: false, deliveryEnabled: true, requireApprovalForCateringOrders: false, preorderRequiresMenu: true },
  },
  {
    type: "CATERING",
    label: "Catering",
    tagline: "Quotes, events, headcount, equipment, on-site logistics.",
    recommendedTerminology: { orders: "Events", menu: "Catering menu", production: "Event prep" },
    defaults: { sameDayOrders: false, deliveryEnabled: true, requireApprovalForCateringOrders: true, preorderRequiresMenu: false },
  },
  {
    type: "GHOST_KITCHEN",
    label: "Ghost kitchen",
    tagline: "Channels, virtual brands, channel imports, dispatch focus.",
    recommendedTerminology: { orders: "Channel orders", menu: "Brand menu", production: "Kitchen ticket" },
    defaults: { sameDayOrders: true, deliveryEnabled: true, requireApprovalForCateringOrders: false, preorderRequiresMenu: false },
  },
  {
    type: "CLOUD_KITCHEN",
    label: "Cloud kitchen",
    tagline: "Multi-brand commissary, batched routing, ops dashboards.",
    recommendedTerminology: { orders: "Tickets", menu: "Brand menu", production: "Production line" },
    defaults: { sameDayOrders: true, deliveryEnabled: true, requireApprovalForCateringOrders: false, preorderRequiresMenu: false },
  },
  {
    type: "MULTI_BRAND",
    label: "Multi-brand operator",
    tagline: "Per-brand branding, storefronts, KPIs, permissions.",
    recommendedTerminology: { orders: "Orders", menu: "Brand menu", production: "Brand production" },
    defaults: { sameDayOrders: true, deliveryEnabled: true, requireApprovalForCateringOrders: true, preorderRequiresMenu: false },
  },
  {
    type: "BAKERY",
    label: "Bakery",
    tagline: "Daily bake, pre-order, custom cakes, retail pick-up.",
    recommendedTerminology: { orders: "Orders", menu: "Today's bake", production: "Bake list" },
    defaults: { sameDayOrders: false, deliveryEnabled: false, requireApprovalForCateringOrders: false, preorderRequiresMenu: true },
  },
  {
    type: "RESTAURANT",
    label: "Restaurant",
    tagline: "Dine-in, takeout, reservations, daily specials.",
    recommendedTerminology: { orders: "Tickets", menu: "Menu", production: "Line" },
    defaults: { sameDayOrders: true, deliveryEnabled: false, requireApprovalForCateringOrders: false, preorderRequiresMenu: false },
  },
  {
    type: "CAFE",
    label: "Café",
    tagline: "Counter service, retail, light prep, loyalty.",
    recommendedTerminology: { orders: "Tickets", menu: "Menu", production: "Counter prep" },
    defaults: { sameDayOrders: true, deliveryEnabled: false, requireApprovalForCateringOrders: false, preorderRequiresMenu: false },
  },
  {
    type: "BAR",
    label: "Bar / lounge",
    tagline: "Events, tabs, alcohol inventory, reservations.",
    recommendedTerminology: { orders: "Tabs", menu: "Menu", production: "Bar prep" },
    defaults: { sameDayOrders: true, deliveryEnabled: false, requireApprovalForCateringOrders: false, preorderRequiresMenu: false },
  },
  {
    type: "OTHER",
    label: "Other",
    tagline: "Flexible defaults; pick the modules you actually use.",
    recommendedTerminology: { orders: "Orders", menu: "Menu", production: "Production" },
    defaults: { sameDayOrders: false, deliveryEnabled: false, requireApprovalForCateringOrders: false, preorderRequiresMenu: true },
  },
];

export function getBusinessModePreset(type: BusinessType | null | undefined): BusinessModePreset {
  return BUSINESS_MODE_PRESETS.find((p) => p.type === type) ?? BUSINESS_MODE_PRESETS[0]!;
}
