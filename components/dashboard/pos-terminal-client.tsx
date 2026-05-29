"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CreditCard, Minus, Percent, Plus, ShoppingCart, Tag, UserRound, Wifi, WifiOff } from "lucide-react";

import { posCheckoutAction } from "@/actions/pos";
import { QuickOrderButtons, type QuickOrderItem } from "@/components/pos/quick-order-buttons";
import { posTouchCompactClass, posTouchTileClass } from "@/lib/pos/touch-targets";
import {
  posCheckoutStatusClassName,
  type PosCheckoutStatus,
  type PosCheckoutStatusKind,
  toPosCheckoutStatus,
} from "@/lib/pos/pos-checkout-status";
import { TapToPayButton } from "@/components/pos/pos-payment-methods";
import { posQuickCreateKitchenCustomerAction, posSearchKitchenCustomersAction } from "@/actions/pos-terminal-customers";
import { POS_OFFLINE_LIMITATIONS } from "@/lib/pos/pos-offline";
import {
  enqueueOfflinePosCheckout,
  listOfflinePosCheckouts,
  offlinePosQueueSize,
  registerOfflinePosBackgroundSync,
  removeOfflinePosCheckout,
} from "@/lib/pos/offline-pos-queue";
import type { PaymentModeKey } from "@/lib/orders/order-payment";
import { PAYMENT_MODE_LABEL } from "@/lib/orders/order-payment";
import { posPaymentAllowedWhileOffline } from "@/services/pos/pos-payment-service";
import {
  computePosTerminalAmountDue,
  computePosTerminalDiscountAmount,
  filterPosTerminalPaymentModes,
  parsePosTerminalFixedDiscountInput,
  parsePosTerminalPercentDiscountInput,
  POS_TERMINAL_DISCOUNT_PERCENT_PRESETS,
  type PosTerminalDiscountMode,
} from "@/lib/pos/pos-terminal-discount-ui";
import {
  buildPosProductCategories,
  filterPosProductsForCashierSpeed,
  posCashierSpeedModeLabel,
  posCashierSpeedModeToggleHref,
  posCashierSpeedProductGridClass,
  posCashierSpeedProductTileClass,
  shouldShowPosTerminalSecondaryPanels,
} from "@/lib/pos/pos-cashier-speed-mode-era19";
import { POS_CASHIER_SPEED_MODE_ALL_CATEGORY } from "@/lib/pos/pos-cashier-speed-mode-era19-policy";
import { matchPosShortcut } from "@/lib/keyboard/shortcuts";
import { PosManagerOverrideChecklist } from "@/components/dashboard/pos-manager-override-checklist";
import { PosManagerOverrideHero } from "@/components/dashboard/pos-manager-override-hero";
import {
  shouldShowPosManagerOverrideHero,
  type PosManagerOverrideChecklistInput,
} from "@/lib/pos/pos-manager-override-clarity-era19";
import { POS_MANAGER_OVERRIDE_ANCHOR } from "@/lib/pos/pos-manager-override-clarity-era19-policy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type PosTerminalProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
  barcode: string | null;
  image: string | null;
};

export type PosTerminalRegister = {
  id: string;
  name: string;
  location: { id: string; name: string } | null;
};

export type PosTerminalStaff = { id: string; name: string };

export type PosTerminalRecentCustomer = {
  id: string;
  email: string;
  label: string;
  phone: string | null;
};

type PosCustomerPick = {
  id: string;
  email: string;
  label: string;
  phone: string | null;
};

type CartLine = {
  key: string;
  productId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export function PosTerminalClient(props: {
  registers: PosTerminalRegister[];
  staff: PosTerminalStaff[];
  products: PosTerminalProduct[];
  openShiftsByRegisterId: Record<string, { id: string } | null>;
  recentCustomers?: PosTerminalRecentCustomer[];
  /** When false, search / quick-add are hidden (plan without CRM). */
  customerAttachEnabled?: boolean;
  quickOrderEnabled?: boolean;
  businessType?: string | null;
  /** When true, operator may apply discounts and COMPED payment mode on terminal. */
  canApplyPosDiscount?: boolean;
  /** Rush-hour layout from ?speed=1 — denser grid and checkout-first panels. */
  initialSpeedMode?: boolean;
}) {
  const recentCustomers = props.recentCustomers ?? [];
  const customerAttachEnabled = props.customerAttachEnabled ?? true;
  const canApplyPosDiscount = props.canApplyPosDiscount ?? false;
  const speedMode = props.initialSpeedMode ?? false;
  const showSecondaryPanels = shouldShowPosTerminalSecondaryPanels(speedMode);
  const categories = useMemo(
    () => buildPosProductCategories(props.products),
    [props.products],
  );
  const availablePaymentModes = useMemo(
    () => filterPosTerminalPaymentModes(canApplyPosDiscount),
    [canApplyPosDiscount],
  );
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [registerId, setRegisterId] = useState(props.registers[0]?.id ?? "");
  const [staffId, setStaffId] = useState(props.staff[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentModeKey>("CASH");
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "DINE_IN" | "DELIVERY">("PICKUP");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<PosCheckoutStatus | null>(null);
  const [pendingTerminal, setPendingTerminal] = useState<{ orderId: string; amount: number } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const [quickCustomerPending, startQuickCustomer] = useTransition();

  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomerPick | null>(null);
  const [customerQuery, setCustomerQuery] = useState("");
  const [searchHits, setSearchHits] = useState<PosCustomerPick[]>([]);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(null);
  const [quickCustomerError, setQuickCustomerError] = useState<string | null>(null);
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const searchSeq = useRef(0);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const [customerProfileNotice, setCustomerProfileNotice] = useState<string | null>(null);
  const [loyaltyPointsRedeem, setLoyaltyPointsRedeem] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
  const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null);
  const [queuedSales, setQueuedSales] = useState(0);
  const [discountMode, setDiscountMode] = useState<PosTerminalDiscountMode>("none");
  const [fixedDiscountInput, setFixedDiscountInput] = useState("");
  const [percentDiscountInput, setPercentDiscountInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(POS_CASHIER_SPEED_MODE_ALL_CATEGORY);

  function showCheckoutStatus(text: string, kind?: PosCheckoutStatusKind) {
    setCheckoutStatus(toPosCheckoutStatus(text, kind));
  }

  function resetDiscountState() {
    setDiscountMode("none");
    setFixedDiscountInput("");
    setPercentDiscountInput("");
  }

  function buildCheckoutPayload() {
    const openShiftId = registerId ? props.openShiftsByRegisterId[registerId]?.id ?? null : null;
    const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const discountAmount = computePosTerminalDiscountAmount({
      cartSubtotal: subtotal,
      discountMode,
      fixedAmount: parsePosTerminalFixedDiscountInput(fixedDiscountInput) ?? 0,
      percentValue: parsePosTerminalPercentDiscountInput(percentDiscountInput) ?? 0,
      paymentMode,
    });
    return {
      registerId,
      shiftId: openShiftId,
      staffMemberId: staffId || null,
      locationId: props.registers.find((r) => r.id === registerId)?.location?.id ?? null,
      brandId: null,
      customerId: selectedCustomer?.id ?? null,
      fulfillmentDetail: fulfillment,
      paymentMode,
      lines: cart.map((l) => ({
        productId: l.productId,
        title: l.productId ? undefined : l.title,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
      loyaltyPointsRedeem: loyaltyPointsRedeem
        ? Number.parseInt(loyaltyPointsRedeem, 10)
        : undefined,
      giftCardCode: giftCardCode.trim() || undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    };
  }

  async function flushOfflineQueue() {
    const queued = await listOfflinePosCheckouts();
    if (!queued.length) {
      setQueuedSales(0);
      return;
    }
    for (const entry of queued) {
      const res = await posCheckoutAction(entry.payload as Parameters<typeof posCheckoutAction>[0]);
      if (res.ok) {
        await removeOfflinePosCheckout(entry.id);
      }
    }
    const remaining = await offlinePosQueueSize();
    setQueuedSales(remaining);
    if (remaining === 0 && queued.length) {
      showCheckoutStatus(`Synced ${queued.length} offline sale(s).`, "success");
    }
  }

  useEffect(() => {
    registerOfflinePosBackgroundSync();
    void offlinePosQueueSize().then(setQueuedSales);
    const on = () => {
      setOnline(true);
      void flushOfflineQueue();
    };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "OFFLINE_POS_SYNC") void flushOfflineQueue();
      });
    }
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const q = customerQuery.trim();
    if (q.length < 2) {
      searchSeq.current += 1;
      setSearchHits([]);
      setCustomerSearchError(null);
      setSearchingCustomer(false);
      return;
    }
    const my = ++searchSeq.current;
    const t = setTimeout(async () => {
      setSearchingCustomer(true);
      setCustomerSearchError(null);
      const res = await posSearchKitchenCustomersAction({ q });
      if (my !== searchSeq.current) return;
      setSearchingCustomer(false);
      if (res.ok) {
        setSearchHits(res.customers);
      } else {
        setSearchHits([]);
        setCustomerSearchError(res.error);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [customerQuery]);

  useEffect(() => {
    if (!selectedCustomer?.id) {
      setLoyaltyBalance(null);
      return;
    }
    let cancelled = false;
    void fetch(`/api/loyalty/balance?customerId=${selectedCustomer.id}`)
      .then((r) => r.json())
      .then((data: { balance?: number }) => {
        if (!cancelled) setLoyaltyBalance(data.balance ?? 0);
      })
      .catch(() => {
        if (!cancelled) setLoyaltyBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCustomer?.id]);

  useEffect(() => {
    const code = giftCardCode.trim();
    if (code.length < 4) {
      setGiftCardBalance(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      void fetch(`/api/gift-cards/balance?code=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((data: { balance?: number; error?: string }) => {
          if (!cancelled) setGiftCardBalance(data.error ? null : (data.balance ?? null));
        })
        .catch(() => {
          if (!cancelled) setGiftCardBalance(null);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [giftCardCode]);

  const shiftId = registerId ? props.openShiftsByRegisterId[registerId]?.id ?? null : null;

  const filtered = useMemo(() => {
    if (speedMode) {
      return filterPosProductsForCashierSpeed({
        products: props.products,
        query,
        category: categoryFilter,
      });
    }
    const q = query.trim().toLowerCase();
    if (!q) return props.products;
    return props.products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase() === q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [props.products, query, speedMode, categoryFilter]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    [cart],
  );

  const appliedDiscountAmount = useMemo(
    () =>
      computePosTerminalDiscountAmount({
        cartSubtotal: cartTotal,
        discountMode,
        fixedAmount: parsePosTerminalFixedDiscountInput(fixedDiscountInput) ?? 0,
        percentValue: parsePosTerminalPercentDiscountInput(percentDiscountInput) ?? 0,
        paymentMode,
      }),
    [cartTotal, discountMode, fixedDiscountInput, percentDiscountInput, paymentMode],
  );

  const amountDue = useMemo(
    () =>
      computePosTerminalAmountDue({
        cartSubtotal: cartTotal,
        discountAmount: appliedDiscountAmount,
        paymentMode,
      }),
    [cartTotal, appliedDiscountAmount, paymentMode],
  );

  const fixedDiscountInvalid =
    discountMode === "fixed" &&
    fixedDiscountInput.trim().length > 0 &&
    parsePosTerminalFixedDiscountInput(fixedDiscountInput) == null;

  const percentDiscountInvalid =
    discountMode === "percent" &&
    percentDiscountInput.trim().length > 0 &&
    parsePosTerminalPercentDiscountInput(percentDiscountInput) == null;

  const managerOverrideInput = useMemo<PosManagerOverrideChecklistInput>(
    () => ({
      canApplyPosDiscount,
      discountMode,
      paymentMode,
      cartSubtotal: cartTotal,
      cartItemCount: cart.length,
      fixedDiscountInvalid,
      percentDiscountInvalid,
      fixedDiscountInput,
      percentDiscountInput,
      appliedDiscountAmount,
      amountDue,
    }),
    [
      canApplyPosDiscount,
      discountMode,
      paymentMode,
      cartTotal,
      cart.length,
      fixedDiscountInvalid,
      percentDiscountInvalid,
      fixedDiscountInput,
      percentDiscountInput,
      appliedDiscountAmount,
      amountDue,
    ],
  );

  const showManagerOverrideHero = shouldShowPosManagerOverrideHero(managerOverrideInput);

  useEffect(() => {
    if (!availablePaymentModes.includes(paymentMode)) {
      setPaymentMode("CASH");
    }
  }, [availablePaymentModes, paymentMode]);

  function addQuickItem(item: QuickOrderItem) {
    setCart((prev) => [
      ...prev,
      {
        key: `quick-${item.id}-${Date.now()}`,
        title: item.name,
        quantity: 1,
        unitPrice: item.price,
      },
    ]);
  }

  function addProduct(p: PosTerminalProduct) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [
        ...prev,
        {
          key: `${p.id}-${Date.now()}`,
          productId: p.id,
          title: p.title,
          quantity: 1,
          unitPrice: p.price,
        },
      ];
    });
  }

  function bump(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  function checkout() {
    setCheckoutStatus(null);
    if (!registerId) {
      showCheckoutStatus("Create a register before checking out.", "error");
      return;
    }
    if (!cart.length) {
      showCheckoutStatus("Add at least one item.", "error");
      return;
    }
    if (fixedDiscountInvalid || percentDiscountInvalid) {
      showCheckoutStatus("Enter a valid discount amount before completing the sale.", "error");
      return;
    }
    if (!online && posPaymentAllowedWhileOffline(paymentMode)) {
      startTransition(async () => {
        await enqueueOfflinePosCheckout(buildCheckoutPayload());
        const size = await offlinePosQueueSize();
        setQueuedSales(size);
        setCart([]);
        resetDiscountState();
        showCheckoutStatus("Offline — sale queued. Will sync when back online.", "info");
      });
      return;
    }
    if (!online && !posPaymentAllowedWhileOffline(paymentMode)) {
      showCheckoutStatus("Reconnect before using card or Stripe placeholder modes.", "error");
      return;
    }
    startTransition(async () => {
      const res = await posCheckoutAction(buildCheckoutPayload());
      if (!res.ok) {
        showCheckoutStatus(res.error, "error");
        return;
      }
      if (paymentMode === "CARD_TERMINAL_PLACEHOLDER") {
        setPendingTerminal({ orderId: res.orderId, amount: amountDue });
        setCart([]);
        resetDiscountState();
        showCheckoutStatus(
          `Order ${res.orderId.slice(0, 8)}… ready — tap card to complete payment.`,
          "success",
        );
        return;
      }
      setCart([]);
      resetDiscountState();
      showCheckoutStatus(
        `Sale complete — order ${res.orderId.slice(0, 8)}… receipt ${res.receiptNumber}`,
        "success",
      );
    });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const action = matchPosShortcut(e);
      if (!action) return;
      e.preventDefault();
      if (action === "focus_product_search") {
        productSearchRef.current?.focus();
        return;
      }
      if (action === "add_first_product") {
        const first = filtered[0];
        if (first) addProduct(first);
        return;
      }
      if (action === "payment_cash") {
        setPaymentMode("CASH");
        return;
      }
      if (action === "complete_sale") {
        checkout();
        return;
      }
      if (action === "cancel") {
        setCart([]);
        resetDiscountState();
        setCheckoutStatus(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtered]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <div
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-sm">
            {online ? (
              <Wifi className="h-4 w-4 text-emerald-600" aria-hidden />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-600" aria-hidden />
            )}
            <span className="text-muted-foreground">{online ? "Online" : "Offline / degraded"}</span>
            {queuedSales > 0 ? (
              <span className="text-xs font-medium text-amber-700">{queuedSales} queued sale(s)</span>
            ) : null}
          </div>
          {!online ? (
            <span className="text-xs text-muted-foreground">{POS_OFFLINE_LIMITATIONS[0]}</span>
          ) : null}
        </div>
        {props.quickOrderEnabled ? (
          <QuickOrderButtons
            businessType={props.businessType ?? "RESTAURANT"}
            onItemClick={addQuickItem}
          />
        ) : null}
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            ref={productSearchRef}
            data-testid="pos-product-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              speedMode ? "Search or scan barcode + Enter" : "Search menu or type barcode + Enter"
            }
            className="h-12 rounded-xl text-base"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const hit = props.products.find(
                (p) => p.barcode && p.barcode.toLowerCase() === query.trim().toLowerCase(),
              );
              if (hit) {
                addProduct(hit);
                setQuery("");
              }
            }}
          />
          <Button
            asChild
            variant={speedMode ? "default" : "outline"}
            className="h-12 rounded-xl"
          >
            <Link
              href={posCashierSpeedModeToggleHref(speedMode)}
              data-testid="pos-cashier-speed-mode-toggle"
            >
              {posCashierSpeedModeLabel(speedMode)}
            </Link>
          </Button>
          {!speedMode ? (
            <Button variant="outline" className="h-12 rounded-xl" asChild>
              <Link href="/dashboard/pos/settings/hardware">Hardware</Link>
            </Button>
          ) : null}
        </div>
        {speedMode ? (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            data-testid="pos-speed-category-strip"
            role="tablist"
            aria-label="Product categories"
          >
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                role="tab"
                aria-selected={categoryFilter === category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                className={cn("shrink-0 rounded-full", posTouchCompactClass)}
                data-testid={`pos-speed-category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        ) : null}
        <div
          className={cn(
            "grid flex-1 gap-3 overflow-y-auto pb-24",
            posCashierSpeedProductGridClass(speedMode),
          )}
          data-testid={speedMode ? "pos-speed-product-grid" : "pos-product-grid"}
        >
          {filtered.map((p) => (
            <button
              type="button"
              key={p.id}
              data-testid="pos-product-tile"
              onClick={() => addProduct(p)}
              className={cn(
                `flex ${posTouchTileClass} flex-col rounded-2xl border border-border/80 bg-card text-left shadow-sm transition hover:border-primary/40 hover:shadow-md`,
                posCashierSpeedProductTileClass(speedMode),
              )}
            >
              {!speedMode ? (
                <span className="text-xs uppercase text-muted-foreground">{p.category}</span>
              ) : null}
              <span
                className={cn(
                  "line-clamp-2 font-semibold leading-snug",
                  speedMode ? "text-sm" : "mt-2 text-base",
                )}
              >
                {p.title}
              </span>
              <span
                className={cn(
                  "mt-auto pt-2 font-semibold tabular-nums",
                  speedMode ? "text-base" : "pt-3 text-lg",
                )}
              >
                ${p.price.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Card className="w-full shrink-0 border-border/80 shadow-md lg:max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Cart
          </CardTitle>
          <CardDescription>
            {speedMode
              ? "Speed mode — register, cart, and complete sale first."
              : "Large tap targets for counter service."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Register</Label>
            <Select value={registerId} onValueChange={setRegisterId}>
              <SelectTrigger className="h-12 rounded-xl text-base">
                <SelectValue placeholder="Choose register" />
              </SelectTrigger>
              <SelectContent>
                {props.registers.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                    {r.location ? ` · ${r.location.name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Staff member</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="h-12 rounded-xl text-base">
                <SelectValue placeholder="Staff on sale" />
              </SelectTrigger>
              <SelectContent>
                {props.staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {customerAttachEnabled && showSecondaryPanels ? (
          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
                Customer
              </Label>
              <Button variant="link" className="h-auto p-0 text-xs" asChild>
                <Link href="/dashboard/customers">CRM</Link>
              </Button>
            </div>

            {selectedCustomer ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-tight">{selectedCustomer.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{selectedCustomer.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn("rounded-lg text-xs", posTouchCompactClass)}
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerQuery("");
                        setSearchHits([]);
                        setCustomerProfileNotice(null);
                      }}
                    >
                      Walk-in
                    </Button>
                  </div>
                </div>
                {customerProfileNotice ? (
                  <p className="rounded-lg bg-background/60 px-3 py-2 text-xs leading-snug text-muted-foreground">
                    {customerProfileNotice}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Optional — attach this sale to a CRM profile for history and receipts.
                </p>
                <Input
                  data-testid="pos-customer-query"
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  placeholder="Search name, email, or phone…"
                  className="h-11 rounded-lg text-sm"
                  autoComplete="off"
                />
                {searchingCustomer ? (
                  <p className="text-xs text-muted-foreground">Searching…</p>
                ) : null}
                {customerSearchError ? (
                  <p className="text-xs text-destructive">{customerSearchError}</p>
                ) : null}
                {searchHits.length ? (
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {searchHits.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        data-testid={`pos-customer-select-${c.id}`}
                        className={`flex w-full ${posTouchCompactClass} flex-col rounded-lg border border-border/60 bg-background/90 px-3 py-2 text-left text-sm transition hover:border-primary/40`}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerQuery("");
                          setSearchHits([]);
                          setQuickCustomerError(null);
                          setCustomerProfileNotice(null);
                        }}
                      >
                        <span className="font-medium leading-tight">{c.label}</span>
                        <span className="text-xs text-muted-foreground">{c.email}</span>
                      </button>
                    ))}
                  </div>
                ) : customerQuery.trim().length >= 2 && !searchingCustomer ? (
                  <p className="text-xs text-muted-foreground">No matches — try another term or create below.</p>
                ) : null}

                {recentCustomers.length ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Recent</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentCustomers.map((c) => (
                        <Button
                          key={c.id}
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={cn(
                            "h-auto max-w-[11rem] truncate rounded-full px-3 py-2 text-xs font-normal",
                            posTouchCompactClass,
                          )}
                          title={c.email}
                          onClick={() => {
                            setSelectedCustomer({
                              id: c.id,
                              email: c.email,
                              label: c.label,
                              phone: c.phone,
                            });
                            setQuickCustomerError(null);
                            setCustomerProfileNotice(null);
                          }}
                        >
                          {c.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2 border-t border-border/50 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-full rounded-lg text-xs"
                    onClick={() => {
                      setShowQuickCustomer((v) => !v);
                      setQuickCustomerError(null);
                    }}
                  >
                    {showQuickCustomer ? "Hide quick add" : "Quick new customer"}
                  </Button>
                  {showQuickCustomer ? (
                    <div className="space-y-2">
                      <Input
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        placeholder="Name"
                        className="h-11 rounded-lg text-sm"
                        autoComplete="name"
                      />
                      <Input
                        value={quickEmail}
                        onChange={(e) => setQuickEmail(e.target.value)}
                        placeholder="Email (required)"
                        type="email"
                        className="h-11 rounded-lg text-sm"
                        autoComplete="email"
                      />
                      <Input
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="h-11 rounded-lg text-sm"
                        autoComplete="tel"
                      />
                      {quickCustomerError ? (
                        <p className="text-xs text-destructive">{quickCustomerError}</p>
                      ) : null}
                      <Button
                        type="button"
                        className="h-11 w-full rounded-lg text-sm"
                        disabled={quickCustomerPending}
                        data-testid="pos-customer-quick-create"
                        onClick={() => {
                          setQuickCustomerError(null);
                          startQuickCustomer(async () => {
                            const res = await posQuickCreateKitchenCustomerAction({
                              name: quickName.trim(),
                              email: quickEmail.trim(),
                              phone: quickPhone.trim(),
                            });
                            if (!res.ok) {
                              setQuickCustomerError(res.error);
                              return;
                            }
                            setSelectedCustomer({
                              id: res.customer.id,
                              email: res.customer.email,
                              label: res.customer.label,
                              phone: res.customer.phone,
                            });
                            setCustomerProfileNotice(
                              res.mergedFromExisting
                                ? "This email already had a CRM profile — we linked that record. Empty fields were filled only where your rules allow."
                                : "New CRM profile created and linked to this sale.",
                            );
                            setQuickName("");
                            setQuickEmail("");
                            setQuickPhone("");
                            setShowQuickCustomer(false);
                          });
                        }}
                      >
                        {quickCustomerPending ? "Saving…" : "Create and attach"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
              Linking counter sales to saved CRM customers requires the{" "}
              <span className="font-medium text-foreground">customer CRM</span> entitlement. Walk-in
              checkout is unchanged.
            </div>
          )}

          <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 py-2 text-sm">
            <p className="font-medium">Shift</p>
            <p className="text-muted-foreground">
              {shiftId ? `Open shift ${shiftId.slice(0, 8)}…` : "No open shift — cash variance tracking optional."}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Fulfillment</Label>
            <Select value={fulfillment} onValueChange={(v) => setFulfillment(v as typeof fulfillment)}>
              <SelectTrigger className="h-12 rounded-xl text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PICKUP">Pickup</SelectItem>
                <SelectItem value="DINE_IN">Dine-in</SelectItem>
                <SelectItem value="DELIVERY">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment</Label>
            <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentModeKey)}>
              <SelectTrigger className="h-12 rounded-xl text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePaymentModes.map((k) => (
                  <SelectItem key={k} value={k}>
                    {PAYMENT_MODE_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canApplyPosDiscount ? (
              <p className="text-xs text-muted-foreground">
                Discounts and comps require manager approval (`pos.discount.apply`).
              </p>
            ) : null}
          </div>

          {showSecondaryPanels ? (
          <div
            id={POS_MANAGER_OVERRIDE_ANCHOR}
            className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-3 scroll-mt-24"
          >
            <PosManagerOverrideChecklist {...managerOverrideInput} />
            {showManagerOverrideHero ? <PosManagerOverrideHero {...managerOverrideInput} /> : null}
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" aria-hidden />
                Manager discount
              </Label>
              {canApplyPosDiscount && (discountMode !== "none" || paymentMode === "COMPED") ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  onClick={() => {
                    resetDiscountState();
                    if (paymentMode === "COMPED") setPaymentMode("CASH");
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>

            {canApplyPosDiscount ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={discountMode === "fixed" ? "default" : "outline"}
                    size="sm"
                    className={cn("rounded-full", posTouchCompactClass)}
                    data-testid="pos-discount-mode-fixed"
                    onClick={() => {
                      setDiscountMode("fixed");
                      if (paymentMode === "COMPED") setPaymentMode("CASH");
                    }}
                  >
                    $ Amount
                  </Button>
                  <Button
                    type="button"
                    variant={discountMode === "percent" ? "default" : "outline"}
                    size="sm"
                    className={cn("rounded-full", posTouchCompactClass)}
                    data-testid="pos-discount-mode-percent"
                    onClick={() => {
                      setDiscountMode("percent");
                      if (paymentMode === "COMPED") setPaymentMode("CASH");
                    }}
                  >
                    <Percent className="mr-1 h-3.5 w-3.5" aria-hidden />
                    Percent
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMode === "COMPED" ? "default" : "outline"}
                    size="sm"
                    className={cn("rounded-full", posTouchCompactClass)}
                    data-testid="pos-discount-comp-sale"
                    onClick={() => {
                      setPaymentMode("COMPED");
                      resetDiscountState();
                    }}
                  >
                    Comp sale
                  </Button>
                </div>

                {discountMode === "fixed" && paymentMode !== "COMPED" ? (
                  <div className="space-y-1">
                    <Input
                      data-testid="pos-discount-fixed-input"
                      value={fixedDiscountInput}
                      onChange={(e) => setFixedDiscountInput(e.target.value)}
                      placeholder="Discount amount (e.g. 5.00)"
                      inputMode="decimal"
                      className="h-11 rounded-lg text-sm"
                    />
                    {fixedDiscountInvalid ? (
                      <p className="text-xs text-destructive">Enter a valid discount amount.</p>
                    ) : null}
                  </div>
                ) : null}

                {discountMode === "percent" && paymentMode !== "COMPED" ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {POS_TERMINAL_DISCOUNT_PERCENT_PRESETS.map((pct) => (
                        <Button
                          key={pct}
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={cn("rounded-full px-3", posTouchCompactClass)}
                          data-testid={`pos-discount-preset-${pct}`}
                          onClick={() => setPercentDiscountInput(String(pct))}
                        >
                          {pct}%
                        </Button>
                      ))}
                    </div>
                    <Input
                      data-testid="pos-discount-percent-input"
                      value={percentDiscountInput}
                      onChange={(e) => setPercentDiscountInput(e.target.value)}
                      placeholder="Custom percent (0–100)"
                      inputMode="decimal"
                      className="h-11 rounded-lg text-sm"
                    />
                    {percentDiscountInvalid ? (
                      <p className="text-xs text-destructive">Enter a percent between 0 and 100.</p>
                    ) : null}
                  </div>
                ) : null}

                {paymentMode === "COMPED" ? (
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Comp mode — entire sale recorded as manager-approved comp.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ask a manager to sign in or grant <span className="font-medium">POS discount apply</span>{" "}
                to comp items or apply checkout discounts on this register.
              </p>
            )}
          </div>
          ) : null}

          <div className={cn("max-h-72 space-y-3 overflow-y-auto pr-1", pending && "opacity-60")}>
            {pending ? (
              <div className="space-y-2" aria-hidden>
                <div className="h-16 animate-pulse rounded-xl bg-muted" />
                <div className="h-16 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : null}
            {cart.map((line) => (
              <div
                key={line.key}
                className="flex items-start justify-between gap-2 rounded-xl border border-border/70 bg-background/80 p-3"
              >
                <div>
                  <p className="font-medium leading-snug">{line.title}</p>
                  <p className="text-xs text-muted-foreground">${line.unitPrice.toFixed(2)} each</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={posTouchCompactClass}
                    onClick={() => bump(line.key, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-base font-semibold">{line.quantity}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={posTouchCompactClass}
                    onClick={() => bump(line.key, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn("text-destructive", posTouchCompactClass)}
                    onClick={() => removeLine(line.key)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {!cart.length ? <p className="text-sm text-muted-foreground">No items yet.</p> : null}
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/20 px-3 py-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">${cartTotal.toFixed(2)}</span>
            </div>
            {appliedDiscountAmount > 0 ? (
              <div className="mt-1 flex items-center justify-between gap-2 text-emerald-700 dark:text-emerald-300">
                <span>Discount</span>
                <span className="font-medium tabular-nums">−${appliedDiscountAmount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
              <span className="font-semibold">Amount due</span>
              <span className="text-lg font-semibold tabular-nums">${amountDue.toFixed(2)}</span>
            </div>
          </div>

          {showSecondaryPanels ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Redeem loyalty points</Label>
              <Input
                value={loyaltyPointsRedeem}
                onChange={(e) => setLoyaltyPointsRedeem(e.target.value)}
                placeholder="e.g. 100"
                className="h-10 rounded-xl"
                disabled={!selectedCustomer}
              />
              {selectedCustomer && loyaltyBalance != null ? (
                <p className="mt-1 text-xs text-muted-foreground">{loyaltyBalance} points available</p>
              ) : null}
            </div>
            <div>
              <Label className="text-xs">Gift card code</Label>
              <Input
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                placeholder="GC-XXXX"
                className="h-10 rounded-xl font-mono uppercase"
              />
              {giftCardBalance != null ? (
                <p className="mt-1 text-xs text-muted-foreground">${giftCardBalance.toFixed(2)} balance</p>
              ) : null}
            </div>
          </div>
          ) : null}

          {checkoutStatus ? (
            <p
              className={posCheckoutStatusClassName(checkoutStatus.kind)}
              role="status"
              aria-live="polite"
              data-testid="pos-checkout-status"
            >
              {checkoutStatus.text}
            </p>
          ) : null}

          {pendingTerminal ? (
            <TapToPayButton
              amount={pendingTerminal.amount}
              orderId={pendingTerminal.orderId}
              onSuccess={() => {
                const orderRef = pendingTerminal.orderId.slice(0, 8);
                setPendingTerminal(null);
                showCheckoutStatus(`Card payment captured — order ${orderRef}…`, "success");
              }}
              onError={(error) => showCheckoutStatus(error, "error")}
            />
          ) : null}

          <div
            className={cn(
              speedMode &&
                "sticky bottom-2 z-10 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-lg backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none",
            )}
          >
          <Button
            type="button"
            data-testid="pos-complete-sale"
            className={cn(
              "h-14 w-full rounded-2xl text-lg font-semibold touch-manipulation",
              speedMode && "h-16 text-xl",
            )}
            disabled={pending}
            onClick={() => checkout()}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            {pending ? "Submitting…" : speedMode ? "Complete sale — speed" : "Complete sale"}
          </Button>
          </div>
          {!speedMode ? (
          <p className="text-xs text-muted-foreground">
            Cash and comp modes record operational intent only. Select{" "}
            <span className="font-medium text-foreground">Card terminal</span> to use Stripe Terminal
            tap-to-pay when configured.
          </p>
          ) : (
          <p className="text-xs text-muted-foreground">
            Speed mode hides CRM, discounts, and loyalty — switch to standard layout for full controls.
          </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
