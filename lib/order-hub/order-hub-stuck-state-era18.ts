import type { OrderHubExactTabCount } from "@/services/order-hub/order-hub-exact-counts-service";
import type { OrderHubPageData } from "@/services/order-hub/order-hub-service";
import {
  internalOrderMissingCustomerInfo,
  internalOrderMissingFulfillmentInfo,
} from "@/services/order-hub/order-triage-service";

export type OrderHubAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
};

export type OrderHubRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

type InternalOrderRow = OrderHubPageData["internalOrders"][number];

function tabCount(exactTabCounts: readonly OrderHubExactTabCount[], id: string): number {
  return exactTabCounts.find((r) => r.id === id)?.total ?? 0;
}

function tabHref(id: string): string {
  return `/dashboard/order-hub?tab=${id}`;
}

function orderTab(orderId: string, tab: string): string {
  return `/dashboard/orders/${orderId}?tab=${tab}`;
}

function internalOrderSyncFailed(o: InternalOrderRow): boolean {
  return (
    o.channelImportBatch?.status === "FAILED" || o.importedFromExternal?.syncStatus === "FAILED"
  );
}

/** Workspace-level stuck signals for the order hub attention strip (uses exact tab totals). */
export function pickOrderHubAttentionItems(input: {
  mappingBlockedCount: number;
  exactTabCounts: readonly OrderHubExactTabCount[];
}): OrderHubAttentionItem[] {
  const items: OrderHubAttentionItem[] = [];

  if (input.mappingBlockedCount > 0) {
    items.push({
      id: "mapping-conflicts",
      title: "Product mapping conflicts",
      detail: `${input.mappingBlockedCount} open conflict${input.mappingBlockedCount === 1 ? "" : "s"} block channel imports.`,
      href: "/dashboard/product-mapping/unmapped",
      priority: 1,
    });
  }

  const failed = tabCount(input.exactTabCounts, "failed");
  if (failed > 0) {
    items.push({
      id: "sync-failed",
      title: "Channel sync failures",
      detail: `${failed} order row${failed === 1 ? "" : "s"} need sync or import recovery.`,
      href: tabHref("failed"),
      priority: 2,
    });
  }

  const needsReview = tabCount(input.exactTabCounts, "needs_review");
  if (needsReview > 0) {
    items.push({
      id: "needs-review",
      title: "Orders need review",
      detail: `${needsReview} pending row${needsReview === 1 ? "" : "s"} awaiting confirmation or import.`,
      href: tabHref("needs_review"),
      priority: 3,
    });
  }

  const missingFulfillment = tabCount(input.exactTabCounts, "missing_fulfillment_info");
  if (missingFulfillment > 0) {
    items.push({
      id: "missing-fulfillment",
      title: "Missing fulfillment details",
      detail: `${missingFulfillment} order${missingFulfillment === 1 ? "" : "s"} need a service date or delivery address.`,
      href: tabHref("missing_fulfillment_info"),
      priority: 4,
    });
  }

  const missingCustomer = tabCount(input.exactTabCounts, "missing_customer_info");
  if (missingCustomer > 0) {
    items.push({
      id: "missing-customer",
      title: "Missing customer contact",
      detail: `${missingCustomer} order${missingCustomer === 1 ? "" : "s"} need a name plus email or phone.`,
      href: tabHref("missing_customer_info"),
      priority: 5,
    });
  }

  const needsMapping = tabCount(input.exactTabCounts, "needs_mapping");
  if (needsMapping > 0) {
    items.push({
      id: "needs-mapping",
      title: "Imported orders need mapping",
      detail: `${needsMapping} pending import${needsMapping === 1 ? "" : "s"} may still need SKU mapping.`,
      href: tabHref("needs_mapping"),
      priority: 6,
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

/** Lightweight row hint — aligned with triage heuristics, not full blocker service. */
export function resolveInternalOrderHubRowNextAction(
  o: InternalOrderRow,
  input?: { paymentFailed?: boolean; paymentPending?: boolean },
): OrderHubRowNextAction | null {
  if (o.status === "COMPLETED" || o.status === "CANCELLED") return null;

  if (internalOrderSyncFailed(o)) {
    return {
      label: "Fix channel sync",
      href: o.channelImportBatch
        ? `/dashboard/sales-channels/imports/${o.channelImportBatch.id}`
        : tabHref("failed"),
      tone: "urgent",
    };
  }

  if (input?.paymentFailed) {
    return {
      label: "Review payment failure",
      href: orderTab(o.id, "overview"),
      tone: "urgent",
    };
  }

  if (input?.paymentPending) {
    return {
      label: "Review payment status",
      href: orderTab(o.id, "overview"),
      tone: "normal",
    };
  }

  if (internalOrderMissingFulfillmentInfo(o)) {
    return {
      label: o.fulfillmentType === "DELIVERY" ? "Add delivery address" : "Set service date",
      href: orderTab(o.id, "fulfillment"),
      tone: "urgent",
    };
  }

  if (internalOrderMissingCustomerInfo(o)) {
    return {
      label: "Add customer contact",
      href: orderTab(o.id, "customer"),
      tone: "normal",
    };
  }

  if (o.status === "PENDING" && o.channelImportBatchId) {
    return {
      label: "Review channel import",
      href: o.channelImportBatch
        ? `/dashboard/sales-channels/imports/${o.channelImportBatch.id}`
        : orderTab(o.id, "overview"),
      tone: "normal",
    };
  }

  if (o.status === "PENDING") {
    return {
      label: "Confirm order",
      href: orderTab(o.id, "overview"),
      tone: "normal",
    };
  }

  if (o.status === "CONFIRMED") {
    return {
      label: "Send to production",
      href: orderTab(o.id, "production"),
      tone: "normal",
    };
  }

  if (o.status === "PREPARING") {
    return {
      label: "Mark ready",
      href: orderTab(o.id, "overview"),
      tone: "normal",
    };
  }

  if (o.status === "READY") {
    return {
      label: "Complete handoff",
      href: orderTab(o.id, "overview"),
      tone: "normal",
    };
  }

  return null;
}
