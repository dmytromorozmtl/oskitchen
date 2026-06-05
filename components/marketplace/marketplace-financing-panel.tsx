"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Banknote, Clock, Percent, Wallet } from "lucide-react";

import { selectMarketplaceNetTermsAction } from "@/actions/marketplace/financing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketplaceFinancingSnapshot } from "@/lib/marketplace/financing-types";
import type { MarketplaceNetTermsDays } from "@/lib/marketplace/financing-policy";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  snapshot: MarketplaceFinancingSnapshot;
  canManage: boolean;
};

export function MarketplaceFinancingPanel({ snapshot, canManage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSelectTerms(days: MarketplaceNetTermsDays) {
    setError(null);
    startTransition(async () => {
      const res = await selectMarketplaceNetTermsAction(days);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="marketplace-financing-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(snapshot.creditLine.availableUsd, snapshot.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(snapshot.creditLine.limitUsd, snapshot.currency)} limit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{snapshot.summary.activeTermLabel}</p>
            <p className="text-xs text-muted-foreground">Default checkout net terms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Early pay savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(snapshot.summary.earlyPaymentSavingsUsd, snapshot.currency)}
            </p>
            <p className="text-xs text-muted-foreground">2% discount window</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Factoring eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(snapshot.summary.factoringEligibleUsd, snapshot.currency)}
            </p>
            <p className="text-xs text-muted-foreground">Open net-terms receivables</p>
          </CardContent>
        </Card>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" aria-hidden />
            Net terms — 30 / 60 / 90
          </CardTitle>
          <CardDescription>
            Pay marketplace vendors after delivery. Longer terms unlock with GMV or capital partner funding.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {snapshot.termProducts.map((term) => (
            <div
              key={term.days}
              className={cn(
                "rounded-xl border p-4",
                term.isActive ? "border-primary bg-primary/5" : "border-border/80",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{term.label}</p>
                {term.isActive ? <Badge className="rounded-full">Active</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{term.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{term.requirement}</p>
              {canManage && term.eligible && !term.isActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3 rounded-full"
                  disabled={pending}
                  onClick={() => handleSelectTerms(term.days)}
                >
                  Select {term.label}
                </Button>
              ) : null}
              {!term.eligible ? (
                <Badge variant="outline" className="mt-3 rounded-full">
                  Locked
                </Badge>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5 text-primary" aria-hidden />
              Early payment
            </CardTitle>
            <CardDescription>Pay within 10 days of invoice for a 2% discount on scheduled net-terms POs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.earlyPaymentOffers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Early payment offers appear after net-terms checkout creates payment schedules.
              </p>
            ) : (
              snapshot.earlyPaymentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{offer.poNumber ?? offer.orderId.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(offer.dueDateIso).toLocaleDateString()} · save{" "}
                      {formatCurrency(offer.discountUsd, snapshot.currency)}
                    </p>
                  </div>
                  <Badge variant={offer.status === "available" ? "default" : "outline"} className="rounded-full">
                    {offer.status === "available" ? "2% off" : "Expired"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5 text-primary" aria-hidden />
              Invoice factoring
            </CardTitle>
            <CardDescription>Advance cash against open marketplace receivables via capital partners.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.factoringOffers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Factoring unlocks when open net-terms exposure exceeds $1,000.
              </p>
            ) : (
              snapshot.factoringOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-lg border border-border/70 px-3 py-3 text-sm"
                >
                  <p className="font-medium">{offer.title}</p>
                  <p className="text-xs text-muted-foreground">{offer.partnerName}</p>
                  <p className="mt-2 tabular-nums">
                    Advance {offer.advanceRatePercent}% ·{" "}
                    {formatCurrency(offer.advanceUsd, snapshot.currency)} · fee {offer.feePercent}%
                  </p>
                  {offer.deepLink ? (
                    <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                      <Link href={offer.deepLink}>Apply for factoring</Link>
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-border/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-primary" aria-hidden />
            Checkout with net terms
          </CardTitle>
          <CardDescription>
            Use {snapshot.summary.activeTermLabel} at marketplace checkout when cart total is within your credit line.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/marketplace/checkout">Go to checkout</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
