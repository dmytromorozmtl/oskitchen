import type { StorefrontSettings } from "@prisma/client";

import {
  amountToStripeMinorUnits,
  isStripeChargeCurrencySupported,
  normalizeCurrencyCode,
} from "@/lib/storefront/currency";

export type StorefrontStripeCurrencyStatus = "aligned" | "unsupported" | "invalid";

export function resolveStorefrontStripeCheckoutCurrency(sf: Pick<StorefrontSettings, "currency">): {
  status: StorefrontStripeCurrencyStatus;
  stripeCurrency: string | null;
  displayCurrency: string;
  message: string;
} {
  const displayCurrency = sf.currency?.trim() || "USD";
  const stripeCurrency = normalizeCurrencyCode(displayCurrency);
  if (!/^[a-z]{3}$/.test(stripeCurrency)) {
    return {
      status: "invalid",
      stripeCurrency: null,
      displayCurrency,
      message: "Storefront currency must be a valid 3-letter ISO code (e.g. USD, EUR).",
    };
  }
  if (!isStripeChargeCurrencySupported(stripeCurrency)) {
    return {
      status: "unsupported",
      stripeCurrency: null,
      displayCurrency,
      message: `Stripe Checkout does not support card charges in ${displayCurrency.toUpperCase()} in this OS Kitchen build — use pay-later or change currency.`,
    };
  }
  return {
    status: "aligned",
    stripeCurrency,
    displayCurrency,
    message: `Checkout currency: ${stripeCurrency.toUpperCase()} (matches storefront).`,
  };
}

export function stripeMinorAmountForOrder(total: number, sf: Pick<StorefrontSettings, "currency">): {
  ok: true;
  amountMinor: number;
  currency: string;
} | { ok: false; error: string } {
  const r = resolveStorefrontStripeCheckoutCurrency(sf);
  if (r.status !== "aligned" || !r.stripeCurrency) {
    return { ok: false, error: r.message };
  }
  const amountMinor = amountToStripeMinorUnits(total, r.stripeCurrency);
  if (!Number.isFinite(amountMinor) || amountMinor < 50) {
    return { ok: false, error: "Order total is too small for card checkout in this currency." };
  }
  return { ok: true, amountMinor, currency: r.stripeCurrency };
}
