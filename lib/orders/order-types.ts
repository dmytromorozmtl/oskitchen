export const ORDER_CREATION_TYPES = [
  "MANUAL_ORDER",
  "PREORDER",
  "RESTAURANT_ORDER",
  "CAFE_ORDER",
  "BAKERY_ORDER",
  "BAR_EVENT_ORDER",
  "CATERING_ORDER",
  "MEAL_PLAN_ORDER",
  "STOREFRONT_ORDER",
  "SALES_CHANNEL_ORDER",
  "CUSTOM_ORDER",
  "POS_SALE",
] as const;
export type OrderCreationType = (typeof ORDER_CREATION_TYPES)[number];

export const ORDER_TYPE_LABEL: Record<OrderCreationType, string> = {
  MANUAL_ORDER: "Manual order",
  PREORDER: "Weekly preorder",
  RESTAURANT_ORDER: "Restaurant order",
  CAFE_ORDER: "Café order",
  BAKERY_ORDER: "Bakery custom order",
  BAR_EVENT_ORDER: "Bar event / private booking",
  CATERING_ORDER: "Catering / event order",
  MEAL_PLAN_ORDER: "Meal plan order",
  STOREFRONT_ORDER: "Storefront order",
  SALES_CHANNEL_ORDER: "Sales channel order",
  CUSTOM_ORDER: "Custom request",
  POS_SALE: "POS / counter sale",
};

export const ORDER_TYPE_DESCRIPTION: Record<OrderCreationType, string> = {
  MANUAL_ORDER: "Capture a one-off order with any catalog or custom items. No menu cycle required.",
  PREORDER: "Take a weekly preorder against the currently active weekly menu.",
  RESTAURANT_ORDER: "Quick pickup / delivery / dine-in order from the restaurant catalog.",
  CAFE_ORDER: "Quick café order for pickup or window service.",
  BAKERY_ORDER: "Custom bakery item (cake, large order) with a prepared date.",
  BAR_EVENT_ORDER: "Private booking or event with a package or custom line.",
  CATERING_ORDER: "Multi-item catering / event order with delivery and setup notes.",
  MEAL_PLAN_ORDER: "Order derived from an active meal plan cycle for a recurring customer.",
  STOREFRONT_ORDER: "Imported from a public storefront request; reconcile only.",
  SALES_CHANNEL_ORDER: "Imported from WooCommerce / Shopify / Uber Eats; reconcile only.",
  CUSTOM_ORDER: "Free-form request that doesn't fit the other shapes.",
  POS_SALE: "Walk-in or counter sale captured from the POS Terminal — uses your catalog like manual orders.",
};

/**
 * For UI rendering — which types are user-creatable from the Order
 * Creation Center vs. read-only mirrors of an external source.
 */
export const USER_CREATABLE_ORDER_TYPES: OrderCreationType[] = [
  "MANUAL_ORDER",
  "PREORDER",
  "RESTAURANT_ORDER",
  "CAFE_ORDER",
  "BAKERY_ORDER",
  "BAR_EVENT_ORDER",
  "CATERING_ORDER",
  "MEAL_PLAN_ORDER",
  "CUSTOM_ORDER",
  "POS_SALE",
];

export const ORDER_TYPE_REQUIRES_ACTIVE_WEEKLY_MENU: Record<OrderCreationType, boolean> = {
  MANUAL_ORDER: false,
  PREORDER: true,
  RESTAURANT_ORDER: false,
  CAFE_ORDER: false,
  BAKERY_ORDER: false,
  BAR_EVENT_ORDER: false,
  CATERING_ORDER: false,
  MEAL_PLAN_ORDER: false,
  STOREFRONT_ORDER: false,
  SALES_CHANNEL_ORDER: false,
  CUSTOM_ORDER: false,
  POS_SALE: false,
};
