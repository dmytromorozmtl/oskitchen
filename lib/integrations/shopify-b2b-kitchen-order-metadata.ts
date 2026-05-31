import type { IntegrationProvider } from "@prisma/client";

import type { B2bOrderEnrichmentStatus } from "@/lib/commercial/shopify-market-b2b-order-import";
import { isShopifyMarketsKitchenOrderB2bEnabled } from "@/lib/commercial/shopify-market-kitchen-order-b2b";
import type { ShopifyB2bOrderImportEnrichment } from "@/services/integrations/shopify-b2b-order-import-enrichment-service";

import type { B2bCateringQuoteRollupLink } from "@/lib/integrations/shopify-b2b-catering-rollup-metadata";
import type { B2bInvoiceDraftLink } from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import type { B2bPaymentTermsSnapshot } from "@/lib/integrations/shopify-b2b-net-terms-extract";

export type KitchenOrderB2bMetadata = {
  status: B2bOrderEnrichmentStatus;
  companyAccountId: string | null;
  osMarketId: string | null;
  shopifyCompanyId: string | null;
  shopifyLocationId: string | null;
  companyName: string | null;
  locationName: string | null;
  orderNotesBadge: string;
  routingSummary: string;
  enrichedAt: string;
  promotedAt: string;
  missingCompanyLink: boolean;
  poNumber: string | null;
  paymentTerms: B2bPaymentTermsSnapshot | null;
  missingPo: boolean;
  cateringQuoteRollup?: B2bCateringQuoteRollupLink;
  invoiceDraft?: B2bInvoiceDraftLink;
};

export type B2bKitchenOrderStats = {
  promoted: number;
  complete: number;
  partial: number;
  unresolved: number;
  missingCompanyLink: number;
};

export function buildKitchenOrderB2bMetadata(
  enrichment: ShopifyB2bOrderImportEnrichment,
  now?: string,
): KitchenOrderB2bMetadata {
  const promotedAt = now ?? new Date().toISOString();
  return {
    status: enrichment.status,
    companyAccountId: enrichment.companyAccountId,
    osMarketId: enrichment.osMarketId,
    shopifyCompanyId: enrichment.shopifyCompanyId,
    shopifyLocationId: enrichment.shopifyLocationId,
    companyName: enrichment.companyName,
    locationName: enrichment.locationName,
    orderNotesBadge: enrichment.orderNotesBadge,
    routingSummary: enrichment.routingSummary,
    enrichedAt: enrichment.enrichedAt,
    promotedAt,
    missingCompanyLink: !enrichment.companyAccountId,
    poNumber: enrichment.poNumber,
    paymentTerms: enrichment.paymentTerms,
    missingPo: enrichment.missingPo,
  };
}

export function buildKitchenOrderB2bSourceMetadata(input: {
  provider: IntegrationProvider;
  enrichment: KitchenOrderB2bMetadata;
  externalOrderId: string;
  externalOrderNumber?: string | null;
}): Record<string, unknown> {
  return {
    provider: String(input.provider).toLowerCase(),
    channelImport: true,
    externalOrderId: input.externalOrderId,
    externalOrderNumber: input.externalOrderNumber ?? null,
    b2b: input.enrichment,
  };
}

export function buildKitchenOrderB2bChannelTrace(input: {
  provider: IntegrationProvider;
  enrichment: KitchenOrderB2bMetadata;
  batchId: string;
  connectionId: string | null;
}): Record<string, unknown> {
  return {
    source: String(input.provider),
    channelImportBatchId: input.batchId,
    connectionId: input.connectionId,
    marketId: input.enrichment.osMarketId,
    companyAccountId: input.enrichment.companyAccountId,
    b2bStatus: input.enrichment.status,
    b2bBadge: input.enrichment.orderNotesBadge,
    poNumber: input.enrichment.poNumber,
    paymentTermsLabel: input.enrichment.paymentTerms?.label ?? null,
  };
}

export function buildChannelImportSourceMetadata(input: {
  provider: IntegrationProvider;
  externalOrderId: string;
  externalOrderNumber?: string | null;
}): Record<string, unknown> {
  return {
    provider: String(input.provider).toLowerCase(),
    channelImport: true,
    externalOrderId: input.externalOrderId,
    externalOrderNumber: input.externalOrderNumber ?? null,
  };
}

export function buildChannelImportChannelTrace(input: {
  provider: IntegrationProvider;
  batchId: string;
  connectionId: string | null;
}): Record<string, unknown> {
  return {
    source: String(input.provider),
    channelImportBatchId: input.batchId,
    connectionId: input.connectionId,
  };
}

export function readKitchenOrderB2bMetadata(
  sourceMetadataJson: unknown,
): KitchenOrderB2bMetadata | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const b2b = (sourceMetadataJson as Record<string, unknown>).b2b;
  if (!b2b || typeof b2b !== "object") return null;
  return b2b as KitchenOrderB2bMetadata;
}

export function shouldApplyKitchenOrderB2bMetadata(
  enrichment: ShopifyB2bOrderImportEnrichment | null,
): enrichment is ShopifyB2bOrderImportEnrichment {
  return Boolean(enrichment && isShopifyMarketsKitchenOrderB2bEnabled());
}

export function incrementB2bKitchenOrderStats(
  current: B2bKitchenOrderStats | null | undefined,
  metadata: KitchenOrderB2bMetadata,
): B2bKitchenOrderStats {
  const base: B2bKitchenOrderStats = current ?? {
    promoted: 0,
    complete: 0,
    partial: 0,
    unresolved: 0,
    missingCompanyLink: 0,
  };
  if (metadata.status === "not_b2b") return base;
  return {
    promoted: base.promoted + 1,
    complete: base.complete + (metadata.status === "complete" ? 1 : 0),
    partial: base.partial + (metadata.status === "partial" ? 1 : 0),
    unresolved: base.unresolved + (metadata.status === "unresolved" ? 1 : 0),
    missingCompanyLink: base.missingCompanyLink + (metadata.missingCompanyLink ? 1 : 0),
  };
}
