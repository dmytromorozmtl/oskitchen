"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import {
  addMarketplaceProductToCartAction,
} from "@/actions/marketplace/cart";
import { sendMarketplaceVendorMessageAction } from "@/actions/marketplace/product-detail";
import { MarketplaceProductGallery } from "@/components/marketplace/marketplace-product-gallery";
import { MarketplaceProductReviewsSection } from "@/components/marketplace/marketplace-product-reviews-section";
import { WishlistButton } from "@/components/marketplace/wishlist-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type MarketplaceProductDetail,
} from "@/services/marketplace/marketplace-product-detail-service";
import { resolveUnitPrice } from "@/lib/marketplace/pricing-utils";
import { formatCurrency } from "@/lib/utils";

export function MarketplaceProductDetailClient({
  product,
  canAddToCart,
  initialQuantity,
  autoAdd,
}: {
  product: MarketplaceProductDetail;
  canAddToCart: boolean;
  initialQuantity?: number;
  autoAdd?: boolean;
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(
    Math.max(product.moq, initialQuantity ?? product.moq),
  );
  const [contactMessage, setContactMessage] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const autoAddedRef = useRef(false);

  const selectedVariant = product.variants.find((variant) => variant.id === variantId) ?? null;
  const unitPrice = useMemo(
    () => resolveUnitPrice(product, quantity, selectedVariant?.price ?? null),
    [product, quantity, selectedVariant?.price],
  );

  const inStock =
    selectedVariant != null
      ? selectedVariant.stockQty > 0 || product.allowBackorder
      : product.stockQty > 0 || product.allowBackorder;

  function adjustQuantity(delta: number) {
    setQuantity((current) => {
      const next = current + delta * product.orderIncrement;
      return Math.max(product.moq, next);
    });
  }

  function addToCart(showToast = true) {
    if (!canAddToCart) {
      toast.error("You do not have permission to update the cart.");
      return;
    }
    startTransition(async () => {
      const result = await addMarketplaceProductToCartAction({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: selectedVariant?.sku ?? product.sku,
        vendorId: product.vendor.id,
        vendorName: product.vendor.companyName,
        quantity,
        unitPrice,
        currency: product.currency,
        variantId: selectedVariant?.id,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (showToast) toast.success("Added to marketplace cart");
    });
  }

  useEffect(() => {
    if (autoAddedRef.current || !autoAdd || !canAddToCart) return;
    autoAddedRef.current = true;
    startTransition(async () => {
      const result = await addMarketplaceProductToCartAction({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: selectedVariant?.sku ?? product.sku,
        vendorId: product.vendor.id,
        vendorName: product.vendor.companyName,
        quantity: Math.max(product.moq, initialQuantity ?? product.moq),
        unitPrice: resolveUnitPrice(
          product,
          Math.max(product.moq, initialQuantity ?? product.moq),
          selectedVariant?.price ?? null,
        ),
        currency: product.currency,
        variantId: selectedVariant?.id,
      });
      if (result.ok) toast.success("Added to marketplace cart");
    });
  }, [autoAdd, canAddToCart, initialQuantity, product, selectedVariant]);

  function sendContactMessage() {
    startTransition(async () => {
      const result = await sendMarketplaceVendorMessageAction({
        vendorId: product.vendor.id,
        productSlug: product.slug,
        message: contactMessage,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Message sent to vendor");
      setContactMessage("");
      setContactOpen(false);
    });
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <MarketplaceProductGallery name={product.name} media={product.media} />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full capitalize">
                {product.vendor.type.replace(/_/g, " ").toLowerCase()}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {product.categoryName}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Link
                href={`/dashboard/marketplace/vendors/${product.vendor.id}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {product.vendor.companyName}
              </Link>
              {product.vendor.avgRating != null ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {product.vendor.avgRating} ({product.vendor.reviewCount})
                </span>
              ) : (
                <span>No vendor reviews yet</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <p className="text-3xl font-semibold tabular-nums">
              {formatCurrency(unitPrice, product.currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              per {product.priceUnit.replace(/^PER_/, "").replace(/_/g, " ").toLowerCase()}
            </p>

            {product.volumePricing.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[280px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Qty</th>
                      <th className="py-2 font-medium">Unit price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="py-2 pr-3">{product.moq}+</td>
                      <td className="py-2">{formatCurrency(product.basePrice, product.currency)}</td>
                    </tr>
                    {product.volumePricing.map((tier) => (
                      <tr key={tier.minQuantity} className="border-b border-border/60">
                        <td className="py-2 pr-3">{tier.minQuantity}+</td>
                        <td className="py-2">{formatCurrency(tier.price, product.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {product.variants.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="variant">Variant</Label>
              <select
                id="variant"
                value={variantId}
                onChange={(event) => setVariantId(event.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} · {variant.sku}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => adjustQuantity(-1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  value={quantity}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next)) setQuantity(Math.max(product.moq, next));
                  }}
                  className="h-11 w-24 rounded-xl text-center tabular-nums"
                  inputMode="numeric"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => adjustQuantity(1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                MOQ {product.moq} · increment {product.orderIncrement}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant={inStock ? "secondary" : "outline"} className="rounded-full">
              {inStock ? "Available to order" : "Out of stock"}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              Est. delivery {product.expectedDeliveryLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-full gap-2"
              disabled={!canAddToCart || !inStock || pending}
              onClick={() => addToCart()}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>
            <WishlistButton slug={product.slug} productName={product.name} />
            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="rounded-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact vendor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Message {product.vendor.companyName}</DialogTitle>
                </DialogHeader>
                <Textarea
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  rows={5}
                  placeholder={`Ask about ${product.name} (${product.sku})`}
                />
                <DialogFooter>
                  <Button type="button" onClick={sendContactMessage} disabled={pending}>
                    Send message
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible defaultValue="description">
        <AccordionItem value="description">
          <AccordionTrigger>Description</AccordionTrigger>
          <AccordionContent className="space-y-3 whitespace-pre-wrap">
            <p>{product.description}</p>
            {product.richDescription ? <p>{product.richDescription}</p> : null}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="specs">
          <AccordionTrigger>Specifications</AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <tbody>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">SKU</th>
                    <td className="py-2">{product.sku}</td>
                  </tr>
                  {product.gtin ? (
                    <tr className="border-b">
                      <th className="py-2 pr-4 font-medium text-muted-foreground">GTIN</th>
                      <td className="py-2">{product.gtin}</td>
                    </tr>
                  ) : null}
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Lead time</th>
                    <td className="py-2">{product.leadTimeDays} days</td>
                  </tr>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <th className="py-2 pr-4 font-medium capitalize text-muted-foreground">
                        {key.replace(/_/g, " ")}
                      </th>
                      <td className="py-2">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>
        {product.certifications.length > 0 ? (
          <AccordionItem value="certifications">
            <AccordionTrigger>Certifications</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="rounded-full">
                    {cert}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ) : null}
      </Accordion>

      <MarketplaceProductReviewsSection reviews={product.reviews} />

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Similar products from this vendor</h2>
          <div className="grid gap-3">
            {product.similarProducts.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/marketplace/products/${item.slug}`}
                className="rounded-xl border border-border/80 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.vendorName} · {formatCurrency(item.basePrice, item.currency)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Frequently bought together</h2>
          {product.boughtTogether.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Co-purchase suggestions appear after marketplace orders include this SKU.
            </p>
          ) : (
            <div className="grid gap-3">
              {product.boughtTogether.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/marketplace/products/${item.slug}`}
                  className="rounded-xl border border-border/80 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.vendorName} · {formatCurrency(item.basePrice, item.currency)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
