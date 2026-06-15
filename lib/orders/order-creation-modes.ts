import type { FulfillmentDetailKey } from "@/lib/orders/order-fulfillment";
import type { OrderCreationType } from "@/lib/orders/order-types";
import type { OrderStatusKey } from "@/lib/orders/order-status";
import type { PaymentModeKey } from "@/lib/orders/order-payment";

export type OrderCreationModeConfig = {
  /** Order type key. */
  type: OrderCreationType;
  /** Whether to allow building line items from the active weekly menu. */
  allowsActiveMenu: boolean;
  /** Whether to allow line items from any catalog menu. */
  allowsCatalog: boolean;
  /** Whether to allow free-form custom line items. */
  allowsCustomLines: boolean;
  /** Whether the catering quote selector should appear. */
  allowsCateringQuote: boolean;
  /** Whether a meal plan cycle selector should appear. */
  allowsMealPlanCycle: boolean;
  /** Default fulfillment for this mode. */
  defaultFulfillment: FulfillmentDetailKey;
  /** Allowed fulfillment options for this mode. */
  allowedFulfillments: FulfillmentDetailKey[];
  /** Default status. */
  defaultStatus: OrderStatusKey;
  /** Allowed statuses for the initial save. */
  allowedStatuses: OrderStatusKey[];
  /** Default payment mode. */
  defaultPaymentMode: PaymentModeKey;
  /** Whether an active weekly menu is strictly required. */
  requiresActiveWeeklyMenu: boolean;
};

const ALL_NON_CHANNEL_STATUSES: OrderStatusKey[] = [
  "DRAFT",
  "REQUESTED",
  "CONFIRMED",
];

export const ORDER_CREATION_MODES: Record<OrderCreationType, OrderCreationModeConfig> = {
  MANUAL_ORDER: {
    type: "MANUAL_ORDER",
    allowsActiveMenu: true,
    allowsCatalog: true,
    allowsCustomLines: true,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "PICKUP",
    allowedFulfillments: ["PICKUP", "DELIVERY", "DINE_IN", "CUSTOM"],
    defaultStatus: "CONFIRMED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "PAY_LATER",
    requiresActiveWeeklyMenu: false,
  },
  PREORDER: {
    type: "PREORDER",
    allowsActiveMenu: true,
    allowsCatalog: false,
    allowsCustomLines: false,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "PICKUP",
    allowedFulfillments: ["PICKUP", "DELIVERY"],
    defaultStatus: "CONFIRMED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "PAY_LATER",
    requiresActiveWeeklyMenu: true,
  },
  RESTAURANT_ORDER: {
    type: "RESTAURANT_ORDER",
    allowsActiveMenu: true,
    allowsCatalog: true,
    allowsCustomLines: true,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "PICKUP",
    allowedFulfillments: ["PICKUP", "DELIVERY", "DINE_IN"],
    defaultStatus: "CONFIRMED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "PAY_LATER",
    requiresActiveWeeklyMenu: false,
  },
  CAFE_ORDER: {
    type: "CAFE_ORDER",
    allowsActiveMenu: true,
    allowsCatalog: true,
    allowsCustomLines: true,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "PICKUP",
    allowedFulfillments: ["PICKUP", "DINE_IN"],
    defaultStatus: "CONFIRMED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "CASH",
    requiresActiveWeeklyMenu: false,
  },
  BAKERY_ORDER: {
    type: "BAKERY_ORDER",
    allowsActiveMenu: false,
    allowsCatalog: true,
    allowsCustomLines: true,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "PICKUP",
    allowedFulfillments: ["PICKUP", "DELIVERY"],
    defaultStatus: "CONFIRMED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "PAY_LATER",
    requiresActiveWeeklyMenu: false,
  },
  BAR_EVENT_ORDER: {
    type: "BAR_EVENT_ORDER",
    allowsActiveMenu: false,
    allowsCatalog: true,
    allowsCustomLines: true,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "EVENT_DELIVERY",
    allowedFulfillments: ["EVENT_DELIVERY", "PICKUP", "CUSTOM"],
    defaultStatus: "REQUESTED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "MANUAL_INVOICE",
    requiresActiveWeeklyMenu: false,
  },
  CATERING_ORDER: {
    type: "CATERING_ORDER",
    allowsActiveMenu: false,
    allowsCatalog: true,
    allowsCustomLines: true,
    allowsCateringQuote: true,
    allowsMealPlanCycle: false,
    defaultFulfillment: "EVENT_DELIVERY",
    allowedFulfillments: ["EVENT_DELIVERY", "CATERING_LOADOUT", "PICKUP"],
    defaultStatus: "REQUESTED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "MANUAL_INVOICE",
    requiresActiveWeeklyMenu: false,
  },
  MEAL_PLAN_ORDER: {
    type: "MEAL_PLAN_ORDER",
    allowsActiveMenu: true,
    allowsCatalog: true,
    allowsCustomLines: false,
    allowsCateringQuote: false,
    allowsMealPlanCycle: true,
    defaultFulfillment: "DELIVERY",
    allowedFulfillments: ["DELIVERY", "PICKUP"],
    defaultStatus: "DRAFT",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "PAY_LATER",
    requiresActiveWeeklyMenu: false,
  },
  STOREFRONT_ORDER: {
    type: "STOREFRONT_ORDER",
    allowsActiveMenu: false,
    allowsCatalog: false,
    allowsCustomLines: false,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "PICKUP",
    allowedFulfillments: ["PICKUP", "DELIVERY"],
    defaultStatus: "REQUESTED",
    allowedStatuses: ["REQUESTED", "CONFIRMED"],
    defaultPaymentMode: "REQUEST_ONLY",
    requiresActiveWeeklyMenu: false,
  },
  SALES_CHANNEL_ORDER: {
    type: "SALES_CHANNEL_ORDER",
    allowsActiveMenu: false,
    allowsCatalog: false,
    allowsCustomLines: false,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "PICKUP",
    allowedFulfillments: ["PICKUP", "DELIVERY", "THIRD_PARTY_DELIVERY"],
    defaultStatus: "REQUESTED",
    allowedStatuses: ["REQUESTED", "CONFIRMED"],
    defaultPaymentMode: "PAID_EXTERNALLY",
    requiresActiveWeeklyMenu: false,
  },
  CUSTOM_ORDER: {
    type: "CUSTOM_ORDER",
    allowsActiveMenu: false,
    allowsCatalog: true,
    allowsCustomLines: true,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "CUSTOM",
    allowedFulfillments: ["CUSTOM", "PICKUP", "DELIVERY", "EVENT_DELIVERY"],
    defaultStatus: "REQUESTED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "REQUEST_ONLY",
    requiresActiveWeeklyMenu: false,
  },
  POS_SALE: {
    type: "POS_SALE",
    allowsActiveMenu: true,
    allowsCatalog: true,
    allowsCustomLines: true,
    allowsCateringQuote: false,
    allowsMealPlanCycle: false,
    defaultFulfillment: "PICKUP",
    allowedFulfillments: ["PICKUP", "DINE_IN", "DELIVERY"],
    defaultStatus: "CONFIRMED",
    allowedStatuses: ALL_NON_CHANNEL_STATUSES,
    defaultPaymentMode: "CASH",
    requiresActiveWeeklyMenu: false,
  },
};

export function modeFor(type: OrderCreationType): OrderCreationModeConfig {
  return ORDER_CREATION_MODES[type];
}
