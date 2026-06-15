import type { BusinessType } from "@prisma/client";

import type { OnboardingChannelIntent, OperatingModelId } from "@/lib/onboarding/onboarding-types";
import type { ModuleKey } from "@/lib/module-visibility";

/** Quick Start step 1 — maps to `BusinessType` + menu template. */
export type QuickStartRestaurantType =
  | "full_service"
  | "qsr"
  | "bakery"
  | "bar"
  | "ghost_kitchen"
  | "catering"
  | "food_truck";

/** Pre-built cuisine menu templates (10) — includes quick-start types + pizza, sushi, coffee. */
export type OnboardingMenuTemplateId =
  | QuickStartRestaurantType
  | "pizza"
  | "sushi"
  | "coffee_shop";

export const ONBOARDING_MENU_TEMPLATE_IDS = [
  "full_service",
  "qsr",
  "bakery",
  "bar",
  "ghost_kitchen",
  "catering",
  "food_truck",
  "pizza",
  "sushi",
  "coffee_shop",
] as const satisfies readonly OnboardingMenuTemplateId[];

/** Quick Start step 2 — order intake channels. */
export type QuickStartChannel = "pos" | "qr" | "website" | "delivery_apps" | "all";

export type QuickStartMenuItemInput = {
  name: string;
  price: number;
  category: string;
};

export type QuickStartConfig = {
  restaurantType: QuickStartRestaurantType;
  channels: QuickStartChannel[];
  firstItems: QuickStartMenuItemInput[];
  businessName?: string;
  skipTemplateItems?: boolean;
};

export type MenuTemplateItem = {
  name: string;
  price: number;
  category: string;
  description?: string;
};

export type MenuTemplate = {
  id: OnboardingMenuTemplateId;
  title: string;
  description: string;
  businessType: BusinessType;
  operatingModel: OperatingModelId;
  menuTitle: string;
  categories: readonly string[];
  items: readonly MenuTemplateItem[];
};

export const ONBOARDING_MENU_TEMPLATE_OPTIONS: {
  id: OnboardingMenuTemplateId;
  label: string;
  description: string;
  icon: string;
}[] = [
  { id: "full_service", label: "Full service", description: "15-item dine-in menu", icon: "🍽️" },
  { id: "qsr", label: "Quick service", description: "10-item counter menu", icon: "🍔" },
  { id: "bakery", label: "Bakery", description: "10 pastries & coffee", icon: "🥐" },
  { id: "bar", label: "Bar & lounge", description: "12 drinks & bar bites", icon: "🍸" },
  { id: "ghost_kitchen", label: "Ghost kitchen", description: "8 delivery bowls", icon: "👻" },
  { id: "catering", label: "Catering", description: "6 packages & trays", icon: "🎉" },
  { id: "food_truck", label: "Food truck", description: "8 handheld favorites", icon: "🚚" },
  { id: "pizza", label: "Pizza", description: "8 pies & sides", icon: "🍕" },
  { id: "sushi", label: "Sushi", description: "12 rolls & nigiri", icon: "🍣" },
  { id: "coffee_shop", label: "Coffee shop", description: "10 drinks & bites", icon: "☕" },
];

export type QuickStartApplyResult = {
  success: true;
  nextUrl: string;
  menuId: string;
  productCount: number;
  enabledModuleKeys: ModuleKey[];
  channelIntents: OnboardingChannelIntent[];
};

export const QUICK_START_RESTAURANT_OPTIONS: {
  id: QuickStartRestaurantType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "full_service",
    label: "Full service",
    description: "Dine-in, tables, full menu & kitchen display.",
    icon: "🍽️",
  },
  {
    id: "qsr",
    label: "Quick service (QSR)",
    description: "Counter, fast tickets, high-volume POS.",
    icon: "🍔",
  },
  {
    id: "bakery",
    label: "Bakery & pastry",
    description: "Preorders, batches, retail pickup.",
    icon: "🥐",
  },
  {
    id: "bar",
    label: "Bar & lounge",
    description: "Drinks-forward menu, tabs, late service.",
    icon: "🍸",
  },
  {
    id: "ghost_kitchen",
    label: "Ghost kitchen",
    description: "Delivery-first brands, order hub.",
    icon: "👻",
  },
  {
    id: "catering",
    label: "Catering",
    description: "Events, quotes, production lists.",
    icon: "🎉",
  },
  {
    id: "food_truck",
    label: "Food truck",
    description: "Handheld menu, POS, simple prep.",
    icon: "🚚",
  },
];

export const QUICK_START_CHANNEL_OPTIONS: {
  id: QuickStartChannel;
  label: string;
  description: string;
}[] = [
  {
    id: "pos",
    label: "POS terminal",
    description: "Ring up orders at the counter or handheld.",
  },
  {
    id: "qr",
    label: "QR code ordering",
    description: "Table QR → menu → kitchen (table service).",
  },
  {
    id: "website",
    label: "Website / storefront",
    description: "OS Kitchen online ordering page.",
  },
  {
    id: "delivery_apps",
    label: "Delivery apps",
    description: "Uber, DoorDash, Shopify — connect in Sales channels.",
  },
  {
    id: "all",
    label: "All of the above",
    description: "Enable POS, storefront, kitchen, and integrations.",
  },
];
