"use client";

import * as React from "react";
import Image from "next/image";
import { CreditCard, Minus, Plus, ShoppingBag, Users, X } from "lucide-react";
import { toast } from "sonner";

import type { QrOrderingContext } from "@/services/qr/qr-ordering-service";
import type { QrTableCheckoutStyle } from "@/lib/qr/table-self-service";
import { calculateSplitBillShare } from "@/lib/qr/table-self-service";
import { formatCurrency } from "@/lib/utils";
import { storefrontMenuImageUrl } from "@/lib/storefront/product-image-url";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CartLine = { productId: string; quantity: number };

type PlacedOrder = {
  orderId: string;
  lookupToken: string;
  estimatedWaitMinutes: number;
  checkoutStyle: QrTableCheckoutStyle;
  orderTotal: number;
  splitShareAmount?: number;
  splitGuests?: number;
  paymentStatus?: string;
};

export function QrTableSelfServiceClient({ context }: { context: QrOrderingContext }) {
  const [step, setStep] = React.useState<"menu" | "checkout" | "confirmation">("menu");
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [checkoutStyle, setCheckoutStyle] = React.useState<QrTableCheckoutStyle>("pay_later");
  const [splitGuests, setSplitGuests] = React.useState(2);
  const [cardLast4, setCardLast4] = React.useState("");
  const [placed, setPlaced] = React.useState<PlacedOrder | null>(null);

  const cartLines: CartLine[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([productId, quantity]) => ({ productId, quantity }));

  const cartCount = cartLines.reduce((s, l) => s + l.quantity, 0);
  const cartTotal = cartLines.reduce((sum, line) => {
    const p = context.products.find((x) => x.id === line.productId);
    return sum + (p ? Number(p.price) * line.quantity : 0);
  }, 0);

  const shareAmount =
    checkoutStyle === "split" ? calculateSplitBillShare(cartTotal, splitGuests) : cartTotal;

  function bump(productId: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const q = (next[productId] ?? 0) + delta;
      if (q <= 0) delete next[productId];
      else next[productId] = q;
      return next;
    });
  }

  async function submitOrder() {
    if (!cartLines.length) {
      toast.error("Add items first.");
      return;
    }
    if (checkoutStyle === "pay_now" && cardLast4.replace(/\D/g, "").length < 4) {
      toast.error("Enter the last 4 digits of your card.");
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
          checkoutStyle,
          splitGuests: checkoutStyle === "split" ? splitGuests : undefined,
        }),
      });
      const data = (await res.json()) as PlacedOrder & { ok?: boolean; error?: string };
      if (!res.ok || !data.ok || !data.lookupToken || !data.orderId) {
        toast.error(data.error ?? "Could not place order");
        return;
      }
      setPlaced({
        orderId: data.orderId,
        lookupToken: data.lookupToken,
        estimatedWaitMinutes: data.estimatedWaitMinutes ?? 15,
        checkoutStyle: data.checkoutStyle ?? checkoutStyle,
        orderTotal: data.orderTotal ?? cartTotal,
        splitShareAmount: data.splitShareAmount,
        splitGuests: data.splitGuests,
        paymentStatus: data.paymentStatus,
      });
      setStep("confirmation");
      setDrawerOpen(false);
      setCart({});
    } catch {
      toast.error("Network error — try again.");
    } finally {
      setPending(false);
    }
  }

  async function paySplitShare() {
    if (!placed || placed.checkoutStyle !== "split") return;
    if (cardLast4.replace(/\D/g, "").length < 4) {
      toast.error("Enter the last 4 digits of your card.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/public/qr-table/pay-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: context.storeSlug,
          orderId: placed.orderId,
          lookupToken: placed.lookupToken,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        paidShares?: number;
        guests?: number;
        fullyPaid?: boolean;
      };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Payment failed");
        return;
      }
      toast.success(
        data.fullyPaid
          ? "Check fully paid — thank you!"
          : `Share ${data.paidShares}/${data.guests} paid`,
      );
      if (data.fullyPaid) {
        setPlaced((p) => (p ? { ...p, paymentStatus: "PAID" } : p));
      }
    } catch {
      toast.error("Network error — try again.");
    } finally {
      setPending(false);
    }
  }

  if (step === "confirmation" && placed) {
    return (
      <div
        className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-12"
        data-testid="qr-table-confirmation"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-semibold">Sent to kitchen</h1>
          <p className="mt-2 text-zinc-400">
            {context.tableLabel} · KDS ticket queued
          </p>
          <p className="mt-6 text-4xl font-bold text-emerald-400">
            ~{placed.estimatedWaitMinutes} min
          </p>
          <p className="mt-8 font-mono text-xs text-zinc-500">Ref {placed.lookupToken}</p>
        </div>

        {placed.checkoutStyle === "pay_now" || placed.paymentStatus === "PAID" ? (
          <p className="mt-6 text-center text-sm text-emerald-300">Payment received</p>
        ) : null}

        {placed.checkoutStyle === "split" && placed.paymentStatus !== "PAID" ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm font-medium">Split bill · pay your share</p>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(placed.splitShareAmount ?? 0, context.currency)}
            </p>
            <p className="text-xs text-zinc-400">
              {placed.splitGuests} guests · card tap (last 4 only — PCI safe)
            </p>
            <input
              className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="Card last 4"
              maxLength={4}
              inputMode="numeric"
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              data-testid="qr-table-card-last4"
            />
            <Button
              type="button"
              className="mt-4 h-11 w-full rounded-full"
              disabled={pending}
              onClick={() => void paySplitShare()}
              data-testid="qr-table-pay-share"
            >
              Pay my share
            </Button>
          </div>
        ) : null}

        {placed.checkoutStyle === "pay_later" ? (
          <p className="mt-6 text-center text-sm text-zinc-400">
            Pay with your server when you are ready.
          </p>
        ) : null}
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-4 py-6" data-testid="qr-table-checkout">
        <Button type="button" variant="ghost" className="mb-4" onClick={() => setStep("menu")}>
          ← Back to menu
        </Button>
        <h2 className="text-xl font-semibold">Checkout</h2>
        <p className="text-sm text-zinc-400">{formatCurrency(cartTotal, context.currency)} total</p>

        <div className="mt-6 space-y-2">
          {(
            [
              { id: "pay_later" as const, label: "Pay with server", icon: null },
              { id: "pay_now" as const, label: "Pay now (card)", icon: CreditCard },
              { id: "split" as const, label: "Split bill", icon: Users },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCheckoutStyle(opt.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm",
                checkoutStyle === opt.id
                  ? "border-sky-500 bg-sky-950/50"
                  : "border-zinc-800 bg-zinc-900",
              )}
            >
              {opt.icon ? <opt.icon className="h-4 w-4 shrink-0" /> : <span className="w-4" />}
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        {checkoutStyle === "split" ? (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <span className="text-sm">Guests</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => setSplitGuests((g) => Math.max(2, g - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center font-semibold">{splitGuests}</span>
              <Button
                type="button"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setSplitGuests((g) => Math.min(20, g + 1))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : null}

        <p className="mt-4 text-sm text-zinc-400">
          {checkoutStyle === "split"
            ? `Each guest pays about ${formatCurrency(shareAmount, context.currency)}`
            : checkoutStyle === "pay_now"
              ? "Card details are not stored — last 4 digits only."
              : "Order fires to KDS immediately."}
        </p>

        {checkoutStyle === "pay_now" ? (
          <input
            className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Card last 4"
            maxLength={4}
            inputMode="numeric"
            value={cardLast4}
            onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        ) : null}

        <Button
          type="button"
          className="mt-6 h-12 w-full rounded-full"
          disabled={pending}
          onClick={() => void submitOrder()}
          data-testid="qr-table-submit-order"
        >
          {pending ? "Sending…" : "Send to kitchen"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg pb-28" data-testid="qr-table-self-service-page">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-widest text-violet-400">Table service</p>
        <h1 className="text-xl font-semibold">{context.restaurantName}</h1>
        <p className="text-sm text-zinc-400">
          {context.tableLabel} · order · pay · kitchen
        </p>
      </header>

      <ul className="space-y-3 p-4">
        {context.products.map((p) => {
          const qty = cart[p.id] ?? 0;
          const img = storefrontMenuImageUrl(p.image);
          return (
            <li
              key={p.id}
              className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3"
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
                <p className="mt-1 text-sm font-semibold text-violet-300">
                  {formatCurrency(Number(p.price), context.currency)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-full border-zinc-700 bg-zinc-800"
                    onClick={() => bump(p.id, -1)}
                    disabled={qty === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
                    {qty}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-violet-600 hover:bg-violet-500"
                    onClick={() => bump(p.id, 1)}
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
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur">
          <Button
            type="button"
            className="h-12 w-full rounded-full bg-violet-600 text-base font-semibold hover:bg-violet-500"
            onClick={() => setStep("checkout")}
            data-testid="qr-table-open-checkout"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Checkout · {cartCount} · {formatCurrency(cartTotal, context.currency)}
          </Button>
        </div>
      ) : null}

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60">
          <div className="rounded-t-3xl border border-zinc-800 bg-zinc-900 p-4">
            <Button type="button" size="icon" variant="ghost" onClick={() => setDrawerOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
