import type { KitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";

export type B2bCateringQuoteRollupLink = {
  quoteId: string;
  quoteNumber: string | null;
  action: "created" | "appended";
  rolledAt: string;
  fulfillmentWeekKey: string;
  lineCount: number;
};

export type B2bCateringRollupStats = {
  quotesCreated: number;
  ordersAppended: number;
  linesRolled: number;
  skippedBelowThreshold: number;
  skippedIncomplete: number;
  skippedAlreadyLinked: number;
};

export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function buildB2bRollupMarker(input: {
  fulfillmentWeekKey: string;
  companyAccountId: string;
}): string {
  return `[kitchenos-b2b-rollup week=${input.fulfillmentWeekKey} company=${input.companyAccountId}]`;
}

export function readB2bCateringQuoteRollupLink(
  sourceMetadataJson: unknown,
): B2bCateringQuoteRollupLink | null {
  const b2b = readB2bBlock(sourceMetadataJson);
  if (!b2b) return null;
  const rollup = b2b.cateringQuoteRollup;
  if (!rollup || typeof rollup !== "object") return null;
  return rollup as B2bCateringQuoteRollupLink;
}

export function appendCateringQuoteRollupToB2bMetadata(
  b2b: KitchenOrderB2bMetadata,
  link: B2bCateringQuoteRollupLink,
): KitchenOrderB2bMetadata & { cateringQuoteRollup: B2bCateringQuoteRollupLink } {
  return {
    ...b2b,
    cateringQuoteRollup: link,
  };
}

export function incrementB2bCateringRollupStats(
  current: B2bCateringRollupStats | null | undefined,
  patch: Partial<B2bCateringRollupStats>,
): B2bCateringRollupStats {
  const base: B2bCateringRollupStats = current ?? {
    quotesCreated: 0,
    ordersAppended: 0,
    linesRolled: 0,
    skippedBelowThreshold: 0,
    skippedIncomplete: 0,
    skippedAlreadyLinked: 0,
  };
  return {
    quotesCreated: base.quotesCreated + (patch.quotesCreated ?? 0),
    ordersAppended: base.ordersAppended + (patch.ordersAppended ?? 0),
    linesRolled: base.linesRolled + (patch.linesRolled ?? 0),
    skippedBelowThreshold: base.skippedBelowThreshold + (patch.skippedBelowThreshold ?? 0),
    skippedIncomplete: base.skippedIncomplete + (patch.skippedIncomplete ?? 0),
    skippedAlreadyLinked: base.skippedAlreadyLinked + (patch.skippedAlreadyLinked ?? 0),
  };
}

function readB2bBlock(sourceMetadataJson: unknown): Record<string, unknown> | null {
  if (!sourceMetadataJson || typeof sourceMetadataJson !== "object") return null;
  const b2b = (sourceMetadataJson as Record<string, unknown>).b2b;
  if (!b2b || typeof b2b !== "object") return null;
  return b2b as Record<string, unknown>;
}
