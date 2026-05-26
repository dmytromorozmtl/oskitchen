/**
 * Creation / channel source persisted on `Order.creationSource` (varchar).
 * Keep aligned with `order-creation-service` writes.
 */
export const ORDER_CREATION_SOURCES = [
  "MANUAL",
  "POS",
  "STOREFRONT",
  "CHANNEL_IMPORT",
  "MEAL_PLAN",
  "CATERING",
] as const;
export type OrderCreationSource = (typeof ORDER_CREATION_SOURCES)[number];

/** POS operational subtypes (future: persist on order or in `sourceMetadataJson.pos`). */
export const POS_OPERATIONAL_SUBTYPES = [
  "POS_SALE",
  "POS_WALK_IN",
  "POS_PICKUP",
  "POS_READY_NOW",
  "POS_MADE_TO_ORDER",
  "POS_CATERING_PICKUP",
  "POS_MEAL_REDEMPTION_PLACEHOLDER",
] as const;
export type PosOperationalSubtype = (typeof POS_OPERATIONAL_SUBTYPES)[number];
