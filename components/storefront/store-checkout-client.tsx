"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { submitPublicStorefrontOrder } from "@/actions/storefront-order";
import { TurnstileWidget } from "@/components/storefront/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { STOREFRONT_ANALYTICS_EVENTS } from "@/lib/storefront/analytics-events";
import { clearCartStorage } from "@/lib/storefront/cart";
import { useStorefrontCart } from "@/hooks/use-storefront-cart";
import { readThemeExperimentArmFromCookie } from "@/lib/storefront/experiment-arm-client";
import { ingestStorefrontFirstPartyEvent } from "@/lib/storefront/storefront-first-party-ingest";
import { computeStorefrontTax } from "@/lib/storefront/tax-engine";
import type { StorefrontTaxSettings } from "@/lib/storefront/tax-settings";
import { STOREFRONT_MARKET_COOKIE } from "@/lib/storefront/cache-tags";
import { formatCurrency } from "@/lib/utils";

import { PickupSlotSelector, type PickupWindowOption } from "@/components/storefront/pickup-slot-selector";
import { CheckoutAllergenPanel } from "@/components/storefront/checkout-allergen-panel";

import type { StoreProduct } from "./store-menu-client";

export function StoreCheckoutClient({
  slug,
  currency,
  products,
  pickupEnabled,
  deliveryEnabled,
  orderingPaused,
  minimumOrderAmount,
  deliveryFeeFlat,
  freeDeliveryThreshold,
  requireTerms,
  payLaterOnly = false,
  onlineCheckoutAllowed = false,
  onlineCheckoutBlockedReason = null,
  stripeMode = null,
  termsText = null,
  privacyText = null,
  turnstileSiteKey = null,
  priceVersion,
  tipsEnabled = false,
  tipPresetsPercent = [10, 15, 20],
  marketId = null,
  taxSettings,
  pickupWindows = [],
  customerAllergiesJson,
}: {
  slug: string;
  currency: string;
  products: StoreProduct[];
  priceVersion: string;
  marketId?: string | null;
  taxSettings: StorefrontTaxSettings;
  tipsEnabled?: boolean;
  tipPresetsPercent?: number[];
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  orderingPaused: boolean;
  minimumOrderAmount: number | null;
  deliveryFeeFlat: number;
  freeDeliveryThreshold: number | null;
  requireTerms: boolean;
  payLaterOnly?: boolean;
  onlineCheckoutAllowed?: boolean;
  onlineCheckoutBlockedReason?: string | null;
  stripeMode?: "test" | "live" | null;
  termsText?: string | null;
  privacyText?: string | null;
  turnstileSiteKey?: string | null;
  pickupWindows?: PickupWindowOption[];
  customerAllergiesJson?: unknown;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [allergiesInput, setAllergiesInput] = React.useState("");
  const submitLock = React.useRef(false);
  const { cart, quantities, priceVersion: livePriceVersion } = useStorefrontCart(slug, priceVersion);
  const [tipPercent, setTipPercent] = React.useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [quotedDeliveryFee, setQuotedDeliveryFee] = React.useState<number | null>(null);
  const [fulfillment, setFulfillment] = React.useState<"PICKUP" | "DELIVERY">(
    pickupEnabled ? "PICKUP" : "DELIVERY",
  );
  const [termsOk, setTermsOk] = React.useState(false);
  const [checkoutPayment, setCheckoutPayment] = React.useState<"pay_later" | "online">("pay_later");
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const cartTrackTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function trackCartRecoveryOnBlur(emailRaw: string) {
    const email = emailRaw.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const consentEl = document.querySelector('input[name="guestMarketingOptIn"]') as HTMLInputElement | null;
    if (!consentEl?.checked) return;
    if (Object.keys(quantities).length === 0) return;
    if (turnstileSiteKey && !captchaToken) return;

    if (cartTrackTimer.current) clearTimeout(cartTrackTimer.current);
    cartTrackTimer.current = setTimeout(() => {
      void fetch("/api/storefront/cart-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: slug,
          customerEmail: email,
          cart: quantities,
          marketingConsent: true,
          captchaToken: captchaToken ?? undefined,
        }),
      });
    }, 400);
  }

  React.useEffect(() => {
    const arm = readThemeExperimentArmFromCookie();
    void ingestStorefrontFirstPartyEvent({
      storeSlug: slug,
      eventName: STOREFRONT_ANALYTICS_EVENTS.beginCheckout,
      path: typeof window !== "undefined" ? window.location.pathname : "/checkout",
      metadata: arm ? { experimentArm: arm } : undefined,
    });
  }, [slug]);

  React.useEffect(() => {
    if (!onlineCheckoutAllowed && checkoutPayment === "online") {
      setCheckoutPayment("pay_later");
    }
  }, [onlineCheckoutAllowed, checkoutPayment]);

  React.useEffect(() => {
    if (fulfillment !== "DELIVERY") {
      setQuotedDeliveryFee(0);
      return;
    }
    const subtotal = cart?.subtotal ?? 0;
    const t = setTimeout(() => {
      void fetch("/api/storefront/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: slug,
          fulfillmentType: "DELIVERY",
          deliveryAddress,
          subtotal,
        }),
      })
        .then((r) => r.json())
        .then((d: { ok?: boolean; deliveryFee?: number }) => {
          if (d.ok && typeof d.deliveryFee === "number") setQuotedDeliveryFee(d.deliveryFee);
        })
        .catch(() => undefined);
    }, 400);
    return () => clearTimeout(t);
  }, [fulfillment, deliveryAddress, cart?.subtotal, slug]);

  const cartProductIds = React.useMemo(() => Object.keys(quantities), [quantities]);

  const mergedAllergies = React.useMemo(() => {
    const fromProp = customerAllergiesJson;
    const fromInput = allergiesInput
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (fromInput.length) return fromInput;
    return fromProp;
  }, [customerAllergiesJson, allergiesInput]);

  const lines = React.useMemo(
    () =>
      (cart?.lines ?? []).map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        modifierOptionIds: l.modifierOptionIds,
        quantity: l.quantity,
      })),
    [cart],
  );

  const priced = React.useMemo(() => {
    const subtotal = cart?.subtotal ?? 0;
    const rows =
      cart?.lines.map((l) => ({
        title: l.title,
        quantity: l.quantity,
        line: l.lineTotal,
      })) ?? [];
    let deliveryFee = 0;
    if (fulfillment === "DELIVERY") {
      deliveryFee =
        quotedDeliveryFee != null
          ? quotedDeliveryFee
          : freeDeliveryThreshold != null && subtotal >= freeDeliveryThreshold
            ? 0
            : deliveryFeeFlat;
    }
    const taxable = Math.max(0, subtotal);
    const taxResult = computeStorefrontTax({
      subtotal,
      discountAmount: 0,
      deliveryFee,
      settings: taxSettings,
    });
    const tax = taxResult.taxTotal;
    const taxLines = taxResult.displayLines;
    const tip =
      tipPercent != null && tipPercent > 0
        ? Math.round(taxable * (tipPercent / 100) * 100) / 100
        : 0;
    const total = subtotal + deliveryFee + tax + tip;
    return { subtotal, rows, deliveryFee, tax, taxLines, tip, total, taxIncluded: taxResult.taxIncludedInPrices };
  }, [cart, fulfillment, deliveryFeeFlat, freeDeliveryThreshold, quotedDeliveryFee, taxSettings, tipPercent]);

  function readMarketIdFromCookie(): string | undefined {
    if (typeof document === "undefined") return marketId ?? undefined;
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${STOREFRONT_MARKET_COOKIE}=`));
    if (!match) return marketId ?? undefined;
    try {
      return decodeURIComponent(match.split("=")[1] ?? "");
    } catch {
      return marketId ?? undefined;
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (orderingPaused) {
      toast.error("This storefront is temporarily not accepting new orders.");
      return;
    }
    if (lines.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (minimumOrderAmount != null && priced.subtotal < minimumOrderAmount) {
      toast.error(`Minimum order is ${formatCurrency(minimumOrderAmount, currency)}.`);
      return;
    }
    if (requireTerms && !termsOk) {
      toast.error("Please accept the terms to continue.");
      return;
    }
    if (turnstileSiteKey && !captchaToken) {
      toast.error("Complete the security check before submitting.");
      return;
    }
    if (submitLock.current) return;
    submitLock.current = true;
    const fd = new FormData(e.currentTarget);
    const customerName = String(fd.get("customerName") ?? "").trim();
    const customerEmail = String(fd.get("customerEmail") ?? "").trim();
    const customerPhone = String(fd.get("customerPhone") ?? "").trim();
    const pickupDate = String(fd.get("pickupDate") ?? "").trim();
    const deliveryDate = String(fd.get("deliveryDate") ?? "").trim();
    const deliveryAddress = String(fd.get("deliveryAddress") ?? "").trim();
    const customerNotes = String(fd.get("customerNotes") ?? "").trim();
    const promoCode = String(fd.get("promoCode") ?? "").trim();
    const websiteUrl = String(fd.get("websiteUrl") ?? "").trim();
    const pickupWindowId = String(fd.get("pickupWindowId") ?? "").trim();

    setPending(true);
    let res: Awaited<ReturnType<typeof submitPublicStorefrontOrder>>;
    try {
      res = await submitPublicStorefrontOrder({
        slug,
        marketId: readMarketIdFromCookie(),
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        fulfillmentType: fulfillment,
        pickupDate: fulfillment === "PICKUP" ? pickupDate : undefined,
        deliveryDate: fulfillment === "DELIVERY" ? deliveryDate : undefined,
        deliveryAddress: fulfillment === "DELIVERY" ? deliveryAddress : undefined,
        lines,
        termsAccepted: requireTerms ? termsOk : true,
        customerNotes: customerNotes || undefined,
        promoCode: promoCode || undefined,
        priceVersion: livePriceVersion ?? priceVersion,
        tipPercent: tipPercent ?? undefined,
        checkoutPayment: checkoutPayment === "online" ? "online" : "pay_later",
        captchaToken: captchaToken ?? undefined,
        websiteUrl: websiteUrl || undefined,
        guestMarketingOptIn: fd.get("guestMarketingOptIn") === "on",
        pickupWindowId: pickupWindowId || undefined,
      });
    } finally {
      setPending(false);
      submitLock.current = false;
    }

    if ("error" in res && res.error) {
      toast.error(getActionError(res) ?? "Something went wrong");
      return;
    }
    if ("ok" in res && res.ok && res.token) {
      clearCartStorage(slug);
      const arm = readThemeExperimentArmFromCookie();
      void ingestStorefrontFirstPartyEvent({
        storeSlug: slug,
        eventName: STOREFRONT_ANALYTICS_EVENTS.purchase,
        path: typeof window !== "undefined" ? window.location.pathname : "/checkout",
        metadata: { payment: checkoutPayment, ...(arm ? { experimentArm: arm } : {}) },
      });
      if ("stripeCheckoutUrl" in res && res.stripeCheckoutUrl) {
        window.location.assign(res.stripeCheckoutUrl);
        return;
      }
      router.push(`/s/${slug}/order/${res.token}`);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Submit a preorder request — the kitchen confirms fulfillment windows directly with you
          when needed.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-6 lg:col-span-3">
          <input type="text" name="websiteUrl" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <Label className="text-base font-medium">Fulfillment</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant={fulfillment === "PICKUP" ? "default" : "outline"}
                className="rounded-xl"
                disabled={!pickupEnabled}
                onClick={() => setFulfillment("PICKUP")}
              >
                Pickup
              </Button>
              <Button
                type="button"
                variant={fulfillment === "DELIVERY" ? "default" : "outline"}
                className="rounded-xl"
                disabled={!deliveryEnabled}
                onClick={() => setFulfillment("DELIVERY")}
              >
                Delivery
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <Label className="text-base font-medium">Payment</Label>
            {payLaterOnly ? (
              <p className="text-sm text-muted-foreground">
                This storefront only accepts pay-later / request orders — card checkout is disabled in settings.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/40">
                  <input
                    type="radio"
                    name="checkoutPaymentUi"
                    className="mt-1"
                    checked={checkoutPayment === "pay_later"}
                    onChange={() => setCheckoutPayment("pay_later")}
                  />
                  <span>
                    <span className="font-medium">Pay later / request</span>
                    <span className="mt-0.5 block text-muted-foreground">
                      Submit your preorder — the kitchen confirms details with you. No card is charged now.
                    </span>
                  </span>
                </label>
                <label
                  className={
                    onlineCheckoutAllowed
                      ? "flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/40"
                      : "flex cursor-not-allowed items-start gap-3 rounded-xl border border-dashed border-muted-foreground/40 p-3 opacity-70"
                  }
                >
                  <input
                    type="radio"
                    name="checkoutPaymentUi"
                    className="mt-1"
                    disabled={!onlineCheckoutAllowed}
                    checked={checkoutPayment === "online"}
                    onChange={() => setCheckoutPayment("online")}
                  />
                  <span>
                    <span className="font-medium">Pay online with card</span>
                    {onlineCheckoutAllowed ? (
                      <span className="mt-0.5 block text-muted-foreground">
                        Secure checkout via Stripe{stripeMode ? ` (${stripeMode} mode)` : ""}. Your order is finalized
                        only after Stripe confirms payment.
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-muted-foreground">
                        {onlineCheckoutBlockedReason ??
                          "Online checkout is not available — the merchant must finish Stripe setup."}
                      </span>
                    )}
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customerName">Name</Label>
                <Input id="customerName" name="customerName" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  required
                  className="rounded-xl"
                  onBlur={(e) => trackCartRecoveryOnBlur(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customerAllergies">Allergies (optional)</Label>
                <Input
                  id="customerAllergies"
                  name="customerAllergies"
                  placeholder="e.g. peanuts, dairy, gluten"
                  className="rounded-xl"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                />
              </div>
              <CheckoutAllergenPanel
                products={products}
                cartProductIds={cartProductIds}
                customerAllergiesJson={mergedAllergies}
              />
              <div className="space-y-2 sm:col-span-2">
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" name="guestMarketingOptIn" value="on" className="mt-1 h-4 w-4 rounded border-input" />
                  <span>Email me order updates and occasional offers from this kitchen (optional).</span>
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input id="customerPhone" name="customerPhone" className="rounded-xl" />
              </div>
            </div>
            {fulfillment === "PICKUP" ? (
              <div className="space-y-4">
                {pickupWindows.length > 0 ? (
                  <PickupSlotSelector windows={pickupWindows} />
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Preferred pickup date</Label>
                  <Input id="pickupDate" name="pickupDate" type="date" required className="rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery date</Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery address</Label>
                  <Input
                    id="deliveryAddress"
                    name="deliveryAddress"
                    required
                    className="rounded-xl"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="customerNotes">Notes for the kitchen (optional)</Label>
              <Textarea
                id="customerNotes"
                name="customerNotes"
                rows={3}
                maxLength={2000}
                placeholder="Allergies, gate codes, delivery preferences…"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promoCode">Promo code (optional)</Label>
              <Input
                id="promoCode"
                name="promoCode"
                autoComplete="off"
                className="rounded-xl font-mono text-sm uppercase"
                placeholder="SPRING10"
              />
            </div>
          </div>

          {requireTerms ? (
            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={termsOk} onCheckedChange={(v) => setTermsOk(Boolean(v))} />
              <span>I agree to the kitchen&apos;s preorder terms.</span>
            </label>
          ) : null}

          {turnstileSiteKey ? (
            <TurnstileWidget siteKey={turnstileSiteKey} onToken={setCaptchaToken} />
          ) : null}

          {termsText || privacyText ? (
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
              {termsText ? (
                <details>
                  <summary className="cursor-pointer font-medium text-foreground">Preorder terms</summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-[11px] leading-relaxed">{termsText}</pre>
                </details>
              ) : null}
              {privacyText ? (
                <details>
                  <summary className="cursor-pointer font-medium text-foreground">Privacy</summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-[11px] leading-relaxed">{privacyText}</pre>
                </details>
              ) : null}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full shadow-sm sm:w-auto"
            disabled={pending || lines.length === 0 || orderingPaused}
          >
            {pending
              ? checkoutPayment === "online"
                ? "Starting secure checkout…"
                : "Submitting…"
              : checkoutPayment === "online"
                ? "Continue to secure payment"
                : "Place preorder request"}
          </Button>
          <p className="text-xs text-muted-foreground">
            <Link href={`/s/${slug}/menu`} className="text-primary underline-offset-4 hover:underline">
              ← Back to menu
            </Link>
          </p>
        </form>

        <aside className="lg:col-span-2">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Order summary</h2>
            {priced.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cart is empty.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {priced.rows.map((r) => (
                  <li key={r.title} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {r.quantity}× {r.title}
                    </span>
                    <span>{formatCurrency(r.line, currency)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(priced.subtotal, currency)}</span>
            </div>
            {fulfillment === "DELIVERY" && priced.deliveryFee > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>{formatCurrency(priced.deliveryFee, currency)}</span>
              </div>
            ) : null}
            {priced.taxLines.length > 0
              ? priced.taxLines.map((t) => (
                  <div key={t.key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t.label}
                      {priced.taxIncluded ? " (included)" : ""}
                    </span>
                    <span>{formatCurrency(t.amount, currency)}</span>
                  </div>
                ))
              : priced.tax > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(priced.tax, currency)}</span>
                  </div>
                ) : null}
            {priced.tip > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tip</span>
                <span>{formatCurrency(priced.tip, currency)}</span>
              </div>
            ) : null}
            {tipsEnabled ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {tipPresetsPercent.map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    size="sm"
                    variant={tipPercent === pct ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setTipPercent(tipPercent === pct ? null : pct)}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border/80 pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(priced.total, currency)}</span>
            </div>
            {minimumOrderAmount != null ? (
              <p className="text-xs text-muted-foreground">
                Minimum order {formatCurrency(minimumOrderAmount, currency)} before fees.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
