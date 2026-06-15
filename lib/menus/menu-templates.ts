import type { MenuStrategy } from "@prisma/client";

import { suggestDefaultDatesForStrategy } from "@/lib/menus/menu-availability";
import { menuStrategyDefinition } from "@/lib/menus/menu-strategies";

export const MENU_TEMPLATE_IDS = [
  "meal_prep_weekly",
  "restaurant_lunch_dinner",
  "cafe_daily_specials",
  "bar_drinks_happy_hour",
  "bakery_weekend_preorder",
  "catering_corporate_lunch",
  "catering_event_packages",
  "ghost_brand_menu",
] as const;

export type MenuTemplateId = (typeof MENU_TEMPLATE_IDS)[number];

export type MenuTemplatePayload = {
  title: string;
  description: string | null;
  strategy: MenuStrategy;
  startDate: Date;
  endDate: Date;
  preorderDeadline: Date;
  displaySettingsJson?: Record<string, unknown>;
  availabilityJson?: Record<string, unknown>;
  fulfillmentRulesJson?: Record<string, unknown>;
};

export function menuTemplatePayload(id: MenuTemplateId): MenuTemplatePayload {
  const anchor = new Date();
  const base = (strategy: MenuStrategy, title: string, description: string | null) => {
    const d = suggestDefaultDatesForStrategy(strategy, anchor);
    const def = menuStrategyDefinition(strategy);
    return {
      title,
      description,
      strategy,
      startDate: d.startDate,
      endDate: d.endDate,
      preorderDeadline: d.preorderDeadline,
      displaySettingsJson: {
        templateId: id,
        defaultCategories: [...def.defaultCategories],
        defaultSections: [...def.defaultSections],
      },
    };
  };

  switch (id) {
    case "meal_prep_weekly":
      return {
        ...base("WEEKLY_PREORDER", "Meal prep — weekly template", "Sample weekly preorder scaffold — adjust dates and items."),
      };
    case "restaurant_lunch_dinner":
      return {
        ...base("RESTAURANT_MENU", "Restaurant — lunch & dinner", "Starter / mains / desserts scaffold."),
      };
    case "cafe_daily_specials":
      return {
        ...base("CAFE_SPECIALS", "Café — daily specials", "Pastries, sandwiches, and drinks blocks."),
      };
    case "bar_drinks_happy_hour":
      return {
        ...base("DRINKS_MENU", "Bar — drinks + happy hour", "Cocktails, beer, wine, NA, happy hour."),
        availabilityJson: { happyHourExample: "17:00-19:00" },
      };
    case "bakery_weekend_preorder":
      return {
        ...base("BAKERY_PREORDER", "Bakery — weekend preorder", "Pickup-focused weekend window."),
        fulfillmentRulesJson: { leadTimeHours: 48, pickupSlots: true },
      };
    case "catering_corporate_lunch":
      return {
        ...base("CATERING_PACKAGES", "Catering — corporate lunch packages", "Per-person packages — pair with quotes."),
        fulfillmentRulesJson: { quoteDefault: true },
      };
    case "catering_event_packages":
      return {
        ...base("EVENT_MENU", "Catering — event packages", "Reception + dinner blocks for events."),
      };
    case "ghost_brand_menu": {
      const d = suggestDefaultDatesForStrategy("MULTI_BRAND_MENU", anchor);
      const def = menuStrategyDefinition("MULTI_BRAND_MENU");
      return {
        title: "Ghost kitchen — brand lane",
        description: "Virtual brand menu scaffold — attach brand in settings when ready.",
        strategy: "MULTI_BRAND_MENU",
        startDate: d.startDate,
        endDate: d.endDate,
        preorderDeadline: d.preorderDeadline,
        displaySettingsJson: {
          templateId: id,
          defaultCategories: [...def.defaultCategories],
        },
      };
    }
  }
}

export function menuTemplateLabel(id: MenuTemplateId): string {
  switch (id) {
    case "meal_prep_weekly":
      return "Meal prep weekly menu";
    case "restaurant_lunch_dinner":
      return "Restaurant lunch / dinner";
    case "cafe_daily_specials":
      return "Café daily specials";
    case "bar_drinks_happy_hour":
      return "Bar drinks + happy hour";
    case "bakery_weekend_preorder":
      return "Bakery weekend preorder";
    case "catering_corporate_lunch":
      return "Catering corporate lunch packages";
    case "catering_event_packages":
      return "Catering event packages";
    case "ghost_brand_menu":
      return "Ghost kitchen brand menu";
  }
}
