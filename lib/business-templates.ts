import type { BusinessType } from "@prisma/client";

import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import { getBusinessModeExperience } from "@/lib/business-mode-registry";

export type QuickStartTemplateId =
  | "restaurant"
  | "cafe"
  | "bar"
  | "bakery"
  | "catering"
  | "meal_prep"
  | "ghost_kitchen";

export type QuickStartTemplate = {
  id: QuickStartTemplateId;
  title: string;
  description: string;
  businessType: BusinessType;
  demoSlug: DemoVerticalSlug;
};

export const QUICK_START_TEMPLATES: readonly QuickStartTemplate[] = [
  {
    id: "restaurant",
    title: "Restaurant starter",
    description: "Service-first orders, prep, costing, and integrations.",
    businessType: "RESTAURANT",
    demoSlug: "restaurant",
  },
  {
    id: "cafe",
    title: "Café starter",
    description: "Specials, retail pickup, CRM, and light production.",
    businessType: "CAFE",
    demoSlug: "cafe",
  },
  {
    id: "bar",
    title: "Bar starter",
    description: "Drinks menu, events, costing, and staff tasks.",
    businessType: "BAR",
    demoSlug: "bar",
  },
  {
    id: "bakery",
    title: "Bakery starter",
    description: "Preorder windows, batch production, labels, routes.",
    businessType: "BAKERY",
    demoSlug: "bakery",
  },
  {
    id: "catering",
    title: "Catering starter",
    description: "Quotes, calendar, production, logistics.",
    businessType: "CATERING",
    demoSlug: "catering",
  },
  {
    id: "meal_prep",
    title: "Meal prep starter",
    description: "Weekly menus, packing, nutrition labels, routes.",
    businessType: "MEAL_PREP",
    demoSlug: "meal-prep",
  },
  {
    id: "ghost_kitchen",
    title: "Ghost kitchen starter",
    description: "Brands, order hub, integrations, analytics.",
    businessType: "GHOST_KITCHEN",
    demoSlug: "ghost-kitchen",
  },
];

export function quickStartForBusinessType(
  businessType: BusinessType | null | undefined,
): QuickStartTemplate | undefined {
  const slug = getBusinessModeExperience(businessType).defaultDemoVertical;
  return QUICK_START_TEMPLATES.find((t) => t.demoSlug === slug);
}
