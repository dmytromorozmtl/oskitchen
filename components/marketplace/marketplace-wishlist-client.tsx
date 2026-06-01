"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { addMarketplaceProductToCartAction } from "@/actions/marketplace/cart";
import { loadMarketplaceWishlistProductsAction } from "@/actions/marketplace/wishlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MARKETPLACE_MOBILE_CARD_CLASS } from "@/lib/marketplace/mobile-ui";
import {
  readMarketplaceWishlistSlugs,
  removeMarketplaceWishlistSlug,
} from "@/lib/marketplace/wishlist";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceWishlistProduct } from "@/services/marketplace/marketplace-catalog-service";

export function MarketplaceWishlistClient({ canAddToCart }: { canAddToCart: boolean }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<MarketplaceWishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const saved = readMarketplaceWishlistSlugs();
    setSlugs(saved);
    if (saved.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    void loadMarketplaceWishlistProductsAction(saved).then((result) => {
      if (result.ok) {
        setProducts(result.products);
      }
      setLoading(false);
    });
  }, []);

  function removeSlug(slug: string) {
    const next = removeMarketplaceWishlistSlug(slug);
    setSlugs(next);
    setProducts((current) => current.filter((product) => product.slug !== slug));
    toast.success("Removed from wish list");
  }

  function addToCart(product: MarketplaceWishlistProduct) {
    if (!canAddToCart) return;
    setPendingSlug(product.slug);
    startTransition(async () => {
      const result = await addMarketplaceProductToCartAction({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        quantity: product.moq,
        unitPrice: product.basePrice,
        currency: product.currency,
      });
      setPendingSlug(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Added to cart");
    });
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading saved items…</p>;
  }

  if (slugs.length === 0) {
    return (
      <div className={`${MARKETPLACE_MOBILE_CARD_CLASS} py-12 text-center`}>
        <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">No saved items yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse the catalog and save items for later.
        </p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} className={MARKETPLACE_MOBILE_CARD_CLASS}>
          <div className="flex gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No photo
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/marketplace/products/${product.slug}`}
                className="font-medium hover:underline"
              >
                {product.name}
              </Link>
              <p className="text-sm text-muted-foreground">{product.vendorName}</p>
              <p className="mt-1 font-semibold tabular-nums">
                {formatCurrency(product.basePrice, product.currency)}
              </p>
              <Badge variant="outline" className="mt-2 rounded-full">
                {product.inStock ? "In stock" : "Out of stock"}
              </Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {canAddToCart ? (
              <Button
                size="sm"
                className="rounded-full min-h-11 flex-1 gap-1"
                disabled={isPending && pendingSlug === product.slug}
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              className="rounded-full min-h-11"
              onClick={() => removeSlug(product.slug)}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
