"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  removeMarketplaceCartItemAction,
  updateMarketplaceCartQuantityAction,
} from "@/actions/marketplace/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MARKETPLACE_TOUCH_BUTTON_CLASS, MARKETPLACE_TOUCH_INPUT_CLASS } from "@/lib/marketplace/mobile-ui";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceCartClientView } from "@/services/marketplace/cart-service";

export function MarketplaceMobileCartDrawer({
  initialCart,
  canEdit,
}: {
  initialCart: MarketplaceCartClientView | null;
  canEdit: boolean;
}) {
  const [cart, setCart] = useState(initialCart);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setCart(initialCart);
  }, [initialCart]);

  const itemCount = cart?.itemCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const currency = cart?.items[0]?.currency ?? "USD";

  if (!cart || itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="lg" className="h-14 rounded-full px-5 shadow-lg gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({itemCount})
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Marketplace cart</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {cart.items.map((item, index) => (
              <div key={`${item.productId}-${item.variantId ?? "base"}`} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.vendorName}</p>
                  </div>
                  <Badge variant="outline">
                    {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                  </Badge>
                </div>
                {canEdit ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      defaultValue={item.quantity}
                      className={`w-20 ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
                      onBlur={(event) => {
                        const quantity = Number(event.target.value);
                        if (!Number.isFinite(quantity) || quantity < 1) return;
                        startTransition(async () => {
                          const result = await updateMarketplaceCartQuantityAction(index, quantity);
                          if (!result.ok) toast.error(result.error ?? "Update failed");
                        });
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className={MARKETPLACE_TOUCH_BUTTON_CLASS}
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await removeMarketplaceCartItemAction(index);
                          if (!result.ok) toast.error(result.error ?? "Remove failed");
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="font-semibold">{formatCurrency(subtotal, currency)}</p>
            <Button asChild className={`rounded-full ${MARKETPLACE_TOUCH_BUTTON_CLASS}`}>
              <Link href="/dashboard/marketplace/checkout" onClick={() => setOpen(false)}>
                Checkout
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
