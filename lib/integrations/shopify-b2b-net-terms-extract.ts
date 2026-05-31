import { isShopifyMarketsB2bNetTermsEnabled } from "@/lib/commercial/shopify-market-b2b-net-terms";

export type B2bPaymentTermsSnapshot = {
  name: string | null;
  type: string | null;
  dueInDays: number | null;
  label: string;
};

export function extractB2bPoNumberFromShopifyOrder(order: Record<string, unknown>): string | null {
  if (!isShopifyMarketsB2bNetTermsEnabled()) return null;

  const direct =
    order.po_number ??
    order.poNumber ??
    (order.purchasingEntity &&
    typeof order.purchasingEntity === "object" &&
    (order.purchasingEntity as Record<string, unknown>).poNumber);

  if (direct != null && String(direct).trim()) {
    return String(direct).trim();
  }
  return null;
}

function readDueInDays(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function extractB2bPaymentTermsFromShopifyOrder(
  order: Record<string, unknown>,
): B2bPaymentTermsSnapshot | null {
  if (!isShopifyMarketsB2bNetTermsEnabled()) return null;

  const rest =
    order.payment_terms && typeof order.payment_terms === "object"
      ? (order.payment_terms as Record<string, unknown>)
      : null;
  const gql =
    order.paymentTerms && typeof order.paymentTerms === "object"
      ? (order.paymentTerms as Record<string, unknown>)
      : null;

  const source = rest ?? gql;
  if (!source) return null;

  const name =
    source.payment_terms_name != null
      ? String(source.payment_terms_name)
      : source.paymentTermsName != null
        ? String(source.paymentTermsName)
        : null;
  const type =
    source.payment_terms_type != null
      ? String(source.payment_terms_type)
      : source.paymentTermsType != null
        ? String(source.paymentTermsType)
        : null;
  const dueInDays = readDueInDays(source.due_in_days ?? source.dueInDays);

  if (!name && !type && dueInDays == null) return null;

  let label = name?.trim() || null;
  if (!label && dueInDays != null) {
    label = `Net ${dueInDays}`;
  } else if (!label && type) {
    label = type;
  }
  if (!label) return null;

  return {
    name: name?.trim() || null,
    type: type?.trim() || null,
    dueInDays,
    label,
  };
}

export function buildB2bCommercialBadgeSuffix(input: {
  paymentTerms: B2bPaymentTermsSnapshot | null;
  poNumber: string | null;
  missingPo: boolean;
}): string[] {
  const parts: string[] = [];
  if (input.paymentTerms?.label) parts.push(input.paymentTerms.label);
  if (input.poNumber) parts.push(`PO#${input.poNumber}`);
  if (input.missingPo) parts.push("PO required");
  return parts;
}

export function formatB2bCommercialNotes(input: {
  paymentTerms: B2bPaymentTermsSnapshot | null;
  poNumber: string | null;
}): string | null {
  const parts: string[] = [];
  if (input.paymentTerms?.label) parts.push(`Payment: ${input.paymentTerms.label}`);
  if (input.poNumber) parts.push(`PO#${input.poNumber}`);
  return parts.length ? parts.join(" · ") : null;
}

export type B2bNetTermsStats = {
  withNetTerms: number;
  withPoNumber: number;
  missingPoWhenRequired: number;
};

export function incrementB2bNetTermsStats(
  current: B2bNetTermsStats | null | undefined,
  patch: Partial<B2bNetTermsStats>,
): B2bNetTermsStats {
  const base: B2bNetTermsStats = current ?? {
    withNetTerms: 0,
    withPoNumber: 0,
    missingPoWhenRequired: 0,
  };
  return {
    withNetTerms: base.withNetTerms + (patch.withNetTerms ?? 0),
    withPoNumber: base.withPoNumber + (patch.withPoNumber ?? 0),
    missingPoWhenRequired: base.missingPoWhenRequired + (patch.missingPoWhenRequired ?? 0),
  };
}
