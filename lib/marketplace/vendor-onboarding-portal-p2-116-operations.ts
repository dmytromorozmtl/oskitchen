/**
 * Pure helpers for vendor onboarding portal (Blueprint P2-116).
 */

import { VENDOR_PLAN_OPTIONS } from "@/lib/marketplace/vendor-settings-types";
import { VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID } from "@/lib/marketplace/vendor-onboarding-portal-p2-116-policy";

export type VendorOnboardingPortalBlock = {
  id: string;
  label: string;
  status: "ready" | "partial" | "missing";
  summary: string;
};

export type VendorOnboardingPortalReport = {
  policyId: typeof VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID;
  vendorId: string | null;
  companyName: string;
  vendorStatus: string;
  planTier: string;
  commissionRatePct: number;
  catalogSkuCount: number;
  activeSkuCount: number;
  deliveryZoneCount: number;
  orderCutoffTime: string | null;
  minimumMoq: number;
  averageMoq: number;
  blocks: VendorOnboardingPortalBlock[];
  readinessScore: number;
};

export function buildCatalogImportBlock(input: {
  catalogSkuCount: number;
  activeSkuCount: number;
}): VendorOnboardingPortalBlock {
  const status =
    input.activeSkuCount > 0 ? "ready" : input.catalogSkuCount > 0 ? "partial" : "missing";
  return {
    id: "catalog-import",
    label: "Catalog import",
    status,
    summary:
      input.activeSkuCount > 0
        ? `${input.activeSkuCount} live SKUs · ${input.catalogSkuCount} total in catalog`
        : input.catalogSkuCount > 0
          ? `${input.catalogSkuCount} SKUs pending review — submit for platform approval`
          : "No SKUs imported — add products in vendor cabinet",
  };
}

export function buildPricingTierBlock(input: {
  planTier: string;
  commissionRatePct: number;
}): VendorOnboardingPortalBlock {
  const tier = VENDOR_PLAN_OPTIONS.find((opt) => opt.value === input.planTier);
  return {
    id: "pricing-tiers",
    label: "Pricing tiers",
    status: tier ? "ready" : "partial",
    summary: tier
      ? `${tier.label} tier · ${input.commissionRatePct}% commission — ${tier.detail}`
      : `${input.planTier} tier · ${input.commissionRatePct}% commission`,
  };
}

export function buildDeliveryZonesBlock(input: { deliveryZoneCount: number }): VendorOnboardingPortalBlock {
  return {
    id: "delivery-zones",
    label: "Delivery zones",
    status: input.deliveryZoneCount > 0 ? "ready" : "missing",
    summary:
      input.deliveryZoneCount > 0
        ? `${input.deliveryZoneCount} delivery zone(s) configured`
        : "No delivery zones — add service areas in vendor settings",
  };
}

export function buildCutoffTimeBlock(input: { orderCutoffTime: string | null }): VendorOnboardingPortalBlock {
  return {
    id: "cutoff-times",
    label: "Cutoff times",
    status: input.orderCutoffTime ? "ready" : "missing",
    summary: input.orderCutoffTime
      ? `Same-day cutoff at ${input.orderCutoffTime} — verify timezone with vendor`
      : "No cutoff time set — buyers may order until end of day",
  };
}

export function buildMoqBlock(input: { minimumMoq: number; averageMoq: number }): VendorOnboardingPortalBlock {
  return {
    id: "moq",
    label: "Minimum order quantity",
    status: input.minimumMoq > 0 ? "ready" : "missing",
    summary:
      input.minimumMoq > 1
        ? `MOQ from ${input.minimumMoq} units · avg ${input.averageMoq} across catalog`
        : `MOQ ${input.minimumMoq} (unit-level) · avg ${input.averageMoq} across catalog`,
  };
}

export function computeReadinessScore(blocks: VendorOnboardingPortalBlock[]): number {
  if (blocks.length === 0) return 0;
  const weights = { ready: 1, partial: 0.5, missing: 0 };
  const total = blocks.reduce((sum, block) => sum + weights[block.status], 0);
  return Math.round((total / blocks.length) * 100);
}

export function buildVendorOnboardingPortalReport(input: {
  vendorId?: string | null;
  companyName: string;
  vendorStatus: string;
  planTier: string;
  commissionRatePct: number;
  catalogSkuCount: number;
  activeSkuCount: number;
  deliveryZoneCount: number;
  orderCutoffTime?: string | null;
  moqValues?: number[];
}): VendorOnboardingPortalReport {
  const moqValues = input.moqValues ?? [1];
  const minimumMoq = Math.min(...moqValues);
  const averageMoq = Math.round(moqValues.reduce((s, v) => s + v, 0) / moqValues.length);

  const blocks = [
    buildCatalogImportBlock({
      catalogSkuCount: input.catalogSkuCount,
      activeSkuCount: input.activeSkuCount,
    }),
    buildPricingTierBlock({
      planTier: input.planTier,
      commissionRatePct: input.commissionRatePct,
    }),
    buildDeliveryZonesBlock({ deliveryZoneCount: input.deliveryZoneCount }),
    buildCutoffTimeBlock({ orderCutoffTime: input.orderCutoffTime ?? null }),
    buildMoqBlock({ minimumMoq, averageMoq }),
  ];

  return {
    policyId: VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID,
    vendorId: input.vendorId ?? null,
    companyName: input.companyName,
    vendorStatus: input.vendorStatus,
    planTier: input.planTier,
    commissionRatePct: input.commissionRatePct,
    catalogSkuCount: input.catalogSkuCount,
    activeSkuCount: input.activeSkuCount,
    deliveryZoneCount: input.deliveryZoneCount,
    orderCutoffTime: input.orderCutoffTime ?? null,
    minimumMoq,
    averageMoq,
    blocks,
    readinessScore: computeReadinessScore(blocks),
  };
}

export function buildVendorOnboardingPortalDemoReport(): VendorOnboardingPortalReport {
  return buildVendorOnboardingPortalReport({
    vendorId: "demo-vendor-001",
    companyName: "Metro Fresh Supply (demo)",
    vendorStatus: "APPROVED",
    planTier: "GROWTH",
    commissionRatePct: 3.5,
    catalogSkuCount: 48,
    activeSkuCount: 42,
    deliveryZoneCount: 3,
    orderCutoffTime: "14:00",
    moqValues: [1, 2, 6, 12, 24],
  });
}

export function isVendorOnboardingReady(report: VendorOnboardingPortalReport): boolean {
  return report.readinessScore >= 80;
}
