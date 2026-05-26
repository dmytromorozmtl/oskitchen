import type { BusinessType } from "@prisma/client";

import { resolveBusinessType } from "@/lib/business-modes";

export type MenuCenterCopy = {
  pageTitle: string;
  pageSubtitle: string;
  itemsWord: string;
  publishedWord: string;
};

const COPY: Record<BusinessType, MenuCenterCopy> = {
  MEAL_PREP: {
    pageTitle: "Weekly menus",
    pageSubtitle:
      "Plan preorder windows, prepared dates, and attach meals so kitchen, packing, and routes stay aligned.",
    itemsWord: "Meals",
    publishedWord: "Live weekly menu",
  },
  RESTAURANT: {
    pageTitle: "Menus",
    pageSubtitle: "Build menus by category, control availability, and publish to your storefront or channels.",
    itemsWord: "Menu items",
    publishedWord: "Live on storefront",
  },
  CAFE: {
    pageTitle: "Daily specials & menus",
    pageSubtitle: "Plan dayparts, pastries, drinks, and pickup-friendly specials.",
    itemsWord: "Specials & items",
    publishedWord: "Live specials",
  },
  BAR: {
    pageTitle: "Drinks & events menu",
    pageSubtitle: "Drinks lists, happy hour, and private-event menus — keep service and compliance accurate.",
    itemsWord: "Drinks & items",
    publishedWord: "Live menu",
  },
  BAKERY: {
    pageTitle: "Preorder menus",
    pageSubtitle: "Lead times, pickup slots, and batch-friendly baked goods.",
    itemsWord: "Baked goods",
    publishedWord: "Preorder live",
  },
  CATERING: {
    pageTitle: "Catering menus",
    pageSubtitle: "Package menus for quotes, guest counts, and event production timelines.",
    itemsWord: "Packages",
    publishedWord: "Published for quotes",
  },
  GHOST_KITCHEN: {
    pageTitle: "Brand menus",
    pageSubtitle: "Separate lanes per virtual brand while sharing one kitchen.",
    itemsWord: "Menu items",
    publishedWord: "Live brand menu",
  },
  CLOUD_KITCHEN: {
    pageTitle: "Brand menus",
    pageSubtitle: "Cloud lanes with channel-aware merchandising.",
    itemsWord: "Menu items",
    publishedWord: "Live brand menu",
  },
  MULTI_BRAND: {
    pageTitle: "Multi-brand menus",
    pageSubtitle: "Portfolio menus with brand-aware publishing and production.",
    itemsWord: "Menu items",
    publishedWord: "Live menu",
  },
  OTHER: {
    pageTitle: "Menus",
    pageSubtitle: "Create menus for your operating style — weekly, daily, packages, or events.",
    itemsWord: "Items",
    publishedWord: "Published",
  },
};

export function menuCenterCopy(businessType: BusinessType | null | undefined): MenuCenterCopy {
  return COPY[resolveBusinessType(businessType)];
}
