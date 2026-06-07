/**
 * Absolute Final Task 86 — multi-currency support (Lightspeed parity).
 *
 * Per-location display currency, storefront Stripe alignment, and honest network
 * rollups without automatic FX conversion.
 *
 * @see app/dashboard/settings/currency/page.tsx
 * @see lib/storefront/currency.ts
 */

import { STOREFRONT_COMMON_CURRENCIES } from "@/lib/storefront/regional";
import {
  isStripeChargeCurrencySupported,
  normalizeCurrencyCode,
  STRIPE_ZERO_DECIMAL_CURRENCIES,
} from "@/lib/storefront/currency";

export const MULTI_CURRENCY_POLICY_ID = "multi-currency-support-absolute-final-v1" as const;

export const MULTI_CURRENCY_SETTINGS_ROUTE = "/dashboard/settings/currency" as const;

export const MULTI_CURRENCY_SETTINGS_PAGE_PATH =
  "app/dashboard/settings/currency/page.tsx" as const;

export const MULTI_CURRENCY_SETTINGS_PANEL_PATH =
  "components/dashboard/settings/multi-currency-settings-panel.tsx" as const;

export const MULTI_CURRENCY_SERVICE_PATH = "services/finance/multi-currency-service.ts" as const;

export const MULTI_CURRENCY_CI_SCRIPTS = [
  "test:ci:multi-currency-support",
  "test:ci:multi-currency-support:cert",
] as const;

/** Workspace reporting currency when locations differ — no FX applied across codes. */
export const MULTI_CURRENCY_NETWORK_ROLLUP_LABEL =
  "No FX conversion — network totals shown per currency only" as const;

export const MULTI_CURRENCY_SUPPORTED_CURRENCIES = STOREFRONT_COMMON_CURRENCIES;

export type LocationTaxSettingsJson = {
  currencyCode?: string | null;
  [key: string]: unknown;
};

export type LocationCurrencyRow = {
  locationId: string;
  locationName: string;
  currency: string;
  inheritsWorkspace: boolean;
  stripeSupported: boolean;
};

export type StorefrontCurrencyRow = {
  storefrontId: string;
  storeSlug: string;
  currency: string;
  stripeAligned: boolean;
};

export type MultiCurrencyNetworkAssessment = {
  workspaceCurrency: string;
  locationRows: LocationCurrencyRow[];
  storefrontRows: StorefrontCurrencyRow[];
  distinctCurrencies: string[];
  isMultiCurrency: boolean;
  networkRollupLabel: typeof MULTI_CURRENCY_NETWORK_ROLLUP_LABEL;
};

export function parseLocationCurrencyFromTaxSettings(
  taxSettingsJson: unknown,
  workspaceCurrency: string,
): string {
  if (!taxSettingsJson || typeof taxSettingsJson !== "object") {
    return normalizeCurrencyCode(workspaceCurrency).toUpperCase();
  }
  const raw = (taxSettingsJson as LocationTaxSettingsJson).currencyCode;
  if (typeof raw !== "string" || !raw.trim()) {
    return normalizeCurrencyCode(workspaceCurrency).toUpperCase();
  }
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    return normalizeCurrencyCode(workspaceCurrency).toUpperCase();
  }
  const supported = parseMultiCurrencyCode(code);
  if (!supported.ok) {
    return normalizeCurrencyCode(workspaceCurrency).toUpperCase();
  }
  return supported.currency;
}

export function mergeLocationCurrencyIntoTaxSettings(
  taxSettingsJson: unknown,
  currencyCode: string,
): LocationTaxSettingsJson {
  const base =
    taxSettingsJson && typeof taxSettingsJson === "object"
      ? { ...(taxSettingsJson as LocationTaxSettingsJson) }
      : {};
  return {
    ...base,
    currencyCode: currencyCode.trim().toUpperCase(),
  };
}

export function parseMultiCurrencyCode(raw: string): { ok: true; currency: string } | { ok: false; error: string } {
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    return { ok: false, error: "Currency must be a 3-letter ISO code (e.g. USD, EUR)." };
  }
  if (!MULTI_CURRENCY_SUPPORTED_CURRENCIES.includes(code as (typeof MULTI_CURRENCY_SUPPORTED_CURRENCIES)[number])) {
    return {
      ok: false,
      error: `${code} is not in the supported multi-currency list for this build.`,
    };
  }
  return { ok: true, currency: code };
}

export function formatMultiCurrencyAmount(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  const code = normalizeCurrencyCode(currency).toUpperCase();
  const fractionDigits = STRIPE_ZERO_DECIMAL_CURRENCIES.has(normalizeCurrencyCode(currency)) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function assessMultiCurrencyNetwork(input: {
  workspaceCurrency: string;
  locations: Array<{ id: string; name: string; taxSettingsJson: unknown }>;
  storefronts: Array<{ id: string; storeSlug: string; currency: string }>;
}): MultiCurrencyNetworkAssessment {
  const workspaceCurrency = normalizeCurrencyCode(input.workspaceCurrency).toUpperCase();

  const locationRows: LocationCurrencyRow[] = input.locations.map((loc) => {
    const parsed = parseLocationCurrencyFromTaxSettings(loc.taxSettingsJson, workspaceCurrency);
    const inheritsWorkspace = parsed === workspaceCurrency &&
      !(loc.taxSettingsJson &&
        typeof loc.taxSettingsJson === "object" &&
        typeof (loc.taxSettingsJson as LocationTaxSettingsJson).currencyCode === "string");

    return {
      locationId: loc.id,
      locationName: loc.name,
      currency: parsed,
      inheritsWorkspace,
      stripeSupported: isStripeChargeCurrencySupported(parsed),
    };
  });

  const storefrontRows: StorefrontCurrencyRow[] = input.storefronts.map((sf) => {
    const currency = normalizeCurrencyCode(sf.currency || workspaceCurrency).toUpperCase();
    return {
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      currency,
      stripeAligned: isStripeChargeCurrencySupported(currency),
    };
  });

  const distinct = [
    ...new Set([
      workspaceCurrency,
      ...locationRows.map((r) => r.currency),
      ...storefrontRows.map((r) => r.currency),
    ]),
  ].sort();

  return {
    workspaceCurrency,
    locationRows,
    storefrontRows,
    distinctCurrencies: distinct,
    isMultiCurrency: distinct.length > 1,
    networkRollupLabel: MULTI_CURRENCY_NETWORK_ROLLUP_LABEL,
  };
}

export function multiCurrencyStorefrontSettingsHref(storeSlug: string): string {
  return `/dashboard/storefront/settings?store=${encodeURIComponent(storeSlug)}`;
}
