import { describe, expect, it } from "vitest";

import {
  parseStorefrontCurrency,
  parseStorefrontLocale,
  parseStorefrontTimezone,
  storefrontAlternateLocales,
} from "@/lib/storefront/regional";

describe("storefront regional", () => {
  it("parses valid currency", () => {
    expect(parseStorefrontCurrency("eur")).toEqual({ ok: true, currency: "EUR" });
  });

  it("rejects invalid currency", () => {
    expect(parseStorefrontCurrency("US")).toMatchObject({ ok: false });
  });

  it("parses supported locale", () => {
    expect(parseStorefrontLocale("fr")).toEqual({ ok: true, locale: "fr" });
  });

  it("rejects unknown locale", () => {
    expect(parseStorefrontLocale("xx")).toMatchObject({ ok: false });
  });

  it("parses IANA timezone", () => {
    expect(parseStorefrontTimezone("Europe/Paris")).toEqual({ ok: true, timezone: "Europe/Paris" });
  });

  it("builds alternate locales for hreflang", () => {
    const alts = storefrontAlternateLocales("en");
    expect(alts).toContain("fr");
    expect(alts).not.toContain("en");
  });
});
