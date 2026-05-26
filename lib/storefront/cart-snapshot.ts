import { stableCartFingerprint } from "@/lib/storefront/checkout";
import { toJsonValue } from "@/lib/prisma/json";
import type { ComputedTaxLine } from "@/lib/storefront/tax-engine";

export const CART_SNAPSHOT_SCHEMA_VERSION = 2 as const;

export type StorefrontCartLineSnapshot = {
  productId: string;
  variantId?: string;
  modifierOptionIds?: string[];
  title: string;
  quantity: number;
  unitPrice: number;
  modifierLabels?: string[];
};

export type StorefrontCartSnapshotEnvelope = {
  schemaVersion: typeof CART_SNAPSHOT_SCHEMA_VERSION;
  marketId: string | null;
  taxBreakdown?: ComputedTaxLine[];
  taxMode?: string;
  taxRegionCode?: string | null;
  lines: StorefrontCartLineSnapshot[];
};

export function buildCartSnapshotEnvelope(input: {
  marketId: string | null;
  lines: StorefrontCartLineSnapshot[];
  taxBreakdown?: ComputedTaxLine[];
  taxMode?: string;
  taxRegionCode?: string | null;
}): StorefrontCartSnapshotEnvelope {
  return {
    schemaVersion: CART_SNAPSHOT_SCHEMA_VERSION,
    marketId: input.marketId,
    taxBreakdown: input.taxBreakdown?.length ? input.taxBreakdown : undefined,
    taxMode: input.taxMode,
    taxRegionCode: input.taxRegionCode ?? undefined,
    lines: input.lines,
  };
}

export function parseStorefrontCartSnapshot(json: unknown): {
  envelope: StorefrontCartSnapshotEnvelope | null;
  lines: StorefrontCartLineSnapshot[];
  marketId: string | null;
} {
  if (Array.isArray(json)) {
    const lines = json.filter(isLineSnapshot);
    return { envelope: null, lines, marketId: null };
  }
  if (!json || typeof json !== "object") {
    return { envelope: null, lines: [], marketId: null };
  }
  const o = json as Record<string, unknown>;
  if (o.schemaVersion === CART_SNAPSHOT_SCHEMA_VERSION && Array.isArray(o.lines)) {
    const lines = o.lines.filter(isLineSnapshot);
    const marketId = typeof o.marketId === "string" ? o.marketId : null;
    return {
      envelope: {
        schemaVersion: CART_SNAPSHOT_SCHEMA_VERSION,
        marketId,
        taxBreakdown: Array.isArray(o.taxBreakdown) ? (o.taxBreakdown as ComputedTaxLine[]) : undefined,
        taxMode: typeof o.taxMode === "string" ? o.taxMode : undefined,
        taxRegionCode: typeof o.taxRegionCode === "string" ? o.taxRegionCode : null,
        lines,
      },
      lines,
      marketId,
    };
  }
  return { envelope: null, lines: [], marketId: null };
}

function isLineSnapshot(row: unknown): row is StorefrontCartLineSnapshot {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return typeof r.productId === "string" && typeof r.quantity === "number" && r.quantity > 0;
}

export function fingerprintFromCartSnapshotJson(json: unknown): string | null {
  const { lines } = parseStorefrontCartSnapshot(json);
  if (lines.length === 0) return null;
  return stableCartFingerprint(
    lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
  );
}

export function orderSourceWithMarket(base: string, marketId: string | null): string {
  if (!marketId?.trim()) return base;
  return `${base}:market:${marketId.trim()}`;
}
