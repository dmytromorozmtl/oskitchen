"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronUp, Minus, Plus, ShoppingCart, Smartphone } from "lucide-react";

import { posCheckoutAction } from "@/actions/pos";
import { OfflineSyncStatusBar } from "@/components/dashboard/offline-sync-status-bar";
import { broadcastOfflineSyncState } from "@/hooks/use-offline-sync-status";
import { createPosSwipeHandlers } from "@/lib/pos/pos-mobile-gestures";
import {
  filterPosMobileProducts,
  posMobileCartSubtotal,
  posMobileProductCategories,
  type PosMobileCartLine,
  type PosMobileProduct,
} from "@/lib/pos/pos-mobile-cart";
import { MOBILE_FIRST_REDESIGN_POS_VIEWPORT_PX } from "@/lib/design/mobile-first-redesign-absolute-final-policy";
import { POS_MOBILE_POS_MIN_TOUCH_PX } from "@/lib/pos/pos-mobile-pos-policy";
import {
  posTerminalDecreaseQuantityLabel,
  posTerminalIncreaseQuantityLabel,
} from "@/lib/pos/pos-terminal-icon-button-labels";
import {
  classifyOfflineCheckoutError,
  resolveOfflineSyncConflict,
} from "@/lib/pos/offline-sync";
import {
  enqueueOfflinePosCheckout,
  listOfflinePosCheckouts,
  registerOfflinePosBackgroundSync,
  removeOfflinePosCheckout,
  updateOfflinePosCheckout,
} from "@/lib/pos/offline-pos-queue";
import type { PosConflictResolutionStrategy } from "@/lib/pos/pos-settings";
import { posCheckoutButtonClass, posTouchCompactClass } from "@/lib/pos/touch-targets";
import { posPaymentAllowedWhileOffline } from "@/services/pos/pos-payment-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PosMobileClientProps = {
  registers: Array<{ id: string; name: string; locationId: string | null }>;
  staff: Array<{ id: string; name: string }>;
  products: PosMobileProduct[];
  openShiftsByRegisterId: Record<string, { id: string } | null>;
  offlineQueueEnabled?: boolean;
  conflictResolution?: PosConflictResolutionStrategy;
};

export function PosMobileClient(props: PosMobileClientProps) {
  const offlineQueueEnabled = props.offlineQueueEnabled ?? true;
  const conflictResolution = props.conflictResolution ?? "manual_review";
  const registerId = props.registers[0]?.id ?? "";
  const staffId = props.staff[0]?.id ?? "";

  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<PosMobileCartLine[]>([]);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [swipeHint, setSwipeHint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const categories = useMemo(() => posMobileProductCategories(props.products), [props.products]);
  const visibleProducts = useMemo(
    () => filterPosMobileProducts({ products: props.products, category, query }),
    [props.products, category, query],
  );
  const subtotal = posMobileCartSubtotal(cart);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    registerOfflinePosBackgroundSync();
    const onOnline = () => {
      setOnline(true);
      void flushOfflineQueue();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [offlineQueueEnabled, conflictResolution]);

  async function flushOfflineQueue() {
    if (!offlineQueueEnabled) return;
    const queued = await listOfflinePosCheckouts();
    const pendingRows = queued.filter((entry) => entry.syncStatus !== "conflict");
    if (!pendingRows.length) return;

    broadcastOfflineSyncState("syncing");
    for (const entry of pendingRows) {
      await updateOfflinePosCheckout(entry.id, { syncStatus: "syncing" });
      const payload = {
        ...(entry.payload as Parameters<typeof posCheckoutAction>[0]),
        offlineSaleId: entry.id,
      };
      const res = await posCheckoutAction(payload);
      if (res.ok) {
        await removeOfflinePosCheckout(entry.id);
        continue;
      }
      const reason = classifyOfflineCheckoutError(res.error);
      const resolution = resolveOfflineSyncConflict({
        strategy: conflictResolution,
        conflict: { offlineSaleId: entry.id, reason, message: res.error },
      });
      if (resolution === "remove") {
        await removeOfflinePosCheckout(entry.id);
      } else {
        await updateOfflinePosCheckout(entry.id, {
          syncStatus: "conflict",
          syncError: res.error,
          conflictReason: reason,
        });
      }
    }
    broadcastOfflineSyncState("idle");
  }

  function addProduct(product: PosMobileProduct) {
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...prev,
        {
          key: product.id,
          productId: product.id,
          title: product.title,
          quantity: 1,
          unitPrice: product.price,
        },
      ];
    });
    setSwipeHint(`Added ${product.title}`);
    window.setTimeout(() => setSwipeHint(null), 1200);
  }

  function adjustLine(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.key === key ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function checkoutCash() {
    if (!registerId) {
      setStatus("Create a register before checkout.");
      return;
    }
    if (!cart.length) {
      setStatus("Add items before checkout.");
      return;
    }

    const payload = {
      registerId,
      shiftId: props.openShiftsByRegisterId[registerId]?.id ?? null,
      staffMemberId: staffId || null,
      locationId: props.registers.find((register) => register.id === registerId)?.locationId ?? null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP" as const,
      paymentMode: "CASH" as const,
      notes: "Mobile POS — phone counter sale",
      lines: cart.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    };

    if (!online && offlineQueueEnabled && posPaymentAllowedWhileOffline("CASH")) {
      startTransition(async () => {
        await enqueueOfflinePosCheckout(payload);
        setCart([]);
        setCartExpanded(false);
        setStatus("Offline — sale queued. Will sync when back online.");
        broadcastOfflineSyncState("idle");
      });
      return;
    }
    if (!online) {
      setStatus("Reconnect or enable offline queue for cash checkout.");
      return;
    }

    startTransition(async () => {
      const res = await posCheckoutAction(payload);
      if (!res.ok) {
        setStatus(res.error);
        return;
      }
      setCart([]);
      setCartExpanded(false);
      setStatus(`Sale complete — order ${res.orderId.slice(0, 8)}…`);
    });
  }

  const { touchAction: cartTouchAction, ...cartHandleSwipe } = createPosSwipeHandlers({
    onSwipe: (direction) => {
      if (direction === "up") setCartExpanded(true);
      if (direction === "down") setCartExpanded(false);
    },
    onTap: () => setCartExpanded((open) => !open),
  });

  return (
    <div
      className="relative mx-auto max-w-md space-y-3 pb-36 touch-manipulation"
      data-testid="pos-mobile-shell"
      data-mobile-first-viewport={MOBILE_FIRST_REDESIGN_POS_VIEWPORT_PX}
    >
      <div className="sticky top-0 z-20 space-y-2 rounded-2xl border border-border/70 bg-background/95 p-3 backdrop-blur">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <h1 className="text-lg font-semibold">Mobile POS</h1>
              <p className="text-xs text-muted-foreground">Swipe right to add · one-hand checkout</p>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full text-[10px] uppercase">
            {POS_MOBILE_POS_MIN_TOUCH_PX}px+
          </Badge>
        </div>
        <OfflineSyncStatusBar className="w-full" showWhenIdle={offlineQueueEnabled} />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search menu…"
          className="h-12 rounded-xl text-base touch-manipulation"
          data-testid="pos-mobile-search"
        />
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categories">
          {categories.map((value) => (
            <Button
              key={value}
              type="button"
              role="tab"
              aria-selected={category === value}
              variant={category === value ? "default" : "outline"}
              size="sm"
              className={cn("shrink-0 rounded-full min-h-11", posTouchCompactClass)}
              onClick={() => setCategory(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      {swipeHint ? (
        <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-700">
          {swipeHint}
        </p>
      ) : null}
      {status ? (
        <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <ul className="space-y-2" data-testid="pos-mobile-product-list">
        {visibleProducts.map((product) => {
          const { touchAction, ...swipe } = createPosSwipeHandlers({
            onSwipe: (direction) => {
              if (direction === "right") addProduct(product);
            },
            onTap: () => addProduct(product),
          });
          return (
            <li key={product.id}>
              <div
                style={{ touchAction }}
                {...swipe}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 touch-manipulation active:bg-muted/40"
                data-testid="pos-mobile-product-row"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.title}</p>
                  <p className="text-xs text-muted-foreground">Swipe right → add</p>
                </div>
                <span className="shrink-0 text-lg font-semibold tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {cartExpanded ? (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm"
          onClick={() => setCartExpanded(false)}
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-3xl border border-border/80 bg-card shadow-2xl transition-transform duration-200",
          cartExpanded ? "translate-y-0" : "translate-y-[calc(100%-5.5rem)]",
        )}
        data-testid="pos-mobile-cart-sheet"
      >
        <div
          className="flex cursor-pointer flex-col items-center gap-1 border-b border-border/60 px-4 py-3 touch-manipulation"
          style={{ touchAction: cartTouchAction }}
          {...cartHandleSwipe}
          data-testid="pos-mobile-cart-handle"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          <div className="flex w-full items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronUp className={cn("h-4 w-4 transition", cartExpanded && "rotate-180")} />
              Swipe up
            </span>
            <span className="text-lg font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="max-h-[45vh] space-y-2 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Cart empty — tap or swipe right on a product.
            </p>
          ) : (
            cart.map((line) => (
              <div
                key={line.key}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{line.title}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    ${line.unitPrice.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={posTouchCompactClass}
                    aria-label={posTerminalDecreaseQuantityLabel(line.title)}
                    onClick={() => adjustLine(line.key, -1)}
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {line.quantity}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={posTouchCompactClass}
                    aria-label={posTerminalIncreaseQuantityLabel(line.title)}
                    onClick={() => adjustLine(line.key, 1)}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 border-t border-border/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            className={posCheckoutButtonClass}
            disabled={pending || !cart.length}
            onClick={checkoutCash}
            data-testid="pos-mobile-checkout"
          >
            Cash checkout · ${subtotal.toFixed(2)}
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full rounded-full">
            <Link href="/dashboard/pos/tablet">Open tablet POS</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
