"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  CreditCard,
  HeadphonesIcon,
  Package,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import type { VendorCartGroup } from "@/lib/marketplace/checkout-utils";
import {
  buildMarketplaceCheckoutTrustSnapshot,
  MARKETPLACE_CHECKOUT_TRUST_STRIP_TEST_ID,
  marketplaceCheckoutTrustToneClass,
  type MarketplaceCheckoutTrustSignal,
  type MarketplaceCheckoutTrustSignalId,
} from "@/lib/marketplace/marketplace-checkout-trust-policy";
import { cn, formatCurrency } from "@/lib/utils";

const TRUST_ICONS: Record<
  MarketplaceCheckoutTrustSignalId,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  approved_vendors: ShieldCheck,
  vendor_split: Package,
  approval_gate: ClipboardCheck,
  stripe_payments: CreditCard,
  order_tracking: ShoppingBag,
  dispute_path: HeadphonesIcon,
};

export type MarketplaceCheckoutTrustStripProps = {
  vendorGroups: readonly VendorCartGroup[];
  itemCount: number;
  subtotal: number;
  currency?: string;
  className?: string;
};

function TrustSignalCard({ signal }: { signal: MarketplaceCheckoutTrustSignal }) {
  const Icon = TRUST_ICONS[signal.id];
  const body = (
    <>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium leading-snug">{signal.title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{signal.detail}</p>
        </div>
      </div>
    </>
  );

  return (
    <div
      data-testid={`marketplace-checkout-trust-${signal.id}`}
      className={cn(
        "rounded-xl border p-3 shadow-sm transition-colors",
        marketplaceCheckoutTrustToneClass(signal.tone),
        signal.href && "hover:bg-muted/40",
      )}
    >
      {signal.href ? (
        <Link href={signal.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

/**
 * DES-17 — checkout trust strip: vendor split, approval gate, payment, tracking honesty.
 */
export function MarketplaceCheckoutTrustStrip({
  vendorGroups,
  itemCount,
  subtotal,
  currency = "USD",
  className,
}: MarketplaceCheckoutTrustStripProps) {
  const snapshot = buildMarketplaceCheckoutTrustSnapshot({
    vendorGroups,
    itemCount,
    subtotal,
    currency,
  });

  return (
    <section
      data-testid={MARKETPLACE_CHECKOUT_TRUST_STRIP_TEST_ID}
      aria-label="Checkout trust and fulfillment signals"
      className={cn("space-y-3", className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trust signals
          </p>
          <p className="text-sm text-muted-foreground">
            {snapshot.vendorCount} vendor{snapshot.vendorCount === 1 ? "" : "s"} ·{" "}
            {formatCurrency(snapshot.subtotal, snapshot.currency)} subtotal
          </p>
        </div>
        {snapshot.vendorNames.length > 1 ? (
          <p className="text-xs text-muted-foreground">
            PO split: {snapshot.vendorNames.join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {snapshot.signals.map((signal) => (
          <TrustSignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </section>
  );
}
