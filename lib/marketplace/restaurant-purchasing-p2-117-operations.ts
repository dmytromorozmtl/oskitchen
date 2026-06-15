/**
 * Pure helpers for restaurant purchasing marketplace (Blueprint P2-117).
 */

import { RESTAURANT_PURCHASING_P2_117_POLICY_ID } from "@/lib/marketplace/restaurant-purchasing-p2-117-policy";

export type PurchasingCapabilityBlock = {
  id: string;
  label: string;
  status: "ready" | "partial" | "missing";
  summary: string;
  count: number;
};

export type RestaurantPurchasingReport = {
  policyId: typeof RESTAURANT_PURCHASING_P2_117_POLICY_ID;
  compareOfferCount: number;
  recurringOrderCount: number;
  activeSubstitutionCount: number;
  inTransitDeliveryCount: number;
  openDisputeCount: number;
  blocks: PurchasingCapabilityBlock[];
  readinessScore: number;
};

function blockStatus(count: number): "ready" | "partial" | "missing" {
  if (count >= 3) return "ready";
  if (count >= 1) return "partial";
  return "missing";
}

export function buildCompareSuppliersBlock(count: number): PurchasingCapabilityBlock {
  return {
    id: "compare-suppliers",
    label: "Compare suppliers",
    status: blockStatus(count),
    count,
    summary:
      count > 0
        ? `${count} comparable offer(s) across vendors — verify MOQ and lead time before PO`
        : "No compare data — browse catalog and add SKUs to compare lane",
  };
}

export function buildRecurringOrdersBlock(count: number): PurchasingCapabilityBlock {
  return {
    id: "recurring-orders",
    label: "Recurring orders",
    status: blockStatus(count),
    count,
    summary:
      count > 0
        ? `${count} active recurring schedule(s) — review approval gates before auto-run`
        : "No recurring orders — save a staple cart and schedule weekly or monthly",
  };
}

export function buildSubstitutionsBlock(count: number): PurchasingCapabilityBlock {
  return {
    id: "substitutions",
    label: "Substitutions",
    status: count > 0 ? "partial" : "missing",
    count,
    summary:
      count > 0
        ? `${count} suggested substitute(s) for backorder SKUs — approve before checkout`
        : "No substitution suggestions — substitutes appear when items go backorder",
  };
}

export function buildDeliveryTrackingBlock(count: number): PurchasingCapabilityBlock {
  return {
    id: "delivery-tracking",
    label: "Delivery tracking",
    status: blockStatus(count),
    count,
    summary:
      count > 0
        ? `${count} PO(s) with confirmed delivery in next 72h — verify receiving window`
        : "No in-transit deliveries — tracking appears after vendor confirms PO",
  };
}

export function buildDisputesBlock(count: number): PurchasingCapabilityBlock {
  return {
    id: "disputes",
    label: "Disputes",
    status: count > 0 ? "partial" : "ready",
    count,
    summary:
      count > 0
        ? `${count} open dispute(s) — platform review in progress, not vendor-only chat`
        : "No open disputes — receiving issues route through PO dispute workflow",
  };
}

export function computePurchasingReadinessScore(blocks: PurchasingCapabilityBlock[]): number {
  if (blocks.length === 0) return 0;
  const weights = { ready: 1, partial: 0.5, missing: 0 };
  const total = blocks.reduce((sum, block) => sum + weights[block.status], 0);
  return Math.round((total / blocks.length) * 100);
}

export function buildRestaurantPurchasingReport(input: {
  compareOfferCount?: number;
  recurringOrderCount?: number;
  activeSubstitutionCount?: number;
  inTransitDeliveryCount?: number;
  openDisputeCount?: number;
}): RestaurantPurchasingReport {
  const compareOfferCount = input.compareOfferCount ?? 0;
  const recurringOrderCount = input.recurringOrderCount ?? 0;
  const activeSubstitutionCount = input.activeSubstitutionCount ?? 0;
  const inTransitDeliveryCount = input.inTransitDeliveryCount ?? 0;
  const openDisputeCount = input.openDisputeCount ?? 0;

  const blocks = [
    buildCompareSuppliersBlock(compareOfferCount),
    buildRecurringOrdersBlock(recurringOrderCount),
    buildSubstitutionsBlock(activeSubstitutionCount),
    buildDeliveryTrackingBlock(inTransitDeliveryCount),
    buildDisputesBlock(openDisputeCount),
  ];

  return {
    policyId: RESTAURANT_PURCHASING_P2_117_POLICY_ID,
    compareOfferCount,
    recurringOrderCount,
    activeSubstitutionCount,
    inTransitDeliveryCount,
    openDisputeCount,
    blocks,
    readinessScore: computePurchasingReadinessScore(blocks),
  };
}

export function buildRestaurantPurchasingDemoReport(): RestaurantPurchasingReport {
  return buildRestaurantPurchasingReport({
    compareOfferCount: 12,
    recurringOrderCount: 4,
    activeSubstitutionCount: 2,
    inTransitDeliveryCount: 3,
    openDisputeCount: 1,
  });
}

export function hasActivePurchasingWorkflow(report: RestaurantPurchasingReport): boolean {
  return (
    report.compareOfferCount > 0 ||
    report.recurringOrderCount > 0 ||
    report.inTransitDeliveryCount > 0
  );
}
