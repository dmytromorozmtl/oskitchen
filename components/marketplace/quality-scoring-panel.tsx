"use client";

import Link from "next/link";
import { AlertTriangle, Award, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { QualityScoringSnapshot, QualityScoreTier } from "@/lib/marketplace/quality-scoring-types";
import { cn } from "@/lib/utils";

type Props = {
  snapshot: QualityScoringSnapshot;
};

const TIER_LABELS: Record<QualityScoreTier, string> = {
  excellent: "Excellent",
  good: "Good",
  watch: "Watch",
  avoid: "Avoid",
  unrated: "Unrated",
};

const TIER_STYLES: Record<QualityScoreTier, string> = {
  excellent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  good: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  watch: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  avoid: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  unrated: "bg-muted text-muted-foreground",
};

function formatScore(value: number | null): string {
  if (value == null) return "—";
  return `${value.toFixed(1)}/5`;
}

function SupplierScoreRow({
  vendorName,
  overall,
  quality,
  accuracy,
  delivery,
  packaging,
  reviewCount,
  orderCount,
  tier,
  href,
}: QualityScoringSnapshot["workspaceSuppliers"][number]) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={href} className="font-medium hover:underline">
            {vendorName}
          </Link>
          <Badge variant="secondary" className={cn("rounded-full text-xs", TIER_STYLES[tier])}>
            {TIER_LABELS[tier]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {reviewCount} review{reviewCount === 1 ? "" : "s"} · {orderCount} order{orderCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2 text-center text-xs sm:min-w-[280px]">
        <div>
          <p className="font-semibold tabular-nums">{formatScore(overall)}</p>
          <p className="text-muted-foreground">Overall</p>
        </div>
        <div>
          <p className="tabular-nums">{formatScore(quality)}</p>
          <p className="text-muted-foreground">Quality</p>
        </div>
        <div>
          <p className="tabular-nums">{formatScore(accuracy)}</p>
          <p className="text-muted-foreground">Accuracy</p>
        </div>
        <div>
          <p className="tabular-nums">{formatScore(delivery)}</p>
          <p className="text-muted-foreground">Delivery</p>
        </div>
        <div>
          <p className="tabular-nums">{formatScore(packaging)}</p>
          <p className="text-muted-foreground">Packaging</p>
        </div>
      </div>
    </div>
  );
}

export function QualityScoringPanel({ snapshot }: Props) {
  return (
    <div className="space-y-6" data-testid="quality-scoring-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workspace avg score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {snapshot.summary.workspaceAvgScore != null
                ? `${snapshot.summary.workspaceAvgScore}/5`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">{snapshot.summary.ratedSuppliers} rated suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Excellent tier</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.excellentCount}</p>
            <p className="text-xs text-muted-foreground">4.5+ overall rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Watch / avoid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.watchOrBelowCount}</p>
            <p className="text-xs text-muted-foreground">Suppliers below 4.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.pendingReviewCount}</p>
            <p className="text-xs text-muted-foreground">Delivered POs awaiting rating</p>
          </CardContent>
        </Card>
      </div>

      {snapshot.alerts.length > 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Quality alerts
            </CardTitle>
            <CardDescription>Low-rated suppliers in your procurement history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.alerts.map((alert) => (
              <div key={alert.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p>{alert.message}</p>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={alert.href}>View supplier</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4" />
              Your suppliers
            </CardTitle>
            <CardDescription>Quality scores from your workspace purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.workspaceSuppliers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Place marketplace orders to start building supplier quality scores.
              </p>
            ) : (
              snapshot.workspaceSuppliers.map((row) => <SupplierScoreRow key={row.vendorId} {...row} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4" />
              Top marketplace suppliers
            </CardTitle>
            <CardDescription>Highest-rated vendors across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.topMarketplaceSuppliers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No public reviews yet.</p>
            ) : (
              snapshot.topMarketplaceSuppliers.map((row) => <SupplierScoreRow key={row.vendorId} {...row} />)
            )}
          </CardContent>
        </Card>
      </div>

      {snapshot.pendingReviews.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rate recent deliveries</CardTitle>
            <CardDescription>Help the marketplace by scoring supplier quality after delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.pendingReviews.map((review) => (
              <div
                key={review.purchaseOrderId}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 py-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{review.vendorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.poNumber ?? review.purchaseOrderId.slice(0, 8)} ·{" "}
                    {new Date(review.deliveredAtIso).toLocaleDateString()}
                  </p>
                </div>
                <Button asChild size="sm" className="rounded-full">
                  <Link href={review.href}>Leave review</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
