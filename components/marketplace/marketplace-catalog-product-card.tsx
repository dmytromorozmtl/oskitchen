"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Scale, Star } from "lucide-react";

import { WishlistButton } from "@/components/marketplace/wishlist-button";
import { A11Y_FOCUS_RING } from "@/lib/a11y/ui-classes";
import { buildMarketplaceCompareHref } from "@/lib/marketplace/marketplace-catalog-ux-policy";
import {
  isMarketplaceCompareSlug,
  readMarketplaceCompareSlugs,
  toggleMarketplaceCompareSlug,
} from "@/lib/marketplace/marketplace-compare-storage";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketplaceCatalogProduct } from "@/services/marketplace/marketplace-catalog-service";
import { formatCurrency } from "@/lib/utils";

export function MarketplaceCatalogProductCard({
  product,
  canAddToCart,
}: {
  product: MarketplaceCatalogProduct;
  canAddToCart: boolean;
}) {
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);

  useEffect(() => {
    setCompareSlugs(readMarketplaceCompareSlugs());
  }, []);

  const isCompared = isMarketplaceCompareSlug(product.slug);

  function toggleCompare() {
    const result = toggleMarketplaceCompareSlug(product.slug);
    setCompareSlugs(result.slugs);
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
          <div className="flex shrink-0 items-center gap-1">
            <WishlistButton slug={product.slug} productName={product.name} variant="icon" size="icon" />
            <Badge variant={product.inStock ? "secondary" : "outline"} className="rounded-full text-[10px]">
              {product.inStock ? "In stock" : "Backorder"}
            </Badge>
          </div>
        </div>
        <CardDescription>{product.vendorName}</CardDescription>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {product.avgVendorRating != null ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {product.avgVendorRating}
              <span>({product.reviewCount})</span>
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
          <span>MOQ {product.moq}</span>
          <span>{product.leadTimeDays}d delivery</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-lg font-semibold tabular-nums">
            {formatCurrency(product.basePrice, product.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            per {product.priceUnit.replace(/^PER_/, "").replace(/_/g, " ").toLowerCase()}
          </p>
        </div>

          <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={toggleCompare}
            className={`h-4 w-4 rounded border-input ${A11Y_FOCUS_RING}`}
          />
          Compare
        </label>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={`/dashboard/marketplace/products/${product.slug}`}>View</Link>
          </Button>
          {canAddToCart ? (
            <Button asChild size="sm" className="rounded-full gap-1">
              <Link href={`/dashboard/marketplace/products/${product.slug}?add=1`}>
                <Plus className="h-3.5 w-3.5" />
                Quick add
              </Link>
            </Button>
          ) : null}
          {compareSlugs.length > 0 ? (
            <Button asChild variant="secondary" size="sm" className="rounded-full gap-1">
              <Link href={buildMarketplaceCompareHref(compareSlugs)}>
                <Scale className="h-3.5 w-3.5" />
                Compare ({compareSlugs.length})
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
