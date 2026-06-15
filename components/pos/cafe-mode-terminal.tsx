"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Coffee } from "lucide-react";

import { posCheckoutAction } from "@/actions/pos";
import { QuickOrderButtons, type QuickOrderItem } from "@/components/pos/quick-order-buttons";
import { CafeModeScreenNav } from "@/components/pos/cafe-mode-screen-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CAFE_MODE_P3_143_MAX_SCREENS } from "@/lib/pos/cafe-mode-p3-143-policy";
import type { CafeModeP3_143ScreenId } from "@/lib/pos/cafe-mode-p3-143-policy";
import { posTouchButtonClass } from "@/lib/pos/touch-targets";
import { cn } from "@/lib/utils";

type CafeCartLine = {
  key: string;
  productId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  modifier?: string;
};

type CafeRegister = { id: string; name: string; location?: { id: string; name: string } | null };
type CafeStaff = { id: string; name: string };
type CafeProduct = { id: string; title: string; price: number; category?: string | null };

const CAFE_MODIFIERS = ["Whole milk", "Oat milk", "Extra shot", "Large", "Iced"] as const;

export function CafeModeTerminal(props: {
  registers: CafeRegister[];
  staff: CafeStaff[];
  products: CafeProduct[];
  openShiftsByRegisterId: Record<string, { id: string } | null>;
  businessType?: string | null;
  quickOrderEnabled?: boolean;
  cafeModeActive?: boolean;
}) {
  const [activeScreen, setActiveScreen] = useState<CafeModeP3_143ScreenId>("menu");
  const [registerId, setRegisterId] = useState(props.registers[0]?.id ?? "");
  const [staffId, setStaffId] = useState(props.staff[0]?.id ?? "");
  const [cart, setCart] = useState<CafeCartLine[]>([]);
  const [activeLineKey, setActiveLineKey] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "CARD_TERMINAL_PLACEHOLDER">("CASH");
  const [status, setStatus] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{ orderId: string; receiptNumber: string } | null>(
    null,
  );
  const [checkingOut, setCheckingOut] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    [cart],
  );

  function addQuickItem(item: QuickOrderItem) {
    setCart((prev) => [
      ...prev,
      {
        key: `${item.id}-${Date.now()}`,
        title: item.name,
        quantity: 1,
        unitPrice: item.price,
      },
    ]);
    setActiveScreen("cart");
  }

  function addProduct(product: CafeProduct) {
    setCart((prev) => [
      ...prev,
      {
        key: `${product.id}-${Date.now()}`,
        productId: product.id,
        title: product.title,
        quantity: 1,
        unitPrice: product.price,
      },
    ]);
    setActiveScreen("cart");
  }

  function applyModifier(modifier: string) {
    if (!activeLineKey) return;
    setCart((prev) =>
      prev.map((line) => (line.key === activeLineKey ? { ...line, modifier } : line)),
    );
  }

  async function handleCheckout() {
    if (!registerId || cart.length === 0) {
      setStatus("Add items and select a register before checkout.");
      return;
    }
    setCheckingOut(true);
    setStatus(null);
    const openShiftId = props.openShiftsByRegisterId[registerId]?.id ?? null;
    const res = await posCheckoutAction({
      registerId,
      shiftId: openShiftId,
      staffMemberId: staffId || null,
      locationId: props.registers.find((r) => r.id === registerId)?.location?.id ?? null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP",
      paymentMode,
      lines: cart.map((line) => ({
        productId: line.productId,
        title: line.productId ? undefined : line.title,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        notes: line.modifier,
      })),
    });
    setCheckingOut(false);
    if (!res.ok) {
      setStatus(res.error);
      return;
    }
    setLastReceipt({ orderId: res.orderId, receiptNumber: res.receiptNumber });
    setCart([]);
    setActiveLineKey(null);
    setActiveScreen("receipt");
    setStatus(null);
  }

  function startNewSale() {
    setLastReceipt(null);
    setActiveScreen("menu");
  }

  return (
    <div
      className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm"
      data-testid="cafe-mode-terminal"
      data-cafe-mode-screens={CAFE_MODE_P3_143_MAX_SCREENS}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Coffee className="h-5 w-5 text-primary" aria-hidden />
          <h1 className="text-xl font-semibold tracking-tight">Café mode</h1>
          <Badge variant="secondary" className="rounded-full text-[10px] uppercase">
            {CAFE_MODE_P3_143_MAX_SCREENS}-screen max
          </Badge>
          {props.cafeModeActive ? (
            <Badge variant="outline" className="rounded-full text-[10px] uppercase">
              counter-first
            </Badge>
          ) : null}
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/pos/terminal">Full terminal</Link>
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-medium text-muted-foreground">
          Register
          <select
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={registerId}
            onChange={(e) => setRegisterId(e.target.value)}
          >
            {props.registers.map((register) => (
              <option key={register.id} value={register.id}>
                {register.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Staff
          <select
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          >
            {props.staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <CafeModeScreenNav activeScreen={activeScreen} onSelect={setActiveScreen} />

      {activeScreen === "menu" ? (
        <section data-testid="cafe-mode-screen-menu" className="space-y-4">
          {props.quickOrderEnabled !== false ? (
            <QuickOrderButtons businessType={props.businessType ?? "CAFE"} onItemClick={addQuickItem} />
          ) : null}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {props.products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product)}
                className={cn(posTouchButtonClass, "rounded-xl border bg-background p-3 text-left hover:bg-muted")}
              >
                <span className="block text-sm font-medium">{product.title}</span>
                <span className="text-xs text-muted-foreground">${product.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeScreen === "cart" ? (
        <section data-testid="cafe-mode-screen-cart" className="space-y-3">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Cart is empty — add drinks from Menu.</p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {cart.map((line) => (
                <li key={line.key} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium">{line.title}</span>
                    {line.modifier ? (
                      <span className="ml-2 text-xs text-muted-foreground">({line.modifier})</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>${(line.quantity * line.unitPrice).toFixed(2)}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full px-2 text-xs"
                      onClick={() => {
                        setActiveLineKey(line.key);
                        setActiveScreen("modifiers");
                      }}
                    >
                      Modifiers
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <Button
            type="button"
            className="w-full rounded-full"
            disabled={cart.length === 0}
            onClick={() => setActiveScreen("payment")}
          >
            Continue to payment
          </Button>
        </section>
      ) : null}

      {activeScreen === "modifiers" ? (
        <section data-testid="cafe-mode-screen-modifiers" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Milk/size modifiers for the active line — full modifier groups remain roadmap.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CAFE_MODIFIERS.map((modifier) => (
              <button
                key={modifier}
                type="button"
                onClick={() => applyModifier(modifier)}
                className={cn(posTouchButtonClass, "rounded-xl border bg-background px-3 py-2 text-sm hover:bg-muted")}
              >
                {modifier}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setActiveScreen("cart")}>
            Back to cart
          </Button>
        </section>
      ) : null}

      {activeScreen === "payment" ? (
        <section data-testid="cafe-mode-screen-payment" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cash or card checkout — Stripe Terminal is BETA when connected.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMode("CASH")}
              className={cn(
                posTouchButtonClass,
                "rounded-xl border px-3 py-3 text-sm font-medium",
                paymentMode === "CASH" ? "border-primary bg-primary/10" : "bg-background",
              )}
            >
              Cash
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("CARD_TERMINAL_PLACEHOLDER")}
              className={cn(
                posTouchButtonClass,
                "rounded-xl border px-3 py-3 text-sm font-medium",
                paymentMode === "CARD_TERMINAL_PLACEHOLDER" ? "border-primary bg-primary/10" : "bg-background",
              )}
            >
              Card (BETA)
            </button>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total due</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {status ? <p className="text-sm text-destructive">{status}</p> : null}
          <Button
            type="button"
            className="w-full rounded-full"
            disabled={checkingOut || cart.length === 0}
            onClick={() => void handleCheckout()}
          >
            {checkingOut ? "Processing…" : "Complete sale"}
          </Button>
        </section>
      ) : null}

      {activeScreen === "receipt" ? (
        <section data-testid="cafe-mode-screen-receipt" className="space-y-3 text-center">
          {lastReceipt ? (
            <>
              <p className="text-lg font-semibold">Order complete</p>
              <p className="text-sm text-muted-foreground">
                Order {lastReceipt.orderId.slice(0, 8)}… · Receipt {lastReceipt.receiptNumber}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Complete a payment to see receipt details.</p>
          )}
          <Button type="button" className="rounded-full" onClick={startNewSale}>
            New sale
          </Button>
        </section>
      ) : null}
    </div>
  );
}
