import { addDays, startOfDay } from "date-fns";

import type { MenuStrategy } from "@prisma/client";

/**
 * Suggested calendar defaults when the operator skips fine-grained dates in the wizard.
 * All menus still persist `startDate`, `endDate`, and `preorderDeadline` for backward compatibility.
 */
export function suggestDefaultDatesForStrategy(strategy: MenuStrategy, anchor = new Date()) {
  const start = startOfDay(anchor);
  switch (strategy) {
    case "WEEKLY_PREORDER": {
      const end = addDays(start, 6);
      const preorder = addDays(start, -1);
      preorder.setHours(18, 0, 0, 0);
      return { startDate: start, endDate: end, preorderDeadline: preorder };
    }
    case "DAILY_MENU":
    case "CAFE_SPECIALS": {
      const end = start;
      const preorder = start;
      preorder.setHours(10, 0, 0, 0);
      return { startDate: start, endDate: end, preorderDeadline: preorder };
    }
    case "RESTAURANT_MENU":
    case "DRINKS_MENU":
    case "SEASONAL_MENU": {
      const end = addDays(start, 30);
      const preorder = start;
      preorder.setHours(12, 0, 0, 0);
      return { startDate: start, endDate: end, preorderDeadline: preorder };
    }
    case "BAKERY_PREORDER": {
      const end = addDays(start, 6);
      const preorder = addDays(start, -2);
      preorder.setHours(12, 0, 0, 0);
      return { startDate: start, endDate: end, preorderDeadline: preorder };
    }
    case "CATERING_PACKAGES":
    case "EVENT_MENU": {
      const end = addDays(start, 14);
      const preorder = addDays(start, -7);
      preorder.setHours(17, 0, 0, 0);
      return { startDate: start, endDate: end, preorderDeadline: preorder };
    }
    case "MULTI_BRAND_MENU": {
      const end = addDays(start, 13);
      const preorder = addDays(start, -1);
      preorder.setHours(20, 0, 0, 0);
      return { startDate: start, endDate: end, preorderDeadline: preorder };
    }
    default: {
      const end = addDays(start, 6);
      const preorder = addDays(start, -1);
      preorder.setHours(18, 0, 0, 0);
      return { startDate: start, endDate: end, preorderDeadline: preorder };
    }
  }
}

export function menuUsesStrictPreorder(strategy: MenuStrategy): boolean {
  return strategy === "WEEKLY_PREORDER" || strategy === "BAKERY_PREORDER" || strategy === "MULTI_BRAND_MENU";
}
