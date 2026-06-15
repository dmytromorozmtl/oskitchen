import type { BrandConceptKind, BrandLifecycleStatus } from "@prisma/client";

export type { BrandConceptKind, BrandLifecycleStatus };

export const BRAND_CONTEXT_STORAGE_KEY = "kitchenos.selectedBrandId";

/** Same-tab listeners for `BrandContextProvider` (localStorage does not fire `storage` in-tab). */
export const BRAND_CONTEXT_CHANGED_EVENT = "kitchenos-brand-context-changed";

export const BRAND_CONCEPT_LABELS: Record<BrandConceptKind, string> = {
  RESTAURANT_CONCEPT: "Restaurant concept",
  CAFE_CONCEPT: "Café concept",
  BAR_CONCEPT: "Bar concept",
  BAKERY_CONCEPT: "Bakery concept",
  CATERING_BRAND: "Catering brand",
  MEAL_PREP_BRAND: "Meal prep brand",
  GHOST_KITCHEN_BRAND: "Ghost kitchen brand",
  CLOUD_KITCHEN_BRAND: "Cloud kitchen brand",
  EVENT_BRAND: "Events brand",
  RETAIL_BRAND: "Retail brand",
  OTHER: "Other",
};

export const BRAND_LIFECYCLE_LABELS: Record<BrandLifecycleStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};
