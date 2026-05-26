/** Logical label kinds for templates and printed records (not DB enum). */
export const LABEL_TYPES = [
  "ITEM",
  "CUSTOMER_BAG",
  "ORDER",
  "ROUTE",
  "ALLERGEN",
  "NUTRITION",
  "CATERING_TRAY",
  "BAKERY_ITEM",
  "PICKUP",
  "DELIVERY",
] as const;

export type LabelTypeId = (typeof LABEL_TYPES)[number];

export const LABEL_SIZES = ["4x6", "2x3", "2x1", "LETTER", "CUSTOM"] as const;
export type LabelSizeId = (typeof LABEL_SIZES)[number];
