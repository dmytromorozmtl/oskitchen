import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderStorefrontCommerceContext } from "@/lib/storefront/order-commerce-context";
import { formatCurrency } from "@/lib/utils";

const TAX_MODE_LABELS: Record<string, string> = {
  single: "Single rate",
  us_sales: "US sales tax",
  ca_sales: "Canada GST/PST",
  eu_vat: "EU VAT",
};

export function OrderStorefrontCommerceCard({
  commerce,
}: {
  commerce: OrderStorefrontCommerceContext;
}) {
  const { totals } = commerce;
  const hasTaxLines = commerce.taxBreakdown.length > 0;
  const taxModeLabel = commerce.taxMode ? (TAX_MODE_LABELS[commerce.taxMode] ?? commerce.taxMode) : null;

  return (
    <Card
      data-testid="order-storefront-commerce-card"
      className="border-violet-500/25 bg-violet-500/[0.03]"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-4 w-4 text-violet-600" aria-hidden />
              Storefront preorder
            </CardTitle>
            <CardDescription>
              Guest channel snapshot — market routing and tax lines as captured at checkout.
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {commerce.orderNumber}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Market</p>
            {commerce.marketId ? (
              <>
                <p className="mt-1 font-medium">{commerce.marketName ?? commerce.marketId}</p>
                <p className="font-mono text-xs text-muted-foreground">{commerce.marketId}</p>
                {commerce.marketPublicPath ? (
                  <Button asChild variant="link" className="h-auto px-0 text-xs">
                    <Link href={commerce.marketPublicPath}>Open menu with market</Link>
                  </Button>
                ) : null}
              </>
            ) : (
              <p className="mt-1 text-muted-foreground">Primary (no market on snapshot)</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tax jurisdiction</p>
            <p className="mt-1 font-medium">{taxModeLabel ?? "—"}</p>
            {commerce.taxRegionCode ? (
              <p className="font-mono text-xs text-muted-foreground">{commerce.taxRegionCode}</p>
            ) : null}
            {commerce.taxIncludedInPrices ? (
              <p className="mt-1 text-xs text-muted-foreground">Prices included tax at checkout</p>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment</p>
            <p className="mt-1 font-medium">
              {commerce.paymentMode.replace(/_/g, " ")} · {commerce.paymentStatus.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-muted-foreground">{commerce.fulfillmentType}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/80 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Checkout totals</p>
          <dl className="space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums font-medium">{formatCurrency(totals.subtotal, commerce.currency)}</dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="tabular-nums">−{formatCurrency(totals.discount, commerce.currency)}</dd>
              </div>
            ) : null}
            {hasTaxLines
              ? commerce.taxBreakdown.map((line) => (
                  <div key={line.id} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                      {line.label}
                      <span className="ml-1 font-mono text-[10px]">({line.ratePercent}%)</span>
                      {commerce.taxIncludedInPrices ? (
                        <span className="ml-1 text-[10px]">included</span>
                      ) : null}
                    </dt>
                    <dd className="tabular-nums">{formatCurrency(line.amount, commerce.currency)}</dd>
                  </div>
                ))
              : totals.tax > 0 ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Tax</dt>
                    <dd className="tabular-nums">{formatCurrency(totals.tax, commerce.currency)}</dd>
                  </div>
                ) : null}
            {totals.deliveryFee > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="tabular-nums">{formatCurrency(totals.deliveryFee, commerce.currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-border/60 pt-2">
              <dt className="font-medium">Total charged</dt>
              <dd className="tabular-nums text-base font-semibold">
                {formatCurrency(totals.total, commerce.currency)}
              </dd>
            </div>
          </dl>
          {commerce.schemaVersion === 2 ? (
            <p className="mt-3 text-[10px] text-muted-foreground">Cart snapshot schema v2 (market + tax breakdown)</p>
          ) : (
            <p className="mt-3 text-[10px] text-amber-800 dark:text-amber-200">
              Legacy cart snapshot — market/tax breakdown may be incomplete.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={commerce.guestTrackingUrl} target="_blank" rel="noopener noreferrer">
              Guest tracking
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={commerce.reorderCartUrl}>Reorder cart URL</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/storefront/ordering">Tax settings</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
