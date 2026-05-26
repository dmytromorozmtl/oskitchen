import type { OrderStatus } from "@prisma/client";

import { isPlaceholderKitchenOsEmail } from "@/lib/customers/customer-display";
import { requiresScheduledServiceDate } from "@/lib/fulfillment/fulfillment-requirements";
import { ORDER_HUB_TABS, type OrderHubTabId } from "@/lib/order-hub/order-hub-status";
import type { OrderHubPageData } from "@/services/order-hub/order-hub-service";

export type { OrderHubTabId };
export { ORDER_HUB_TABS };

export type OrderHubTabCountRow = {
  id: OrderHubTabId;
  label: string;
  internal: number;
  external: number;
  total: number;
};

type InternalOrderRow = OrderHubPageData["internalOrders"][number];
type ExternalOrderRow = OrderHubPageData["externalOrders"][number];

function isTerminalOrderStatus(s: OrderStatus): boolean {
  return s === "COMPLETED" || s === "CANCELLED";
}

/** POS counter walk-in with synthetic email — not a “missing customer” triage row. */
function isPosWalkInGuestPlaceholder(o: InternalOrderRow): boolean {
  return (
    o.creationSource === "POS" &&
    o.orderType === "POS_SALE" &&
    isPlaceholderKitchenOsEmail(o.customerEmail)
  );
}

/** Mirrors `order-blocker-service` customer rules for hub triage (no per-order Prisma). */
export function internalOrderMissingCustomerInfo(o: InternalOrderRow): boolean {
  if (isTerminalOrderStatus(o.status)) return false;
  if (isPosWalkInGuestPlaceholder(o)) return false;
  if (!o.customerName?.trim()) return true;
  const emailTrim = o.customerEmail?.trim() ?? "";
  const phoneTrim = o.customerPhone?.trim() ?? "";
  if (!isPlaceholderKitchenOsEmail(emailTrim) && !emailTrim && !phoneTrim) return true;
  return false;
}

/** Delivery address + scheduled service date requirements (aligned with fulfillment blockers). */
export function internalOrderMissingFulfillmentInfo(o: InternalOrderRow): boolean {
  if (isTerminalOrderStatus(o.status)) return false;
  if (o.fulfillmentType === "DELIVERY" && o.deliveryAddressJson == null) return true;
  const needsDate = requiresScheduledServiceDate({
    status: o.status,
    orderType: o.orderType,
    creationSource: o.creationSource,
    fulfillmentType: o.fulfillmentType,
    fulfillmentDetail: o.fulfillmentDetail,
    pickupDate: o.pickupDate,
    deliveryAddressJson: o.deliveryAddressJson,
    sourceMetadataJson: o.sourceMetadataJson,
  });
  return Boolean(needsDate && o.pickupDate == null);
}

export function filterInternalOrders(tab: string, data: OrderHubPageData["internalOrders"]) {
  const t = ORDER_HUB_TABS.some((x) => x.id === tab) ? (tab as OrderHubTabId) : "all";
  switch (t) {
    case "pos":
      return data.filter((o) => o.creationSource === "POS" || o.orderType === "POS_SALE");
    case "needs_review":
      return data.filter((o) => o.status === "PENDING");
    case "needs_mapping":
      return data.filter((o) => Boolean(o.channelImportBatchId) && o.status === "PENDING");
    case "missing_customer_info":
      return data.filter((o) => internalOrderMissingCustomerInfo(o));
    case "missing_fulfillment_info":
      return data.filter((o) => internalOrderMissingFulfillmentInfo(o));
    case "ready_for_production":
      return data.filter((o) => o.status === "CONFIRMED");
    case "in_production":
      return data.filter((o) => o.status === "PREPARING");
    case "packing":
      return data.filter((o) => o.status === "READY");
    case "fulfillment":
      return data.filter(
        (o) => o.fulfillmentType === "DELIVERY" && (o.status === "READY" || o.status === "PREPARING"),
      );
    case "completed":
      return data.filter((o) => o.status === "COMPLETED");
    case "failed":
      return data.filter(
        (o) =>
          o.channelImportBatch?.status === "FAILED" ||
          o.importedFromExternal?.syncStatus === "FAILED",
      );
    default:
      return data;
  }
}

function externalMissingCustomer(o: ExternalOrderRow): boolean {
  if (o.syncStatus !== "PENDING") return false;
  const nameOk = o.customerName?.trim();
  const email = o.customerEmail?.trim() ?? "";
  const phone = o.customerPhone?.trim() ?? "";
  if (!nameOk) return true;
  if (!email && !phone) return true;
  return false;
}

function externalMissingFulfillment(o: ExternalOrderRow): boolean {
  if (o.syncStatus !== "PENDING") return false;
  if (o.fulfillmentType === "DELIVERY" && o.deliveryAddressJson == null) return true;
  if (o.fulfillmentType === "PICKUP" && o.pickupTime == null) return true;
  return false;
}

export function filterExternalOrders(tab: string, data: OrderHubPageData["externalOrders"]) {
  const t = ORDER_HUB_TABS.some((x) => x.id === tab) ? (tab as OrderHubTabId) : "all";
  if (t === "failed") {
    return data.filter((o) => o.syncStatus === "FAILED");
  }
  if (t === "needs_review") {
    return data.filter((o) => o.syncStatus === "PENDING");
  }
  if (t === "missing_customer_info") {
    return data.filter((o) => externalMissingCustomer(o));
  }
  if (t === "missing_fulfillment_info") {
    return data.filter((o) => externalMissingFulfillment(o));
  }
  if (t === "pos") {
    return [];
  }
  return t === "all" ? data : [];
}

/** In-memory triage counts for the latest hub fetch (bounded lists from `loadOrderHubPageData`). */
export function computeOrderHubTabCounts(data: OrderHubPageData): OrderHubTabCountRow[] {
  return ORDER_HUB_TABS.map((tab) => {
    const internal = filterInternalOrders(tab.id, data.internalOrders).length;
    const external = filterExternalOrders(tab.id, data.externalOrders).length;
    return { id: tab.id, label: tab.label, internal, external, total: internal + external };
  });
}
