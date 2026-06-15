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

describe("storefront payment — pay later only blocks online checkout", () => {
  it("isStorefrontOnlineCheckoutAvailable is false when payLaterOnly even if onlinePaymentEnabled", () => {
    expect(
      isStorefrontOnlineCheckoutAvailable({
        onlinePaymentEnabled: true,
        payLaterOnly: true,
        currency: "USD",
      }),
    ).toBe(false);
  });

  it("storefrontPaymentReadiness documents blockedReason for payLaterOnly", () => {
    const r = storefrontPaymentReadiness({
      onlinePaymentEnabled: true,
      payLaterOnly: true,
      currency: "USD",
    });
    expect(r.allowed).toBe(false);
    expect(r.blockedReason).toMatch(/pay.?later/i);
  });
});
