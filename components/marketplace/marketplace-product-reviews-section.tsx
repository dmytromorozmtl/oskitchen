"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketplaceProductReviewRow } from "@/services/marketplace/marketplace-product-detail-service";

export function MarketplaceProductReviewsSection({
  reviews,
}: {
  reviews: MarketplaceProductReviewRow[];
}) {
  const [minRating, setMinRating] = useState<number>(0);

  const filtered = useMemo(
    () => reviews.filter((review) => review.overall >= minRating),
    [reviews, minRating],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Customer reviews</h2>
          <p className="text-sm text-muted-foreground">
            Vendor ratings from completed marketplace orders
          </p>
        </div>
        <div className="space-y-1">
          <label htmlFor="review-filter" className="text-xs text-muted-foreground">
            Minimum rating
          </label>
          <select
            id="review-filter"
            value={minRating}
            onChange={(event) => setMinRating(Number(event.target.value))}
            className="flex h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value={0}>All ratings</option>
            <option value={3}>3+ stars</option>
            <option value={4}>4+ stars</option>
            <option value={5}>5 stars</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/80 px-4 py-6 text-sm text-muted-foreground">
          No public reviews match this filter yet.
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((review) => (
            <Card key={review.id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="inline-flex items-center gap-1 text-base">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {review.overall}/5
                  </CardTitle>
                  <Badge variant="outline" className="rounded-full text-xs">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Quality {review.qualityScore} · Accuracy {review.accuracyScore} · Delivery{" "}
                  {review.deliveryScore} · Packaging {review.packagingScore}
                </p>
                {review.comment ? <p>{review.comment}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
