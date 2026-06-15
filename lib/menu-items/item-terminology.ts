import type { BusinessType } from "@prisma/client";

const UNIVERSAL_MENU_ITEMS_INTRO =
  "Create and manage the items you sell, prepare, pack, quote, or publish. Items can be used across menus, storefronts, sales channels, production, costing, and reports.";

export function getMenuItemsPageIntro(): string {
  return UNIVERSAL_MENU_ITEMS_INTRO;
}

export function getMenuItemsPageTitle(
  businessType: BusinessType | null | undefined,
): string {
  switch (businessType) {
    case "MEAL_PREP":
      return "Meals";
    case "RESTAURANT":
      return "Menu items";
    case "CAFE":
      return "Specials & items";
    case "BAR":
      return "Drinks & items";
    case "BAKERY":
      return "Baked goods";
    case "CATERING":
      return "Packages & items";
    default:
      return "Menu items";
  }
}

export function getMenuPlannerPageTitle(
  businessType: BusinessType | null | undefined,
): string {
  switch (businessType) {
    case "MEAL_PREP":
      return "Weekly menu planner";
    case "BAKERY":
      return "Preorder planner";
    case "CATERING":
      return "Event menu planner";
    case "CAFE":
      return "Daily specials planner";
    case "BAR":
      return "Drinks & events planner";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "Multi-brand menu planner";
    default:
      return "Menu planner";
  }
}

export type MenuItemsEmptyCopy = {
  title: string;
  description: string;
  primaryCta: string;
};

export function getMenuItemsEmptyStateCopy(
  businessType: BusinessType | null | undefined,
): MenuItemsEmptyCopy {
  switch (businessType) {
    case "BAR":
      return {
        title: "No drinks or items yet",
        description:
          "Add cocktails, beer, wine, non-alcoholic drinks, event packages, and add-ons.",
        primaryCta: "Add drink or item",
      };
    case "CAFE":
      return {
        title: "No specials or items yet",
        description:
          "Add drinks, baked goods, daily specials, and pickup items.",
        primaryCta: "Add café item",
      };
    case "BAKERY":
      return {
        title: "No baked goods yet",
        description:
          "Add breads, pastries, cakes, custom items, and preorder products.",
        primaryCta: "Add baked good",
      };
    case "CATERING":
      return {
        title: "No packages or items yet",
        description:
          "Add catering packages, trays, add-ons, and services for quotes and events.",
        primaryCta: "Add catering package",
      };
    case "MEAL_PREP":
      return {
        title: "No meals yet",
        description:
          "Add meals once, then reuse them across weekly menus, meal plans, production, packing, and nutrition labels.",
        primaryCta: "Add meal",
      };
    case "RESTAURANT":
    default:
      return {
        title: "No menu items yet",
        description:
          "Add dishes, drinks, sides, and add-ons. You can later assign them to menus, production stations, and sales channels.",
        primaryCta: "Add menu item",
      };
  }
}

export function getAddItemDialogTitle(
  businessType: BusinessType | null | undefined,
): string {
  const cta = getMenuItemsEmptyStateCopy(businessType).primaryCta;
  return cta.startsWith("Add ") ? `New ${cta.slice(4)}` : "New item";
}

export function getCreateItemSubmitLabel(
  businessType: BusinessType | null | undefined,
): string {
  return getMenuItemsEmptyStateCopy(businessType).primaryCta;
}

export function getEditItemSubmitLabel(): string {
  return "Save changes";
}
