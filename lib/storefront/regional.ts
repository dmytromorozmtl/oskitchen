import { isStripeChargeCurrencySupported, normalizeCurrencyCode } from "@/lib/storefront/currency";

/** BCP-47-ish locale codes supported in admin + public switcher (expand over time). */
export const STOREFRONT_SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "uk", label: "Українська" },
  { code: "pl", label: "Polski" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
] as const;

export type StorefrontLocaleCode = (typeof STOREFRONT_SUPPORTED_LOCALES)[number]["code"];

/** Common ISO 4217 codes for food businesses (subset). */
export const STOREFRONT_COMMON_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "CHF",
  "JPY",
  "MXN",
  "BRL",
  "PLN",
  "UAH",
  "INR",
  "SGD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "CZK",
  "HUF",
  "ILS",
] as const;

const IANA_TZ =
  /^(?:Africa|America|Antarctica|Arctic|Asia|Atlantic|Australia|Europe|Indian|Pacific)\/[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)?$/;

export function parseStorefrontCurrency(raw: string): { ok: true; currency: string } | { ok: false; error: string } {
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    return { ok: false, error: "Currency must be a 3-letter ISO code (e.g. USD, EUR)." };
  }
  if (!isStripeChargeCurrencySupported(code)) {
    return {
      ok: false,
      error: `${code} is not supported for Stripe card checkout in this build. Pay-later still works.`,
    };
  }
  return { ok: true, currency: code };
}

export function parseStorefrontLocale(raw: string): { ok: true; locale: string } | { ok: false; error: string } {
  const loc = raw.trim().toLowerCase();
  const short = loc.split("-")[0] ?? loc;
  const supported = STOREFRONT_SUPPORTED_LOCALES.some((l) => l.code === short || l.code === loc);
  if (!supported) {
    return { ok: false, error: "Choose a supported language from the list." };
  }
  return { ok: true, locale: short };
}

export function parseStorefrontTimezone(raw: string): { ok: true; timezone: string } | { ok: false; error: string } {
  const tz = raw.trim();
  if (!tz) return { ok: false, error: "Timezone is required." };
  if (tz.length > 64) return { ok: false, error: "Timezone is too long." };
  if (!IANA_TZ.test(tz) && tz !== "UTC") {
    return { ok: false, error: "Use an IANA timezone (e.g. America/New_York, Europe/Paris, UTC)." };
  }
  return { ok: true, timezone: tz };
}

export function normalizeStorefrontCurrencyForDisplay(currency: string): string {
  return normalizeCurrencyCode(currency).toUpperCase();
}

/** Alternate locales for hreflang (excluding primary). */
export function storefrontAlternateLocales(primary: string): StorefrontLocaleCode[] {
  const p = primary.split("-")[0]?.toLowerCase() ?? "en";
  return STOREFRONT_SUPPORTED_LOCALES.map((l) => l.code).filter((c) => c !== p);
}
