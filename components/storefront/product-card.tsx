"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { productUrlSegment } from "@/lib/storefront/resolve-product-ref";
import type { StorefrontCatalogProduct } from "@/lib/storefront/catalog-types";
import type { ThemeCustomizerState } from "@/lib/storefront/theme-draft";

export type ProductCardExtras = {
  isNew?: boolean;
  isBestseller?: boolean;
  isLowStock?: boolean;
  rating?: number;
  reviewCount?: number;
  compareAtPrice?: number;
};

export function ProductCard({
  product,
  storeSlug,
  currency,
  theme,
  extras,
}: {
  product: StorefrontCatalogProduct;
  storeSlug: string;
  currency: string;
  theme?: Partial<Pick<ThemeCustomizerState, "cardStyle" | "buttonStyle">>;
  extras?: ProductCardExtras;
}) {
  const [isLiked, setIsLiked] = React.useState(false);

  const href = `/s/${storeSlug}/products/${productUrlSegment(product)}`;
  const img = product.image?.trim();
  const price = Number(product.price);
  const compareAt = extras?.compareAtPrice;
  const shadowClass =
    theme?.cardStyle === "shadow-md"
      ? "hover:shadow-xl"
      : theme?.cardStyle === "bordered"
        ? "shadow-none hover:border-primary/40"
        : "hover:shadow-lg";

  const btnRadius =
    theme?.buttonStyle === "rounded-lg"
      ? "rounded-lg"
      : theme?.buttonStyle === "rounded-none"
        ? "rounded-none"
        : "rounded-full";

  return (
    <div className="group relative">
      <Link
        href={href}
        className={`sf-product-card block overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900/90 ${shadowClass}`}
        style={{ boxShadow: "var(--sf-card-shadow)" }}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted dark:bg-gray-800">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-muted-foreground">🍽️</div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {extras?.isNew ? (
              <span className="inline-flex rounded-full bg-[var(--store-accent,hsl(var(--primary)))] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                New
              </span>
            ) : null}
            {extras?.isBestseller ? (
              <span className="inline-flex rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                Best seller
              </span>
            ) : null}
            {extras?.isLowStock ? (
              <span className="inline-flex rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                Low stock
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white dark:bg-gray-800/90"
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 transition ${isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`}
            />
          </button>
        </div>

        <div className="p-5">
          {extras?.rating != null && extras.rating > 0 ? (
            <div className="mb-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-medium">{extras.rating.toFixed(1)}</span>
              {extras.reviewCount != null ? (
                <span className="text-xs text-muted-foreground">({extras.reviewCount})</span>
              ) : null}
            </div>
          ) : null}

          <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-[var(--store-accent,hsl(var(--primary)))]">
            {product.title}
          </h3>

          {product.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <div>
              {compareAt != null && compareAt > price ? (
                <span className="mr-1 text-xs text-muted-foreground line-through tabular-nums">
                  {formatCurrency(compareAt, currency)}
                </span>
              ) : null}
              <span className="text-lg font-bold tabular-nums">{formatCurrency(price, currency)}</span>
            </div>
            <span
              className={`inline-flex items-center justify-center bg-primary/10 px-4 py-1.5 text-sm font-medium text-[var(--store-accent,hsl(var(--primary)))] transition-all group-hover:bg-[var(--store-accent,hsl(var(--primary)))] group-hover:text-white dark:bg-primary/20 ${btnRadius}`}
              style={{ borderRadius: "var(--sf-button-radius, 9999px)" }}
            >
              <ShoppingBag className="mr-1 h-3.5 w-3.5" />
              Order
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
