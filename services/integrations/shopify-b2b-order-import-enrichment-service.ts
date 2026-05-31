import {
  type B2bOrderEnrichmentStatus,
  isShopifyMarketsB2bOrderImportEnabled,
} from "@/lib/commercial/shopify-market-b2b-order-import";
import type { B2bPaymentTermsSnapshot } from "@/lib/integrations/shopify-b2b-net-terms-extract";
import {
  buildB2bCommercialBadgeSuffix,
  extractB2bPaymentTermsFromShopifyOrder,
  extractB2bPoNumberFromShopifyOrder,
} from "@/lib/integrations/shopify-b2b-net-terms-extract";
import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";
import {
  resolveB2bRoutingForShopifyRestOrder,
  type ShopifyB2bOrderRoutingHints,
} from "@/lib/integrations/shopify-b2b-order-routing";
import { ChannelRecordValidationStatus } from "@prisma/client";

export type ShopifyB2bOrderImportEnrichment = ShopifyB2bOrderRoutingHints & {
  status: B2bOrderEnrichmentStatus;
  companyName: string | null;
  locationName: string | null;
  orderNotesBadge: string;
  marketLabel: string | null;
  companyAccountLabel: string | null;
  routingStale: boolean;
  missingPieces: string[];
  poNumber: string | null;
  paymentTerms: B2bPaymentTermsSnapshot | null;
  missingPo: boolean;
  enrichedAt: string;
};

export type B2bOrderEnrichmentStats = {
  complete: number;
  partial: number;
  unresolved: number;
  total: number;
};

export const B2B_ENRICHMENT_JSON_KEY = "_kitchenosB2bEnrichment";

function readPriorEnrichment(raw: Record<string, unknown>): ShopifyB2bOrderImportEnrichment | null {
  const prior = raw[B2B_ENRICHMENT_JSON_KEY] ?? raw._kitchenosB2bRouting;
  if (!prior || typeof prior !== "object") return null;
  return prior as ShopifyB2bOrderImportEnrichment;
}

function computeRoutingStale(input: {
  hints: ShopifyB2bOrderRoutingHints;
  prior: ShopifyB2bOrderImportEnrichment | null;
  marketsSync: ShopifyMarketsSyncSettings;
}): boolean {
  if (!input.prior?.enrichedAt) return false;
  const locationId = input.hints.shopifyLocationId;
  if (!locationId) return false;
  const link = input.marketsSync.b2bLocationLinks[locationId];
  if (!link?.linkedAt) return false;
  return Date.parse(link.linkedAt) > Date.parse(input.prior.enrichedAt);
}

export function buildShopifyB2bOrderImportEnrichment(input: {
  order: Record<string, unknown>;
  marketsSync: ShopifyMarketsSyncSettings;
  priorEnrichment?: ShopifyB2bOrderImportEnrichment | null;
  now?: string;
}): ShopifyB2bOrderImportEnrichment | null {
  if (!isShopifyMarketsB2bOrderImportEnabled()) return null;

  const hints = resolveB2bRoutingForShopifyRestOrder({
    order: input.order,
    marketsSync: input.marketsSync,
  });
  if (!hints) {
    return null;
  }

  const now = input.now ?? new Date().toISOString();
  const companyImport = hints.shopifyCompanyId
    ? input.marketsSync.b2bCompanyImports[hints.shopifyCompanyId]
    : null;
  const locationImport = hints.shopifyLocationId
    ? input.marketsSync.b2bLocationImports[hints.shopifyLocationId]
    : null;

  const companyName = locationImport?.companyName ?? companyImport?.name ?? null;
  const locationName = locationImport?.locationName ?? null;
  const marketLabel = hints.osMarketId ? `market:${hints.osMarketId}` : null;
  const companyAccountLabel = hints.companyAccountId
    ? `companyAccount:${hints.companyAccountId}`
    : null;

  const missingPieces: string[] = [];
  if (!hints.companyAccountId) missingPieces.push("company_account");
  if (!hints.osMarketId) missingPieces.push("os_market");

  const poNumber = extractB2bPoNumberFromShopifyOrder(input.order);
  const paymentTerms = extractB2bPaymentTermsFromShopifyOrder(input.order);
  const missingPo = Boolean(input.marketsSync.b2bRequirePurchaseOrder && !poNumber);
  if (missingPo) missingPieces.push("po_number");

  let status: B2bOrderEnrichmentStatus;
  if (hints.companyAccountId && hints.osMarketId) {
    status = "complete";
  } else if (hints.companyAccountId || hints.osMarketId) {
    status = "partial";
  } else {
    status = "unresolved";
  }

  const badgeParts = ["B2B"];
  if (companyName) badgeParts.push(companyName);
  if (locationName) badgeParts.push(locationName);
  if (hints.osMarketId) badgeParts.push(`→ ${hints.osMarketId}`);
  if (status !== "complete") badgeParts.push(`(${status})`);
  badgeParts.push(
    ...buildB2bCommercialBadgeSuffix({ paymentTerms, poNumber, missingPo }),
  );

  const routingStale = computeRoutingStale({
    hints,
    prior: input.priorEnrichment ?? null,
    marketsSync: input.marketsSync,
  });

  return {
    ...hints,
    status,
    companyName,
    locationName,
    orderNotesBadge: badgeParts.join(" · "),
    marketLabel,
    companyAccountLabel,
    routingStale,
    missingPieces,
    poNumber,
    paymentTerms,
    missingPo,
    enrichedAt: now,
    resolvedAt: now,
  };
}

export function adjustValidationForB2bEnrichment(input: {
  base: ChannelRecordValidationStatus;
  enrichment: ShopifyB2bOrderImportEnrichment | null;
}): ChannelRecordValidationStatus {
  if (!input.enrichment) {
    return input.base;
  }
  if (
    input.enrichment.status === "complete" &&
    !input.enrichment.missingPo &&
    !input.enrichment.routingStale
  ) {
    return input.base;
  }
  if (input.base === ChannelRecordValidationStatus.ERROR) {
    return input.base;
  }
  if (
    input.enrichment.status === "partial" ||
    input.enrichment.status === "unresolved" ||
    input.enrichment.routingStale ||
    input.enrichment.missingPo
  ) {
    return ChannelRecordValidationStatus.WARNING;
  }
  return input.base;
}

export function buildB2bStagingSuggestedFixJson(
  enrichment: ShopifyB2bOrderImportEnrichment,
): Record<string, unknown> {
  return {
    b2bEnrichment: {
      status: enrichment.status,
      orderNotesBadge: enrichment.orderNotesBadge,
      companyAccountId: enrichment.companyAccountId,
      osMarketId: enrichment.osMarketId,
      shopifyCompanyId: enrichment.shopifyCompanyId,
      shopifyLocationId: enrichment.shopifyLocationId,
      routingStale: enrichment.routingStale,
      missingPieces: enrichment.missingPieces,
      routingSummary: enrichment.routingSummary,
      poNumber: enrichment.poNumber,
      paymentTerms: enrichment.paymentTerms,
      missingPo: enrichment.missingPo,
    },
  };
}

export function buildB2bStagingConflictJson(
  enrichment: ShopifyB2bOrderImportEnrichment,
): Record<string, unknown> {
  return {
    b2bRouting: {
      status: enrichment.status,
      missingPieces: enrichment.missingPieces,
      routingStale: enrichment.routingStale,
      missingPo: enrichment.missingPo,
      poNumber: enrichment.poNumber,
      paymentTermsLabel: enrichment.paymentTerms?.label ?? null,
    },
  };
}

export function appendB2bNotesToNormalizedOrder(
  normalized: NormalizedKitchenOrder,
  enrichment: ShopifyB2bOrderImportEnrichment,
): NormalizedKitchenOrder {
  const badge = `[${enrichment.orderNotesBadge}]`;
  const existing = normalized.notes?.trim() ?? "";
  if (existing.includes(enrichment.orderNotesBadge)) {
    return normalized;
  }
  return {
    ...normalized,
    notes: existing ? `${existing}\n${badge}` : badge,
  };
}

export function applyB2bEnrichmentToNormalizedOrder(input: {
  normalized: NormalizedKitchenOrder;
  enrichment: ShopifyB2bOrderImportEnrichment;
}): NormalizedKitchenOrder {
  const raw =
    input.normalized.raw && typeof input.normalized.raw === "object"
      ? { ...(input.normalized.raw as Record<string, unknown>) }
      : {};

  raw[B2B_ENRICHMENT_JSON_KEY] = input.enrichment;
  raw._kitchenosB2bRouting = input.enrichment;

  let next: NormalizedKitchenOrder = {
    ...input.normalized,
    raw,
  };
  next = appendB2bNotesToNormalizedOrder(next, input.enrichment);
  return next;
}

export function extractB2bEnrichmentFromNormalized(
  normalized: NormalizedKitchenOrder,
): ShopifyB2bOrderImportEnrichment | null {
  const raw =
    normalized.raw && typeof normalized.raw === "object"
      ? (normalized.raw as Record<string, unknown>)
      : null;
  if (!raw) return null;
  return readPriorEnrichment(raw);
}

export function incrementB2bOrderEnrichmentStats(
  current: B2bOrderEnrichmentStats | null | undefined,
  status: B2bOrderEnrichmentStatus,
): B2bOrderEnrichmentStats {
  const base: B2bOrderEnrichmentStats = current ?? {
    complete: 0,
    partial: 0,
    unresolved: 0,
    total: 0,
  };
  if (status === "not_b2b") return base;
  return {
    ...base,
    total: base.total + 1,
    complete: base.complete + (status === "complete" ? 1 : 0),
    partial: base.partial + (status === "partial" ? 1 : 0),
    unresolved: base.unresolved + (status === "unresolved" ? 1 : 0),
  };
}

export function b2bEnrichmentConflictTitle(enrichment: ShopifyB2bOrderImportEnrichment): string {
  if (enrichment.missingPo) return "B2B order missing required PO number";
  if (enrichment.routingStale) return "B2B routing stale — re-link locations";
  if (enrichment.status === "unresolved") return "B2B order routing unresolved";
  if (enrichment.status === "partial") return "B2B order routing partial";
  return "B2B routing review";
}

export function b2bEnrichmentConflictDescription(
  enrichment: ShopifyB2bOrderImportEnrichment,
): string {
  const parts = [enrichment.routingSummary];
  if (enrichment.missingPieces.length > 0) {
    parts.push(`Missing: ${enrichment.missingPieces.join(", ")}`);
  }
  if (enrichment.routingStale) {
    parts.push("Location links changed since this order was first enriched.");
  }
  if (enrichment.missingPo) {
    parts.push("Purchase order number required by workspace B2B policy.");
  }
  if (enrichment.paymentTerms?.label) {
    parts.push(`Payment terms: ${enrichment.paymentTerms.label}`);
  }
  if (enrichment.poNumber) {
    parts.push(`PO#${enrichment.poNumber}`);
  }
  return parts.join(" · ");
}
