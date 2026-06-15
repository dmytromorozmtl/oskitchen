/**
 * Pure helpers for marketplace empty states (Blueprint P2-123).
 */

import { MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID } from "@/lib/marketplace/marketplace-empty-states-p2-123-policy";
import type { MarketplaceEmptyStateScenario } from "@/lib/marketplace/marketplace-empty-states-policy";

export type EmptyStateCapabilityBlock = {
  id: string;
  label: string;
  scenario: MarketplaceEmptyStateScenario;
  status: "ready" | "partial" | "missing";
  summary: string;
  count: number;
  wired: boolean;
};

export type MarketplaceEmptyStatesP2_123Report = {
  policyId: typeof MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID;
  productCount: number;
  orderCount: number;
  vendorCount: number;
  blocks: EmptyStateCapabilityBlock[];
  wiringScore: number;
};

function blockStatus(wired: boolean, count: number): "ready" | "partial" | "missing" {
  if (wired && count === 0) return "ready";
  if (wired) return "partial";
  return "missing";
}

export function buildNoProductsBlock(
  wired: boolean,
  productCount: number,
): EmptyStateCapabilityBlock {
  return {
    id: "no-products",
    label: "No products",
    scenario: "catalog_empty",
    wired,
    count: productCount,
    status: blockStatus(wired, productCount),
    summary: wired
      ? productCount === 0
        ? "Catalog empty state wired — no published SKUs yet"
        : `${productCount} product(s) live — empty state hidden until catalog clears`
      : "Catalog page missing MarketplaceEmptyState catalog_empty wiring",
  };
}

export function buildNoOrdersBlock(wired: boolean, orderCount: number): EmptyStateCapabilityBlock {
  return {
    id: "no-orders",
    label: "No orders",
    scenario: "orders_empty",
    wired,
    count: orderCount,
    status: blockStatus(wired, orderCount),
    summary: wired
      ? orderCount === 0
        ? "Orders empty state wired — no marketplace POs yet"
        : `${orderCount} PO(s) on file — empty state hidden while orders exist`
      : "Orders page missing MarketplaceEmptyState orders_empty wiring",
  };
}

export function buildNoVendorsBlock(wired: boolean, vendorCount: number): EmptyStateCapabilityBlock {
  return {
    id: "no-vendors",
    label: "No vendors",
    scenario: "vendors_empty",
    wired,
    count: vendorCount,
    status: blockStatus(wired, vendorCount),
    summary: wired
      ? vendorCount === 0
        ? "Vendors empty state wired — roster blank until first supplier"
        : `${vendorCount} vendor(s) on roster — empty state hidden while list populated`
      : "Vendors list missing MarketplaceEmptyState vendors_empty wiring",
  };
}

export function computeEmptyStatesWiringScore(blocks: EmptyStateCapabilityBlock[]): number {
  if (blocks.length === 0) return 0;
  const weights = { ready: 1, partial: 0.5, missing: 0 };
  const total = blocks.reduce((sum, block) => sum + weights[block.status], 0);
  return Math.round((total / blocks.length) * 100);
}

export function buildMarketplaceEmptyStatesP2_123Report(input: {
  productCount?: number;
  orderCount?: number;
  vendorCount?: number;
  catalogWired?: boolean;
  ordersWired?: boolean;
  vendorsWired?: boolean;
}): MarketplaceEmptyStatesP2_123Report {
  const productCount = input.productCount ?? 0;
  const orderCount = input.orderCount ?? 0;
  const vendorCount = input.vendorCount ?? 0;
  const catalogWired = input.catalogWired ?? false;
  const ordersWired = input.ordersWired ?? false;
  const vendorsWired = input.vendorsWired ?? false;

  const blocks = [
    buildNoProductsBlock(catalogWired, productCount),
    buildNoOrdersBlock(ordersWired, orderCount),
    buildNoVendorsBlock(vendorsWired, vendorCount),
  ];

  return {
    policyId: MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID,
    productCount,
    orderCount,
    vendorCount,
    blocks,
    wiringScore: computeEmptyStatesWiringScore(blocks),
  };
}

export function buildMarketplaceEmptyStatesP2_123DemoReport(): MarketplaceEmptyStatesP2_123Report {
  return buildMarketplaceEmptyStatesP2_123Report({
    productCount: 0,
    orderCount: 0,
    vendorCount: 0,
    catalogWired: true,
    ordersWired: true,
    vendorsWired: true,
  });
}

export function allEmptyStatesWired(report: MarketplaceEmptyStatesP2_123Report): boolean {
  return report.blocks.every((block) => block.wired);
}
