"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Scale, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketplaceCatalogProduct } from "@/services/marketplace/marketplace-catalog-service";
import { formatCurrency } from "@/lib/utils";

const COMPARE_STORAGE_KEY = "marketplace-compare-slugs";
const COMPARE_LIMIT = 4;

function readCompareSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeCompareSlugs(slugs: string[]) {
  window.sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(slugs.slice(0, COMPARE_LIMIT)));
}

export function MarketplaceCatalogProductCard({
  product,
  canAddToCart,
}: {
  product: MarketplaceCatalogProduct;
  canAddToCart: boolean;
}) {
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);

  useEffect(() => {
    setCompareSlugs(readCompareSlugs());
  }, []);

  const isCompared = compareSlugs.includes(product.slug);

  function toggleCompare() {
    setCompareSlugs((current) => {
      const next = current.includes(product.slug)
        ? current.filter((slug) => slug !== product.slug)
        : current.length >= COMPARE_LIMIT
          ? current
          : [...current, product.slug];
      writeCompareSlugs(next);
      return next;
    });
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
          <Badge variant={product.inStock ? "secondary" : "outline"} className="shrink-0 rounded-full text-[10px]">
            {product.inStock ? "In stock" : "Backorder"}
          </Badge>
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
            className="h-4 w-4 rounded border-input"
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
              <Link href={`/dashboard/marketplace/compare?products=${compareSlugs.join(",")}`}>
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
