import type { BusinessType } from "@prisma/client";

import type { StorefrontTemplateId } from "@/lib/business-mode-registry";
import { getBusinessModeExperience } from "@/lib/business-mode-registry";

export type StorefrontTemplateDefinition = {
  id: StorefrontTemplateId;
  label: string;
  homepageFocus: string;
  ctaStrategy: string;
  fulfillmentDefault: string;
  seoDefault: string;
  legalNote: string;
};

const DEFS: Record<StorefrontTemplateId, StorefrontTemplateDefinition> = {
  RESTAURANT_ONLINE_MENU: {
    id: "RESTAURANT_ONLINE_MENU",
    label: "Restaurant online menu",
    homepageFocus: "Menu-first hero, hours, reservation or takeout CTA.",
    ctaStrategy: "Primary: order or call; secondary: directions.",
    fulfillmentDefault: "Pickup + delivery toggles per your policy.",
    seoDefault: "Menu schema, locality, cuisine keywords.",
    legalNote: "You supply allergen and alcohol disclaimers where applicable.",
  },
  CAFE_DAILY_SPECIALS: {
    id: "CAFE_DAILY_SPECIALS",
    label: "Café daily specials",
    homepageFocus: "Specials tiles + coffee retail highlights.",
    ctaStrategy: "Preorder pickup + visit us CTA.",
    fulfillmentDefault: "Pickup windows; limited delivery radius optional.",
    seoDefault: "Neighborhood café keywords, hours, breakfast intent.",
    legalNote: "Nutrition claims only when you attach data.",
  },
  BAR_EVENTS_DRINKS: {
    id: "BAR_EVENTS_DRINKS",
    label: "Bar events & drinks",
    homepageFocus: "Events + drinks menu; inquiry for private bookings.",
    ctaStrategy: "Primary: inquiry / deposit; secondary: menu browse.",
    fulfillmentDefault: "Usually on-premise service; delivery only if legally allowed.",
    seoDefault: "Venue + nightlife intent; event landing pages.",
    legalNote: "Age gating and liquor laws are your responsibility.",
  },
  BAKERY_PREORDER: {
    id: "BAKERY_PREORDER",
    label: "Bakery preorder",
    homepageFocus: "Pickup slots, lead times, hero SKUs.",
    ctaStrategy: "Preorder CTA with slot selection.",
    fulfillmentDefault: "Pickup-first; delivery optional.",
    seoDefault: "Local bakery + preorder keywords.",
    legalNote: "Allergen statements must match your labels.",
  },
  CATERING_INQUIRY: {
    id: "CATERING_INQUIRY",
    label: "Catering inquiry",
    homepageFocus: "Package cards + inquiry form.",
    ctaStrategy: "Quote request before checkout.",
    fulfillmentDefault: "Manual confirmation workflow.",
    seoDefault: "Corporate / wedding intent pages.",
    legalNote: "Deposits and contracts remain off-platform unless you wire them.",
  },
  MEAL_PREP_WEEKLY: {
    id: "MEAL_PREP_WEEKLY",
    label: "Meal prep weekly menu",
    homepageFocus: "Week selector + cutoff timer.",
    ctaStrategy: "Preorder for next prep day.",
    fulfillmentDefault: "Pickup routes or hub pickup; subscription friendly.",
    seoDefault: "Weekly meal prep + city terms.",
    legalNote: "Macro/nutrition claims require your substantiation.",
  },
  GHOST_MULTI_BRAND: {
    id: "GHOST_MULTI_BRAND",
    label: "Ghost kitchen multi-brand",
    homepageFocus: "Brand chooser + shared cart rules per your setup.",
    ctaStrategy: "Delivery-first CTAs per brand.",
    fulfillmentDefault: "Aggregator handoff; align with Order hub.",
    seoDefault: "Per-brand landing paths; avoid duplicate thin content.",
    legalNote: "Brand disclosure requirements are yours to meet.",
  },
};

export function storefrontTemplateDefinition(id: StorefrontTemplateId): StorefrontTemplateDefinition {
  return DEFS[id];
}

export function storefrontTemplateForBusinessType(
  businessType: BusinessType | null | undefined,
): StorefrontTemplateDefinition {
  const id = getBusinessModeExperience(businessType).defaultStorefrontTemplate;
  return DEFS[id];
}
