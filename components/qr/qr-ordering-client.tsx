"use client";

import * as React from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

import type { QrOrderingContext } from "@/services/qr/qr-ordering-service";
import {
  qrGuestCategoryPillClass,
  qrGuestDrawerSheetClass,
  qrGuestPrimaryCtaClass,
  qrGuestShellClass,
  qrGuestStickyFooterClass,
  qrGuestTouchCompactClass,
} from "@/lib/qr/qr-guest-mobile-ui";
import { formatCurrency } from "@/lib/utils";
import { storefrontMenuImageUrl } from "@/lib/storefront/product-image-url";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CartLine = { productId: string; quantity: number };

export function QrOrderingClient({ context }: { context: QrOrderingContext }) {
  const [activeCategory, setActiveCategory] = React.useState(context.categories[0] ?? "MAINS");
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState<{
    estimatedWaitMinutes: number;
    lookupToken: string;
  } | null>(null);

  const productsByCategory = React.useMemo(() => {
    const map = new Map<string, typeof context.products>();
    for (const cat of context.categories) map.set(cat, [...context.products]);
    return map;
  }, [context.categories, context.products]);

  const cartLines: CartLine[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([productId, quantity]) => ({ productId, quantity }));

  const cartCount = cartLines.reduce((s, l) => s + l.quantity, 0);
  const cartTotal = cartLines.reduce((sum, line) => {
    const p = context.products.find((x) => x.id === line.productId);
    return sum + (p ? Number(p.price) * line.quantity : 0);
  }, 0);

  function bump(productId: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const q = (next[productId] ?? 0) + delta;
      if (q <= 0) delete next[productId];
      else next[productId] = q;
      return next;
    });
  }

  async function placeOrder() {
    if (!cartLines.length) {
      toast.error("Add items to your order first.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/public/qr-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: context.storeSlug,
          tableRouteId: context.tableRouteId,
          lines: cartLines,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        estimatedWaitMinutes?: number;
        lookupToken?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.lookupToken) {
        toast.error(data.error ?? "Could not place order");
        return;
      }
      setConfirmation({
        estimatedWaitMinutes: data.estimatedWaitMinutes ?? 15,
        lookupToken: data.lookupToken,
      });
      setDrawerOpen(false);
      setCart({});
    } catch {
      toast.error("Network error — try again.");
    } finally {
      setPending(false);
    }
  }

  const visible = productsByCategory.get(activeCategory) ?? [];

  if (confirmation) {
    return (
      <div
        className={cn(
          qrGuestShellClass,
          "flex flex-col items-center justify-center px-4 py-16 text-center",
        )}
        data-testid="qr-order-confirmation"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-semibold">Order sent to the kitchen</h1>
        <p className="mt-2 text-zinc-400">
          {context.tableLabel} · {context.restaurantName}
        </p>
        <p className="mt-6 text-4xl font-bold text-emerald-400">
          ~{confirmation.estimatedWaitMinutes} min
        </p>
        <p className="mt-1 text-sm text-zinc-400">Estimated wait time</p>
        <p className="mt-8 font-mono text-xs text-zinc-500">Ref {confirmation.lookupToken}</p>
      </div>
    );
  }

  return (
    <div className={cn(qrGuestShellClass, "pb-28")} data-testid="qr-ordering-page">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
          {context.tableLabel}
        </p>
        <h1 className="text-xl font-semibold">{context.restaurantName}</h1>
        <p className="text-sm text-zinc-400">Scan · order · no app required</p>
      </header>

      <div className="sticky top-[88px] z-10 border-b border-zinc-800 bg-zinc-950 px-2 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {context.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                qrGuestCategoryPillClass,
                "transition-colors",
                activeCategory === cat
                  ? "bg-sky-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
              )}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-3 p-4">
        {visible.map((p) => {
          const qty = cart[p.id] ?? 0;
          const img = storefrontMenuImageUrl(p.image);
          return (
            <li
              key={p.id}
              className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3"
              data-testid={`qr-menu-item-${p.id}`}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                {img ? (
                  <Image src={img} alt={p.title} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🍽️</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{p.title}</p>
                <p className="mt-1 text-sm font-semibold text-sky-300">
                  {formatCurrency(Number(p.price), context.currency)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={cn("rounded-full border-zinc-700 bg-zinc-800", qrGuestTouchCompactClass)}
                    onClick={() => bump(p.id, -1)}
                    disabled={qty === 0}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
                    {qty}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    className={cn("rounded-full bg-sky-600 hover:bg-sky-500", qrGuestTouchCompactClass)}
                    onClick={() => bump(p.id, 1)}
                    aria-label="Add item"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {cartCount > 0 ? (
        <div className={qrGuestStickyFooterClass}>
          <Button
            type="button"
            className={cn("rounded-full bg-sky-600 hover:bg-sky-500", qrGuestPrimaryCtaClass)}
            onClick={() => setDrawerOpen(true)}
            data-testid="qr-open-cart"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            View cart · {cartCount} · {formatCurrency(cartTotal, context.currency)}
          </Button>
        </div>
      ) : null}

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60">
          <div className={qrGuestDrawerSheetClass} data-testid="qr-cart-drawer">
            <div
              className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-600"
              aria-hidden
              data-testid="qr-cart-drawer-handle"
            />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your order</h2>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn("rounded-full", qrGuestTouchCompactClass)}
                onClick={() => setDrawerOpen(false)}
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ul className="max-h-[50vh] space-y-3 overflow-y-auto">
              {cartLines.map((line) => {
                const p = context.products.find((x) => x.id === line.productId);
                if (!p) return null;
                return (
                  <li key={line.productId} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      {line.quantity}× {p.title}
                    </span>
                    <span className="tabular-nums">
                      {formatCurrency(Number(p.price) * line.quantity, context.currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(cartTotal, context.currency)}</span>
            </div>
            <Button
              type="button"
              className={cn("mt-4 rounded-full bg-sky-600", qrGuestPrimaryCtaClass)}
              disabled={pending}
              onClick={() => void placeOrder()}
              data-testid="qr-place-order"
            >
              {pending ? "Sending…" : "Place order"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
