import { describe, expect, it, vi } from "vitest";

import { evaluateFulfillmentRulesJson } from "@/lib/storefront/fulfillment-rules";
import { areStorefrontRedirectsExecutionEnabled, validateRedirectFromToPaths } from "@/lib/storefront/storefront-redirects";
import { isSafeHttpsUrl } from "@/lib/storefront/theme-validation";

describe("storefront production polish helpers", () => {
  it("rejects javascript and data theme URLs", () => {
    expect(isSafeHttpsUrl("javascript:alert(1)").ok).toBe(false);
    expect(isSafeHttpsUrl("data:text/html,hi").ok).toBe(false);
    expect(isSafeHttpsUrl("https://example.com/x.png").ok).toBe(true);
  });

  it("rejects unsafe redirect targets without external flag", () => {
    expect(validateRedirectFromToPaths("/a", "https://evil.test/").ok).toBe(false);
    expect(validateRedirectFromToPaths("/a", "/b").ok).toBe(true);
  });

  it("redirect execution flag is false without env", () => {
    vi.stubEnv("STOREFRONT_REDIRECTS_ENABLED", "");
    vi.stubEnv("STOREFRONT_MIDDLEWARE_SECRET", "");
    expect(areStorefrontRedirectsExecutionEnabled()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("evaluates closure and blocks", async () => {
    const day = "2030-12-25";
    const res = await evaluateFulfillmentRulesJson(
      [
        {
          label: "x",
          priority: 1,
          rulesJson: { type: "closure_dates", dates: [day] },
          active: true,
        } as { label: string; priority: number; rulesJson: object; active?: boolean },
      ],
      {
        fulfillmentType: "PICKUP",
        fulfillmentDate: new Date(`${day}T12:00:00.000Z`),
        productIds: [],
        subtotal: 10,
      },
      {
        orderCountForDay: async () => 0,
        orderCountBetween: async () => 0,
        storefrontTimeZone: "UTC",
      },
    );
    expect(res.allowed).toBe(false);
    expect(res.blockers.length).toBeGreaterThan(0);
  });

  it("inactive rules do not apply", async () => {
    const day = "2030-12-25";
    const res = await evaluateFulfillmentRulesJson(
      [
        {
          label: "x",
          priority: 1,
          rulesJson: { type: "closure_dates", dates: [day] },
          active: false,
        } as { label: string; priority: number; rulesJson: object; active?: boolean },
      ],
      {
        fulfillmentType: "PICKUP",
        fulfillmentDate: new Date(`${day}T12:00:00.000Z`),
        productIds: [],
        subtotal: 10,
      },
      {
        orderCountForDay: async () => 0,
        orderCountBetween: async () => 0,
        storefrontTimeZone: "UTC",
      },
    );
    expect(res.allowed).toBe(true);
  });
});
