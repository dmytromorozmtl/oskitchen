import type { StorefrontTaxSettings } from "@/lib/storefront/tax-settings";
import { computeStorefrontTax, type TaxComputationResult } from "@/lib/storefront/tax-engine";

export const taxProviderKinds = ["manual", "stripe_tax", "taxjar"] as const;
export type TaxProviderKind = (typeof taxProviderKinds)[number];

export type TaxAddressQuoteInput = {
  countryCode?: string | null;
  regionCode?: string | null;
  postalCode?: string | null;
  city?: string | null;
  line1?: string | null;
};

export type TaxAddressQuoteResult =
  | { ok: true; provider: TaxProviderKind; settings: StorefrontTaxSettings }
  | { ok: false; provider: TaxProviderKind; reason: "not_configured" | "unsupported" | "manual_only" };

/**
 * External tax automation (Stripe Tax, TaxJar). Default is manual rates from Ordering settings.
 * Set `STOREFRONT_TAX_PROVIDER=stripe_tax|taxjar` when credentials are wired in a future release.
 */
export function getStorefrontTaxProvider(): TaxProviderKind {
  const raw = process.env.STOREFRONT_TAX_PROVIDER?.trim().toLowerCase();
  if (raw === "stripe_tax" || raw === "taxjar") return raw;
  return "manual";
}

export function isExternalTaxProviderConfigured(): boolean {
  const p = getStorefrontTaxProvider();
  if (p === "manual") return false;
  if (p === "stripe_tax") {
    return Boolean(process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_TAX_ENABLED === "1");
  }
  if (p === "taxjar") {
    return Boolean(process.env.TAXJAR_API_TOKEN?.trim());
  }
  return false;
}

/**
 * Attempt address-based tax quote. Returns manual_only when provider is manual or not configured.
 */
export async function quoteStorefrontTaxFromAddress(input: {
  address: TaxAddressQuoteInput;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  fallbackSettings: StorefrontTaxSettings;
}): Promise<TaxAddressQuoteResult> {
  const provider = getStorefrontTaxProvider();
  if (provider === "manual") {
    return { ok: false, provider, reason: "manual_only" };
  }

  if (!isExternalTaxProviderConfigured()) {
    return { ok: false, provider, reason: "not_configured" };
  }

  // Stub: external providers not wired yet — fall back to manual settings at checkout.
  return { ok: false, provider, reason: "not_configured" };
}

export function computeTaxWithProviderFallback(input: {
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  settings: StorefrontTaxSettings;
}): TaxComputationResult {
  return computeStorefrontTax({
    subtotal: input.subtotal,
    discountAmount: input.discountAmount,
    deliveryFee: input.deliveryFee,
    settings: input.settings,
  });
}
