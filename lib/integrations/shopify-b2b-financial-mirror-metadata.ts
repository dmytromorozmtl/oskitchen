import type { NormalizedKitchenOrder } from "@/lib/order-normalization";

export type B2bFinancialMirrorStats = {
  capturedAtPromote: number;
  refreshed: number;
  refreshSkipped: number;
  refreshErrors: number;
  lastDriftCount: number;
};

export function readShopifyFinancialStatus(sourceMetadataJson: unknown): string | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const root = sourceMetadataJson as Record<string, unknown>;
  const direct = root.shopifyFinancialStatus;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const b2b = root.b2b;
  if (b2b && typeof b2b === "object") {
    const nested = (b2b as Record<string, unknown>).shopifyFinancialStatus;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return null;
}

export function readShopifyFinancialStatusCapturedAt(sourceMetadataJson: unknown): string | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const root = sourceMetadataJson as Record<string, unknown>;
  const direct = root.shopifyFinancialStatusCapturedAt;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const b2b = root.b2b;
  if (b2b && typeof b2b === "object") {
    const nested = (b2b as Record<string, unknown>).shopifyFinancialStatusCapturedAt;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return null;
}

/** Extract Shopify financial status from GraphQL or REST order raw payload. */
export function extractShopifyFinancialStatusFromRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const node = raw as Record<string, unknown>;

  const graphql = node.displayFinancialStatus;
  if (typeof graphql === "string" && graphql.trim()) return graphql.trim().toUpperCase();

  const rest = node.financial_status;
  if (typeof rest === "string" && rest.trim()) return rest.trim().toUpperCase();

  return null;
}

export function extractShopifyFinancialStatusFromNormalized(
  normalized: Pick<NormalizedKitchenOrder, "raw">,
): string | null {
  return extractShopifyFinancialStatusFromRaw(normalized.raw);
}

export function patchShopifyFinancialStatusInSourceMetadata(
  sourceMetadataJson: unknown,
  status: string,
  capturedAt: string,
): Record<string, unknown> {
  const normalizedStatus = status.trim().toUpperCase();
  const root =
    sourceMetadataJson && typeof sourceMetadataJson === "object"
      ? { ...(sourceMetadataJson as Record<string, unknown>) }
      : {};

  root.shopifyFinancialStatus = normalizedStatus;
  root.shopifyFinancialStatusCapturedAt = capturedAt;

  if (root.b2b && typeof root.b2b === "object") {
    root.b2b = {
      ...(root.b2b as Record<string, unknown>),
      shopifyFinancialStatus: normalizedStatus,
      shopifyFinancialStatusCapturedAt: capturedAt,
    };
  }

  return root;
}

/**
 * True when KitchenOS paymentStatus and captured Shopify displayFinancialStatus disagree.
 * Missing Shopify mirror is not drift — only evaluated when mirror is present.
 */
export function isB2bShopifyPaymentDrift(
  kitchenPaymentStatus: string | null | undefined,
  shopifyFinancialStatus: string | null | undefined,
): boolean {
  if (!shopifyFinancialStatus?.trim()) return false;

  const kitchen = (kitchenPaymentStatus ?? "UNPAID").trim().toUpperCase();
  const shopify = shopifyFinancialStatus.trim().toUpperCase();

  const shopifyPaid = shopify === "PAID" || shopify === "PARTIALLY_REFUNDED";
  const shopifyPartial = shopify === "PARTIALLY_PAID";
  const shopifyUnpaidish = shopify === "PENDING" || shopify === "AUTHORIZED";
  const shopifyClosed = shopify === "REFUNDED" || shopify === "VOIDED";

  if (kitchen === "PAID") {
    return !shopifyPaid;
  }
  if (kitchen === "PARTIAL") {
    return !(shopifyPartial || shopifyPaid);
  }
  if (shopifyPaid || shopifyPartial) return true;
  if (shopifyClosed) return true;
  if (shopifyUnpaidish) return false;
  return false;
}

export function incrementB2bFinancialMirrorStats(
  current: B2bFinancialMirrorStats | null | undefined,
  patch: Partial<B2bFinancialMirrorStats>,
): B2bFinancialMirrorStats {
  const base: B2bFinancialMirrorStats = current ?? {
    capturedAtPromote: 0,
    refreshed: 0,
    refreshSkipped: 0,
    refreshErrors: 0,
    lastDriftCount: 0,
  };
  return {
    capturedAtPromote: base.capturedAtPromote + (patch.capturedAtPromote ?? 0),
    refreshed: base.refreshed + (patch.refreshed ?? 0),
    refreshSkipped: base.refreshSkipped + (patch.refreshSkipped ?? 0),
    refreshErrors: base.refreshErrors + (patch.refreshErrors ?? 0),
    lastDriftCount: patch.lastDriftCount ?? base.lastDriftCount,
  };
}
