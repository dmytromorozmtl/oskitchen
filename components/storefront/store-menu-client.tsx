"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STOREFRONT_ANALYTICS_EVENTS } from "@/lib/storefront/analytics-events";
import type { StorefrontCatalogProduct } from "@/lib/storefront/catalog-types";
import { productUrlSegment } from "@/lib/storefront/resolve-product-ref";
import { ingestStorefrontFirstPartyEvent } from "@/lib/storefront/storefront-first-party-ingest";
import { storefrontMenuImageUrl } from "@/lib/storefront/product-image-url";
import { formatCurrency } from "@/lib/utils";
import { useStorefrontCart } from "@/hooks/use-storefront-cart";

export type StoreProduct = StorefrontCatalogProduct;

export function StoreMenuClient({
  slug,
  currency,
  products,
  priceVersion,
}: {
  slug: string;
  currency: string;
  products: StorefrontCatalogProduct[];
  priceVersion: string;
}) {
  const { quantities, itemCount, bump, syncing } = useStorefrontCart(slug, priceVersion);

  React.useEffect(() => {
    void ingestStorefrontFirstPartyEvent({
      storeSlug: slug,
      eventName: STOREFRONT_ANALYTICS_EVENTS.viewMenu,
      path: typeof window !== "undefined" ? window.location.pathname : "/menu",
    });
  }, [slug]);

  async function onBump(productId: string, delta: number, product: StorefrontCatalogProduct) {
    if (delta > 0 && !product.canAddToCart) {
      toast.error(product.soldOut ? "Sold out" : "Not available");
      return;
    }
    const res = await bump(productId, delta);
    if (!res.ok) {
      toast.error(res.error ?? "Could not update cart");
      return;
    }
    if (delta > 0) {
      void ingestStorefrontFirstPartyEvent({
        storeSlug: slug,
        eventName: STOREFRONT_ANALYTICS_EVENTS.addToCart,
        path: typeof window !== "undefined" ? window.location.pathname : "/menu",
        metadata: { productId },
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">This week&apos;s menu</h1>
          <p className="mt-2 text-muted-foreground">
            Tap items to build your cart — checkout confirms a preorder request with the kitchen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/s/${slug}/cart`}>Cart {itemCount > 0 ? `(${itemCount})` : ""}</Link>
          </Button>
          <Button asChild variant="premium" className="rounded-full shadow-sm">
            <Link href={`/s/${slug}/checkout`}>Checkout</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p, idx) => {
          const q = quantities[p.id] ?? 0;
          const isLcp = idx === 0;
          const prepared = new Date(p.preparedDate);
          const atCap = p.availableQty != null && q >= p.availableQty && p.availableQty > 0;
          return (
            <Card key={p.id} className="overflow-hidden border-border/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/90">
              <Link href={`/s/${slug}/products/${productUrlSegment(p)}`} className="block">
                {storefrontMenuImageUrl(p.image) ? (
                  <div className="relative aspect-[16/10] w-full bg-muted">
                    <Image
                      src={storefrontMenuImageUrl(p.image)!}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority={isLcp}
                      loading={isLcp ? "eager" : "lazy"}
                    />
                  </div>
                ) : null}
              </Link>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/s/${slug}/products/${productUrlSegment(p)}`}
                      className="font-semibold leading-snug hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs font-medium text-[var(--store-accent,#FF5F1F)]">
                      Prepared {format(prepared, "EEE MMM d")}
                    </p>
                    {p.soldOut ? (
                      <span className="inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        Sold out
                      </span>
                    ) : p.availableQty != null && p.availableQty <= 5 ? (
                      <span className="inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-100">
                        {p.availableQty} left
                      </span>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-lg font-semibold">{formatCurrency(p.price, currency)}</p>
                </div>
                {p.description ? (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                ) : null}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={q <= 0 || syncing}
                    onClick={() => void onBump(p.id, -1, p)}
                  >
                    −
                  </Button>
                  <span className="min-w-[2rem] text-center text-sm font-medium">{q}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="premium"
                    className="rounded-full"
                    disabled={syncing || !p.canAddToCart || atCap}
                    onClick={() => void onBump(p.id, 1, p)}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
