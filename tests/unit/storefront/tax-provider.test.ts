import { describe, expect, it, afterEach } from "vitest";

import {
  getStorefrontTaxProvider,
  isExternalTaxProviderConfigured,
  quoteStorefrontTaxFromAddress,
} from "@/lib/storefront/tax-provider";
import { DEFAULT_TAX_SETTINGS } from "@/lib/storefront/tax-settings";

describe("tax-provider", () => {
  const prev = process.env.STOREFRONT_TAX_PROVIDER;

  afterEach(() => {
    if (prev === undefined) delete process.env.STOREFRONT_TAX_PROVIDER;
    else process.env.STOREFRONT_TAX_PROVIDER = prev;
  });

  it("defaults to manual", () => {
    delete process.env.STOREFRONT_TAX_PROVIDER;
    expect(getStorefrontTaxProvider()).toBe("manual");
  });

  it("reports external provider not configured", async () => {
    process.env.STOREFRONT_TAX_PROVIDER = "stripe_tax";
    expect(isExternalTaxProviderConfigured()).toBe(false);
    const quote = await quoteStorefrontTaxFromAddress({
      address: { countryCode: "US", postalCode: "94102" },
      subtotal: 100,
      discountAmount: 0,
      deliveryFee: 5,
      fallbackSettings: DEFAULT_TAX_SETTINGS,
    });
    expect(quote.ok).toBe(false);
    if (!quote.ok) expect(quote.reason).toBe("not_configured");
  });

  it("manual provider returns manual_only", async () => {
    process.env.STOREFRONT_TAX_PROVIDER = "manual";
    const quote = await quoteStorefrontTaxFromAddress({
      address: { countryCode: "CA" },
      subtotal: 50,
      discountAmount: 0,
      deliveryFee: 0,
      fallbackSettings: DEFAULT_TAX_SETTINGS,
    });
    expect(quote.ok).toBe(false);
    if (!quote.ok) expect(quote.reason).toBe("manual_only");
  });
});
