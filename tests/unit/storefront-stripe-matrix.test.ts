import { describe, expect, it, vi } from "vitest";

import {
  isStorefrontOnlineCheckoutAvailable,
  storefrontPaymentReadiness,
} from "@/services/storefront/storefront-payment-service";

vi.mock("@/lib/storefront/stripe-readiness", () => ({
  isStripeSecretConfigured: vi.fn(() => true),
  stripeReadinessSummary: vi.fn(() => ({ ready: true, mode: "test" as const, message: "ok" })),
}));

vi.mock("@/services/storefront/storefront-currency-service", () => ({
  resolveStorefrontStripeCheckoutCurrency: vi.fn(() => ({
    status: "aligned" as const,
    stripeCurrency: "usd",
    message: "ok",
  })),
}));

describe("Stripe checkout matrix (pay-later vs online)", () => {
  const cases = [
    {
      name: "payLaterOnly blocks online even when Stripe enabled",
      input: { onlinePaymentEnabled: true, payLaterOnly: true, currency: "USD" as const },
      onlineAllowed: false,
      readinessAllowed: false,
    },
    {
      name: "online enabled when pay-later not forced",
      input: { onlinePaymentEnabled: true, payLaterOnly: false, currency: "USD" as const },
      onlineAllowed: true,
      readinessAllowed: true,
    },
    {
      name: "online disabled when flag off",
      input: { onlinePaymentEnabled: false, payLaterOnly: false, currency: "USD" as const },
      onlineAllowed: false,
      readinessAllowed: false,
    },
  ] as const;

  for (const c of cases) {
    it(c.name, () => {
      expect(isStorefrontOnlineCheckoutAvailable(c.input)).toBe(c.onlineAllowed);
      const readiness = storefrontPaymentReadiness(c.input);
      expect(readiness.allowed).toBe(c.readinessAllowed);
    });
  }
});
