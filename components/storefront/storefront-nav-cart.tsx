"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useStorefrontCart } from "@/hooks/use-storefront-cart";

export function StorefrontNavCart({
  storeSlug,
  priceVersion,
}: {
  storeSlug: string;
  priceVersion?: string;
}) {
  const { itemCount } = useStorefrontCart(storeSlug, priceVersion);

  return (
    <div className="flex items-center gap-1">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="relative rounded-full px-3 dark:hover:bg-gray-800"
      >
        <Link href={`/s/${storeSlug}/cart`} aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}>
          <span aria-hidden className="mr-1">
            🛒
          </span>
          Cart
          {itemCount > 0 ? (
            <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--store-accent,hsl(var(--primary)))] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          ) : null}
        </Link>
      </Button>
      <Button asChild size="sm" className="hidden rounded-full sm:inline-flex sf-btn-primary">
        <Link href={`/s/${storeSlug}/checkout`}>Checkout</Link>
      </Button>
    </div>
  );
}
