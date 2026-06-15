"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AutoVendorDashboard } from "@/lib/marketplace/auto-vendor-types";
import { formatCurrency } from "@/lib/utils";

export function AutoVendorClient({ dashboard }: { dashboard: AutoVendorDashboard }) {
  const { summary, opportunities } = dashboard;

  return (
    <div className="space-y-6" data-testid="auto-vendor-panel">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Potential savings</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCurrency(summary.totalMonthlySavingsUsd)}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Switch opportunities</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{summary.savingsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Price increases flagged</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{summary.priceIncreaseCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Scanned {new Date(dashboard.scannedAt).toLocaleString()} — compares your marketplace
        purchase history and ingredient costs against active vendor catalog prices.
      </p>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No vendor switches detected yet. Place marketplace orders or link ingredients, then
            refresh.
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <Card key={opp.id} data-testid="auto-vendor-opportunity">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{opp.currentLabel}</CardTitle>
                  <Badge variant={opp.kind === "savings" ? "default" : "destructive"}>
                    {opp.kind === "savings" ? "Save" : "Price up"}
                  </Badge>
                  <Badge variant="outline">{opp.categoryLabel}</Badge>
                  {opp.priceChangePercent != null && opp.priceChangePercent > 0 ? (
                    <Badge variant="secondary">+{opp.priceChangePercent}%</Badge>
                  ) : null}
                </div>
                <CardDescription>{opp.rationale}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Current</p>
                    <p className="font-medium">{opp.currentVendorName}</p>
                    <p className="tabular-nums">
                      {formatCurrency(opp.currentUnitPrice)} / unit
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Alternative</p>
                    <p className="font-medium">{opp.alternativeVendorName}</p>
                    <p className="font-medium">{opp.alternativeProductName}</p>
                    <p className="tabular-nums">
                      {formatCurrency(opp.alternativeUnitPrice)} / unit
                    </p>
                  </div>
                </div>
                {opp.monthlySavingsUsd > 0 ? (
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">
                    Estimated savings: {formatCurrency(opp.monthlySavingsUsd)}/month
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {opp.alternativeProductSlug ? (
                    <Button asChild size="sm" data-testid="auto-vendor-view-product">
                      <Link
                        href={`/dashboard/marketplace/products/${opp.alternativeProductSlug}`}
                      >
                        View product
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/dashboard/marketplace/compare?q=${encodeURIComponent(opp.currentLabel)}`}
                    >
                      Compare all offers
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
