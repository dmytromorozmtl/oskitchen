"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  checkoutMarketplaceCartAction,
} from "@/actions/marketplace/checkout";
import {
  loadMarketplaceCartTemplateAction,
  removeMarketplaceCartItemAction,
  saveMarketplaceCartTemplateAction,
  updateMarketplaceCartQuantityAction,
} from "@/actions/marketplace/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MarketplaceCartClientView } from "@/services/marketplace/cart-service";
import { splitByVendor } from "@/lib/marketplace/checkout-utils";
import { formatCurrency } from "@/lib/utils";

export function MarketplaceCheckoutClient({
  cart,
  canCheckout,
}: {
  cart: MarketplaceCartClientView;
  canCheckout: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const vendorGroups = splitByVendor(cart.items);

  function run(action: () => Promise<{ ok: boolean; error?: string } | { ok: true }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error("error" in result ? result.error : "Action failed.");
        return;
      }
      toast.success("Cart updated.");
    });
  }

  function checkout(paymentMethod: "CARD" | "NET_TERMS" | "ACH" | "WALLET") {
    startTransition(async () => {
      const result = await checkoutMarketplaceCartAction({ paymentMethod });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.requiresApproval
          ? "Orders submitted for manager approval."
          : `Checkout complete — ${result.orderIds.length} purchase order(s) created.`,
      );
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        {cart.items.map((item, index) => (
          <Card key={`${item.productId}-${item.variantId ?? "base"}`} className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {item.vendorName} · {item.sku}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Input
                type="number"
                min={1}
                defaultValue={item.quantity}
                className="h-10 w-24 rounded-xl"
                onBlur={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isFinite(next)) return;
                  run(() => updateMarketplaceCartQuantityAction(index, next));
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={pending}
                onClick={() => run(() => removeMarketplaceCartItemAction(index))}
              >
                Remove
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href={`/dashboard/marketplace/products/${item.slug}`}>View</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span>{cart.itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendors</span>
              <span>{vendorGroups.length}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.subtotal, cart.items[0]?.currency ?? "USD")}</span>
            </div>
          </CardContent>
        </Card>

        {cart.savedTemplates.length > 0 ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Saved carts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cart.savedTemplates.map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full"
                  disabled={pending}
                  onClick={() => run(() => loadMarketplaceCartTemplateAction(template.id))}
                >
                  Load {template.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const name = String(form.get("templateName") ?? "");
                if (!name.trim()) return;
                run(() => saveMarketplaceCartTemplateAction(name));
              }}
            >
              <Label htmlFor="templateName">Save cart template</Label>
              <Input id="templateName" name="templateName" placeholder="Weekly disposables" className="rounded-xl" />
              <Button type="submit" variant="outline" className="w-full rounded-full" disabled={pending}>
                Save template
              </Button>
            </form>

            {canCheckout ? (
              <>
                <Button
                  type="button"
                  className="w-full rounded-full"
                  disabled={pending || cart.items.length === 0}
                  onClick={() => checkout("CARD")}
                >
                  Pay by card
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full rounded-full"
                  disabled={pending || cart.items.length === 0}
                  onClick={() => checkout("NET_TERMS")}
                >
                  Net terms
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                You have read-only cart access. Ask an owner to complete checkout.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
