import type {
  FulfillmentType,
  IntegrationProvider,
  NormalizedOrderStatus,
} from "@prisma/client";

/** Unified kitchen-facing order shape after provider normalization. */
export type NormalizedLineItem = {
  externalLineId?: string;
  sku?: string | null;
  title: string;
  quantity: number;
  unitPrice?: number | null;
  options?: Record<string, string>[];
  notes?: string | null;
};

export type NormalizedKitchenOrder = {
  provider: IntegrationProvider;
  externalOrderId: string;
  externalOrderNumber?: string | null;
  sourceStatus?: string | null;
  normalizedStatus: NormalizedOrderStatus;
  customer: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  lineItems: NormalizedLineItem[];
  notes?: string | null;
  fulfillment: {
    type: FulfillmentType;
    pickupTime?: Date | null;
    deliveryTime?: Date | null;
    deliveryAddress?: Record<string, unknown> | null;
  };
  totals: {
    subtotal?: number | null;
    tax?: number | null;
    deliveryFee?: number | null;
    total?: number | null;
    currency?: string | null;
  };
  allergensHint?: string | null;
  raw: unknown;
};

export function normalizeTitleForMatch(title: string): string {
  return title
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ProductMatchStrategy = "sku" | "title_exact" | "title_fuzzy";

export function pickBestProductMatch<T extends { sku?: string | null; title: string }>(
  line: NormalizedLineItem,
  products: T[],
): { product: T; strategy: ProductMatchStrategy } | null {
  if (line.sku?.trim()) {
    const bySku = products.find((p) => p.sku?.trim() === line.sku!.trim());
    if (bySku) return { product: bySku, strategy: "sku" };
  }
  const nt = normalizeTitleForMatch(line.title);
  const exact = products.find((p) => normalizeTitleForMatch(p.title) === nt);
  if (exact) return { product: exact, strategy: "title_exact" };

  let best: { product: T; score: number } | null = null;
  for (const p of products) {
    const pt = normalizeTitleForMatch(p.title);
    if (!pt || !nt) continue;
    const score = jaccardTokens(nt, pt);
    if (score >= 0.72 && (!best || score > best.score)) {
      best = { product: p, score };
    }
  }
  if (best) return { product: best.product, strategy: "title_fuzzy" };
  return null;
}

function tokenSet(s: string): Set<string> {
  return new Set(s.split(" ").filter(Boolean));
}

function jaccardTokens(a: string, b: string): number {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) {
    if (B.has(t)) inter++;
  }
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}
