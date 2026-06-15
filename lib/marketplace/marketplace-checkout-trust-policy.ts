import {
  MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD,
  marketplaceCheckoutRequiresApproval,
  type VendorCartGroup,
} from "@/lib/marketplace/checkout-utils";
import { formatCurrency } from "@/lib/utils";

/**
 * DES-17 — marketplace checkout trust signals policy.
 *
 * Honest buyer reassurance at checkout — no escrow or payout SLO claims.
 *
 * @see components/marketplace/marketplace-checkout-trust-strip.tsx
 */

export const MARKETPLACE_CHECKOUT_TRUST_POLICY_ID = "marketplace-checkout-trust-des17-v1" as const;

export const MARKETPLACE_CHECKOUT_TRUST_STRIP_TEST_ID = "marketplace-checkout-trust-strip" as const;

export const MARKETPLACE_CHECKOUT_TRUST_MODULE =
  "components/marketplace/marketplace-checkout-trust-strip.tsx" as const;

export const MARKETPLACE_CHECKOUT_PATH = "/dashboard/marketplace/checkout" as const;
export const MARKETPLACE_ORDERS_PATH = "/dashboard/marketplace/orders" as const;
export const MARKETPLACE_TRUST_PATH = "/trust" as const;

export const MARKETPLACE_CHECKOUT_TRUST_FORBIDDEN_CLAIMS = [
  "escrow guaranteed",
  "instant vendor payout certified",
  "chargeback-free checkout",
  "marketplace buyer protection SLA",
] as const;

export type MarketplaceCheckoutTrustSignalId =
  | "approved_vendors"
  | "vendor_split"
  | "approval_gate"
  | "stripe_payments"
  | "order_tracking"
  | "dispute_path";

export type MarketplaceCheckoutTrustTone = "neutral" | "positive" | "caution";

export type MarketplaceCheckoutTrustSignal = {
  id: MarketplaceCheckoutTrustSignalId;
  title: string;
  detail: string;
  href?: string;
  tone: MarketplaceCheckoutTrustTone;
};

export type MarketplaceCheckoutTrustSnapshot = {
  policyId: typeof MARKETPLACE_CHECKOUT_TRUST_POLICY_ID;
  vendorCount: number;
  itemCount: number;
  subtotal: number;
  currency: string;
  requiresApproval: boolean;
  approvalLimitUsd: number;
  signals: MarketplaceCheckoutTrustSignal[];
  vendorNames: string[];
};

export function buildMarketplaceCheckoutTrustSignals(input: {
  vendorCount: number;
  itemCount: number;
  subtotal: number;
  currency?: string;
  requiresApproval?: boolean;
  approvalLimitUsd?: number;
}): MarketplaceCheckoutTrustSignal[] {
  const currency = input.currency ?? "USD";
  const approvalLimitUsd = input.approvalLimitUsd ?? MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD;
  const requiresApproval =
    input.requiresApproval ??
    marketplaceCheckoutRequiresApproval(input.subtotal, approvalLimitUsd);

  const signals: MarketplaceCheckoutTrustSignal[] = [
    {
      id: "approved_vendors",
      title: "Approved vendors only",
      detail: "Catalog items come from platform-approved HoReCa suppliers — not open listings.",
      tone: "positive",
    },
    {
      id: "vendor_split",
      title: input.vendorCount === 1 ? "Single purchase order" : `${input.vendorCount} purchase orders`,
      detail:
        input.vendorCount === 1
          ? "Checkout creates one PO for this vendor with line-level SKUs."
          : "Multi-vendor carts split into separate POs — one per supplier at checkout.",
      tone: "neutral",
    },
    {
      id: "stripe_payments",
      title: "Card via Stripe",
      detail: "Card checkout uses Stripe — OS Kitchen does not store raw card numbers.",
      href: MARKETPLACE_TRUST_PATH,
      tone: "neutral",
    },
    {
      id: "order_tracking",
      title: "Track in Orders hub",
      detail: `Follow ${input.itemCount} line item(s) from submitted → fulfilled in your marketplace orders.`,
      href: MARKETPLACE_ORDERS_PATH,
      tone: "neutral",
    },
    {
      id: "dispute_path",
      title: "Dispute & support path",
      detail: "Receiving issues route through PO receiving notes and platform dispute review — not hidden DMs.",
      href: "/help",
      tone: "neutral",
    },
  ];

  if (requiresApproval) {
    signals.splice(2, 0, {
      id: "approval_gate",
      title: "Manager approval required",
      detail: `Subtotal above ${formatCurrency(approvalLimitUsd, currency)} submits POs as Pending approval until an owner approves.`,
      href: `${MARKETPLACE_ORDERS_PATH}?status=PENDING_APPROVAL`,
      tone: "caution",
    });
  } else {
    signals.splice(2, 0, {
      id: "approval_gate",
      title: "Auto-submit eligible",
      detail: `At or below ${formatCurrency(approvalLimitUsd, currency)} — POs submit directly without manager gate.`,
      tone: "positive",
    });
  }

  return signals;
}

export function buildMarketplaceCheckoutTrustSnapshot(input: {
  vendorGroups: readonly VendorCartGroup[];
  itemCount: number;
  subtotal: number;
  currency?: string;
  approvalLimitUsd?: number;
}): MarketplaceCheckoutTrustSnapshot {
  const currency = input.currency ?? "USD";
  const approvalLimitUsd = input.approvalLimitUsd ?? MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD;
  const requiresApproval = marketplaceCheckoutRequiresApproval(input.subtotal, approvalLimitUsd);

  return {
    policyId: MARKETPLACE_CHECKOUT_TRUST_POLICY_ID,
    vendorCount: input.vendorGroups.length,
    itemCount: input.itemCount,
    subtotal: input.subtotal,
    currency,
    requiresApproval,
    approvalLimitUsd,
    vendorNames: input.vendorGroups.map((group) => group.vendorName),
    signals: buildMarketplaceCheckoutTrustSignals({
      vendorCount: input.vendorGroups.length,
      itemCount: input.itemCount,
      subtotal: input.subtotal,
      currency,
      requiresApproval,
      approvalLimitUsd,
    }),
  };
}

export function marketplaceCheckoutTrustToneClass(tone: MarketplaceCheckoutTrustTone): string {
  switch (tone) {
    case "positive":
      return "border-emerald-300/70 bg-emerald-50/80 dark:border-emerald-800/60 dark:bg-emerald-950/30";
    case "caution":
      return "border-amber-300/70 bg-amber-50/80 dark:border-amber-800/60 dark:bg-amber-950/30";
    default:
      return "border-border/80 bg-muted/30";
  }
}
