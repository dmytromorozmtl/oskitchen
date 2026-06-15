"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { STOREFRONT_ANALYTICS_EVENTS } from "@/lib/storefront/analytics-events";
import type { StorefrontCatalogProduct } from "@/lib/storefront/catalog-types";
import { patchStorefrontCart } from "@/lib/storefront/cart-api-client";
import { productUrlSegment } from "@/lib/storefront/resolve-product-ref";
import { ingestStorefrontFirstPartyEvent } from "@/lib/storefront/storefront-first-party-ingest";
import { formatCurrency } from "@/lib/utils";
import { useStorefrontCart } from "@/hooks/use-storefront-cart";

export function StoreCartClient({
  slug,
  currency,
  products,
  priceVersion,
  orderingPaused,
}: {
  slug: string;
  currency: string;
  products: StorefrontCatalogProduct[];
  priceVersion: string;
  orderingPaused: boolean;
}) {
  const searchParams = useSearchParams();
  const { cart, warnings, bump, syncing, loading } = useStorefrontCart(slug, priceVersion);

  React.useEffect(() => {
    const token = searchParams.get("recover");
    if (!token) return;
    void fetch(`/api/storefront/cart-recovery?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: { ok?: boolean; cart?: Record<string, number>; storeSlug?: string }) => {
        if (!data.ok || !data.cart || data.storeSlug !== slug) return;
        void patchStorefrontCart({ storeSlug: slug, lines: data.cart, merge: true });
      })
      .catch(() => undefined);
  }, [searchParams, slug]);

  React.useEffect(() => {
    void ingestStorefrontFirstPartyEvent({
      storeSlug: slug,
      eventName: STOREFRONT_ANALYTICS_EVENTS.cartView,
      path: typeof window !== "undefined" ? window.location.pathname : "/cart",
    });
  }, [slug]);

  React.useEffect(() => {
    for (const w of warnings) {
      if (w.code === "MENU_CHANGED" || w.code === "PRICE_CHANGED") {
        toast.message(w.message);
      }
    }
  }, [warnings]);

  const lines = cart?.lines ?? [];
  const subtotal = cart?.subtotal ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
          <p className="mt-2 text-muted-foreground">Review items before checkout — prices from the live menu.</p>
        </div>
        <Button asChild variant="premium" className="rounded-full" disabled={orderingPaused || lines.length === 0}>
          <Link href={`/s/${slug}/checkout`}>Continue to checkout</Link>
        </Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Syncing cart…</p> : null}

      {lines.length === 0 && !loading ? (
        <p className="text-muted-foreground">
          Cart is empty —{" "}
          <Link href={`/s/${slug}/menu`} className="text-primary underline-offset-4 hover:underline">
            browse the menu
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-4">
          {lines.map((line) => {
            const p = products.find((x) => x.id === line.productId);
            if (!p) return null;
            return (
              <li
                key={line.productId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <Link href={`/s/${slug}/products/${productUrlSegment(p)}`} className="font-semibold hover:underline">
                    {line.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Prepared {format(new Date(p.preparedDate), "EEE MMM d")}
                    {line.soldOut ? " · Sold out" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={syncing}
                    onClick={() => void bump(line.productId, -1)}
                  >
                    −
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full"
                    disabled={syncing || !line.canAddToCart}
                    onClick={() => void bump(line.productId, 1)}
                  >
                    +
                  </Button>
                  <span className="min-w-[4rem] text-right font-medium tabular-nums">
                    {formatCurrency(line.lineTotal, currency)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {lines.length > 0 ? (
        <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
      ) : null}
    </div>
  );
}
