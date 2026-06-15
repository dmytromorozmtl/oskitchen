/**
 * Operational FoodOps lifecycle — TypeScript layer on top of Prisma `OrderStatus`
 * (`PENDING` | `CONFIRMED` | `PREPARING` | `READY` | `COMPLETED` | `CANCELLED`) and
 * related rows (production work, packing, routes, imports). Persisted enum is not expanded here.
 */

export type OrderLifecycleStage =
  | "DRAFT"
  | "REQUESTED"
  | "CONFIRMED"
  | "NEEDS_REVIEW"
  | "NEEDS_MAPPING"
  | "NEEDS_CUSTOMER_INFO"
  | "NEEDS_FULFILLMENT_INFO"
  | "NEEDS_PAYMENT_REVIEW"
  | "READY_FOR_PRODUCTION"
  | "PRODUCTION_PLANNED"
  | "IN_PRODUCTION"
  | "PRODUCTION_COMPLETE"
  | "READY_FOR_PACKING"
  | "PACKING"
  | "PACKED"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED"
  | "ON_HOLD"
  | "FAILED";

export type OrderPaymentOpsStatus =
  | "NOT_REQUIRED"
  | "REQUEST_ONLY"
  | "PAY_LATER"
  | "PAID_EXTERNALLY"
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "FAILED"
  | "REFUNDED_PLACEHOLDER";

export type OrderFulfillmentOpsStatus =
  | "NOT_SET"
  | "PICKUP_SCHEDULED"
  | "DELIVERY_SCHEDULED"
  | "DINE_IN"
  | "EVENT_DELIVERY"
  | "ROUTE_REQUIRED"
  | "ROUTE_ASSIGNED"
  | "COMPLETED";

export type OrderBlockerCode =
  | "MISSING_ITEMS"
  | "UNMAPPED_PRODUCTS"
  | "MISSING_CUSTOMER"
  | "MISSING_EMAIL_OR_PHONE"
  | "MISSING_DELIVERY_ADDRESS"
  | "MISSING_FULFILLMENT_DATE"
  | "MISSING_PICKUP_WINDOW"
  | "PRODUCTION_NOT_COMPLETE"
  | "PACKING_NOT_COMPLETE"
  | "ROUTE_NOT_ASSIGNED"
  | "PAYMENT_REVIEW_REQUIRED"
  | "INTEGRATION_ERROR"
  | "IMPORT_ERROR"
  | "POS_TRANSACTION_MISSING"
  | "RECEIPT_MISSING";

export type OrderBlockerSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type OrderBlocker = {
  code: OrderBlockerCode;
  label: string;
  explanation: string;
  severity: OrderBlockerSeverity;
  fixHref: string;
  recommendedAction: string;
};

export type OrderLifecycleIntent =
  | "CONFIRM"
  | "SEND_TO_PRODUCTION"
  | "MARK_PRODUCTION_DONE"
  | "SEND_TO_PACKING"
  | "MARK_PACKED"
  | "ASSIGN_ROUTE"
  | "MARK_READY"
  | "COMPLETE"
  | "CANCEL"
  | "HOLD"
  | "RESUME";

export type OrderLifecycleDeriveInput = {
  dbStatus: import("@prisma/client").OrderStatus;
  fulfillmentType: import("@prisma/client").FulfillmentType;
  /** Widened fulfillment detail (pickup / dine_in / …) — drives POS + scheduling rules. */
  fulfillmentDetail: string | null;
  orderType: string | null;
  creationSource: string | null;
  sourceMetadataJson: unknown;
  paymentStatus: string | null;
  paymentMode: string | null;
  pickupDate: Date | null;
  deliveryAddressJson: unknown | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  orderItemsCount: number;
  hasUnmappedChannelLines: boolean;
  productionWorkIncomplete: boolean;
  packingIncomplete: boolean;
  hasDeliveryStops: boolean;
  externalSyncFailed: boolean;
  importBatchFailed: boolean;
  onHoldDetail: boolean;
};
