"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StorefrontCatalogModifierGroup, StorefrontCatalogVariant } from "@/lib/storefront/catalog-types";
import { STOREFRONT_ANALYTICS_EVENTS } from "@/lib/storefront/analytics-events";
import { ingestStorefrontFirstPartyEvent } from "@/lib/storefront/storefront-first-party-ingest";
import { validateRequiredModifiers } from "@/lib/storefront/modifier-validation";
import { storefrontPdpImageUrl } from "@/lib/storefront/product-image-url";
import { formatCurrency } from "@/lib/utils";
import { useStorefrontCart } from "@/hooks/use-storefront-cart";

export function StoreProductDetailClient({
  slug,
  currency,
  product,
  priceVersion,
}: {
  slug: string;
  currency: string;
  priceVersion: string;
  product: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    preparedDate: string;
    image: string | null;
    allergens: string | null;
    ingredients: string | null;
    reheatingInstructions: string | null;
    nutrition: {
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      sodium: number | null;
      servingSize: string | null;
    } | null;
    labelDisclaimer?: string | null;
    variants: StorefrontCatalogVariant[];
    modifierGroups: StorefrontCatalogModifierGroup[];
  };
}) {
  const { bump, syncing, cart } = useStorefrontCart(slug, priceVersion);
  const [variantId, setVariantId] = React.useState<string | undefined>(
    product.variants[0]?.id,
  );
  const [modifierIds, setModifierIds] = React.useState<string[]>([]);

  const selectedVariant = product.variants.find((v) => v.id === variantId);
  const unitPrice = selectedVariant?.price ?? product.price;
  const modifierValidation = validateRequiredModifiers(product.modifierGroups, modifierIds);
  const canAdd =
    modifierValidation.ok &&
    (selectedVariant ? selectedVariant.canAddToCart && !selectedVariant.soldOut : true);

  const lineQty =
    cart?.lines.find(
      (l) =>
        l.productId === product.id &&
        l.variantId === variantId &&
        JSON.stringify(l.modifierOptionIds ?? []) === JSON.stringify(modifierIds),
    )?.quantity ?? 0;

  React.useEffect(() => {
    void ingestStorefrontFirstPartyEvent({
      storeSlug: slug,
      eventName: STOREFRONT_ANALYTICS_EVENTS.viewItem,
      path: typeof window !== "undefined" ? window.location.pathname : "",
      metadata: { productId: product.id },
    });
  }, [slug, product.id]);

  async function changeQty(delta: number) {
    if (delta > 0 && !modifierValidation.ok) {
      toast.error(modifierValidation.message ?? "Complete required options first.");
      return;
    }
    const res = await bump(product.id, delta, {
      variantId,
      modifierOptionIds: modifierIds.length ? modifierIds : undefined,
    });
    if (!res.ok) toast.error(res.error ?? "Could not update cart");
    else if (delta > 0) {
      void ingestStorefrontFirstPartyEvent({
        storeSlug: slug,
        eventName: STOREFRONT_ANALYTICS_EVENTS.addToCart,
        metadata: { productId: product.id, variantId },
      });
    }
  }

  function toggleModifier(groupId: string, optionId: string, max: number) {
    setModifierIds((prev) => {
      const groupOptions = product.modifierGroups.find((g) => g.id === groupId)?.options.map((o) => o.id) ?? [];
      const withoutGroup = prev.filter((id) => !groupOptions.includes(id));
      if (prev.includes(optionId)) return withoutGroup;
      if (max === 1) return [...withoutGroup, optionId];
      if (withoutGroup.length >= max) return prev;
      return [...prev, optionId];
    });
  }

  const prepared = new Date(product.preparedDate);
  const pdpImage = storefrontPdpImageUrl(product.image);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        {pdpImage ? (
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-sm">
            <Image
              src={pdpImage}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        ) : null}
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
        <p className="text-sm font-medium text-[var(--store-accent,#FF5F1F)]">
          Prepared {format(prepared, "EEEE, MMM d")}
        </p>
        <p className="text-2xl font-semibold tabular-nums">{formatCurrency(unitPrice, currency)}</p>
        {product.variants.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Choose option</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <Button
                  key={v.id}
                  type="button"
                  size="sm"
                  variant={variantId === v.id ? "default" : "outline"}
                  className="rounded-full"
                  disabled={v.soldOut}
                  onClick={() => setVariantId(v.id)}
                >
                  {v.title}
                  {v.soldOut ? " (sold out)" : ""}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
        {product.modifierGroups.map((g) => (
          <div key={g.id} className="space-y-2">
            <p className="text-sm font-medium">
              {g.name}
              {g.required ? " *" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {g.options.map((o) => (
                <Button
                  key={o.id}
                  type="button"
                  size="sm"
                  variant={modifierIds.includes(o.id) ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => toggleModifier(g.id, o.id, g.maxSelections)}
                >
                  {o.name}
                  {o.priceAdjustment > 0 ? ` +${formatCurrency(o.priceAdjustment, currency)}` : ""}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {product.description ? <p className="text-muted-foreground">{product.description}</p> : null}
        {product.labelDisclaimer ? (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
            {product.labelDisclaimer}
          </p>
        ) : null}
        {product.allergens ? (
          <div>
            <p className="text-sm font-medium">Allergens</p>
            <p className="text-sm text-muted-foreground">{product.allergens}</p>
          </div>
        ) : null}
        {product.ingredients ? (
          <div>
            <p className="text-sm font-medium">Ingredients</p>
            <p className="text-sm text-muted-foreground">{product.ingredients}</p>
          </div>
        ) : null}
        {product.nutrition ? (
          <div className="flex flex-wrap gap-2">
            {product.nutrition.calories != null ? (
              <Badge variant="secondary" className="rounded-full">
                {product.nutrition.calories} kcal
              </Badge>
            ) : null}
          </div>
        ) : null}
        {!modifierValidation.ok && product.modifierGroups.some((g) => g.required) ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">{modifierValidation.message}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={syncing}
            onClick={() => void changeQty(-1)}
          >
            −
          </Button>
          <span className="w-8 text-center font-medium">{lineQty}</span>
          <Button
            type="button"
            className="rounded-full"
            disabled={syncing || !canAdd}
            onClick={() => void changeQty(1)}
          >
            +
          </Button>
          <Button asChild variant="premium" className="rounded-full">
            <Link href={`/s/${slug}/cart`}>View cart</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
