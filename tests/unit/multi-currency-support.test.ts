import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  assessMultiCurrencyNetwork,
  formatMultiCurrencyAmount,
  mergeLocationCurrencyIntoTaxSettings,
  MULTI_CURRENCY_NETWORK_ROLLUP_LABEL,
  MULTI_CURRENCY_POLICY_ID,
  MULTI_CURRENCY_SETTINGS_ROUTE,
  MULTI_CURRENCY_SUPPORTED_CURRENCIES,
  parseLocationCurrencyFromTaxSettings,
  parseMultiCurrencyCode,
} from "@/lib/finance/multi-currency-policy";

const ROOT = process.cwd();

describe("Multi-currency support (Absolute Final Task 86)", () => {
  it("locks policy id, route, and supported currency list", () => {
    expect(MULTI_CURRENCY_POLICY_ID).toBe("multi-currency-support-absolute-final-v1");
    expect(MULTI_CURRENCY_SETTINGS_ROUTE).toBe("/dashboard/settings/currency");
    expect(MULTI_CURRENCY_SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(10);
    expect(MULTI_CURRENCY_SUPPORTED_CURRENCIES).toContain("USD");
    expect(MULTI_CURRENCY_SUPPORTED_CURRENCIES).toContain("EUR");
  });

  it("parses location currency from taxSettingsJson with workspace fallback", () => {
    expect(parseLocationCurrencyFromTaxSettings(null, "usd")).toBe("USD");
    expect(parseLocationCurrencyFromTaxSettings({ currencyCode: "eur" }, "USD")).toBe("EUR");
    expect(parseLocationCurrencyFromTaxSettings({ currencyCode: "BAD" }, "USD")).toBe("USD");
  });

  it("merges location currency into tax settings without dropping other keys", () => {
    const merged = mergeLocationCurrencyIntoTaxSettings({ vatRate: 20 }, "gbp");
    expect(merged).toEqual({ vatRate: 20, currencyCode: "GBP" });
  });

  it("formats amounts with zero-decimal currencies", () => {
    expect(formatMultiCurrencyAmount(1500, "JPY")).toContain("1,500");
    expect(formatMultiCurrencyAmount(12.5, "USD")).toContain("12.50");
  });

  it("assesses multi-currency network with honest rollup label", () => {
    const single = assessMultiCurrencyNetwork({
      workspaceCurrency: "USD",
      locations: [{ id: "l1", name: "Main", taxSettingsJson: null }],
      storefronts: [{ id: "s1", storeSlug: "demo", currency: "USD" }],
    });
    expect(single.isMultiCurrency).toBe(false);
    expect(single.distinctCurrencies).toEqual(["USD"]);

    const multi = assessMultiCurrencyNetwork({
      workspaceCurrency: "USD",
      locations: [
        { id: "l1", name: "NYC", taxSettingsJson: { currencyCode: "USD" } },
        { id: "l2", name: "Paris", taxSettingsJson: { currencyCode: "EUR" } },
      ],
      storefronts: [{ id: "s1", storeSlug: "eu", currency: "EUR" }],
    });
    expect(multi.isMultiCurrency).toBe(true);
    expect(multi.distinctCurrencies).toContain("EUR");
    expect(multi.networkRollupLabel).toBe(MULTI_CURRENCY_NETWORK_ROLLUP_LABEL);
  });

  it("rejects unsupported currency codes", () => {
    const bad = parseMultiCurrencyCode("XYZ");
    expect(bad.ok).toBe(false);
    const good = parseMultiCurrencyCode("cad");
    expect(good.ok).toBe(true);
    if (good.ok) expect(good.currency).toBe("CAD");
  });

  it("wires settings page, panel, and service", () => {
    const page = readFileSync(
      join(ROOT, "app/dashboard/settings/currency/page.tsx"),
      "utf8",
    );
    expect(page).toContain("MultiCurrencySettingsPanel");
    expect(page).toContain("loadMultiCurrencySettingsModel");

    const panel = readFileSync(
      join(ROOT, "components/dashboard/settings/multi-currency-settings-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain('data-testid="multi-currency-settings-panel"');
    expect(panel).toContain("updateLocationCurrencyFormAction");

    const service = readFileSync(join(ROOT, "services/finance/multi-currency-service.ts"), "utf8");
    expect(service).toContain("assessMultiCurrencyNetwork");
  });

  it("registers currency section in settings navigation", () => {
    const registry = readFileSync(join(ROOT, "lib/settings/section-registry.ts"), "utf8");
    expect(registry).toContain('key: "currency"');
    expect(registry).toContain("/dashboard/settings/currency");
  });
});
