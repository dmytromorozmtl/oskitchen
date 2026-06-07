import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
  QA_FULL_COVERAGE_SLOTS,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";
import {
  assessMultiCurrencyNetwork,
  MULTI_CURRENCY_NETWORK_ROLLUP_LABEL,
  MULTI_CURRENCY_SETTINGS_ROUTE,
  multiCurrencyStorefrontSettingsHref,
  parseLocationCurrencyFromTaxSettings,
  parseMultiCurrencyCode,
} from "@/lib/finance/multi-currency-policy";

const ROOT = process.cwd();
/** Absolute Final Task 101 — QA full coverage for feature 86 multi-currency */
const TASK = 101;
const FEATURE = 86;

describe(`QA full coverage — multi-currency (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 101 → feature 86 multi-currency", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    expect(QA_FULL_COVERAGE_SLOTS).toHaveLength(15);
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("multi-currency-support");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/multi-currency-support.test.ts");
  });

  it("detects workspace inheritance vs explicit location override", () => {
    const inherited = assessMultiCurrencyNetwork({
      workspaceCurrency: "USD",
      locations: [{ id: "l1", name: "Main", taxSettingsJson: null }],
      storefronts: [],
    });
    expect(inherited.locationRows[0]?.inheritsWorkspace).toBe(true);
    expect(inherited.isMultiCurrency).toBe(false);

    const override = assessMultiCurrencyNetwork({
      workspaceCurrency: "USD",
      locations: [
        { id: "l1", name: "Paris", taxSettingsJson: { currencyCode: "EUR", vatRate: 20 } },
      ],
      storefronts: [],
    });
    expect(override.locationRows[0]?.inheritsWorkspace).toBe(false);
    expect(override.locationRows[0]?.currency).toBe("EUR");
    expect(override.isMultiCurrency).toBe(true);
    expect(override.networkRollupLabel).toBe(MULTI_CURRENCY_NETWORK_ROLLUP_LABEL);
  });

  it("flags Stripe alignment per location and storefront rows", () => {
    const assessment = assessMultiCurrencyNetwork({
      workspaceCurrency: "USD",
      locations: [{ id: "l1", name: "Tokyo", taxSettingsJson: { currencyCode: "JPY" } }],
      storefronts: [{ id: "s1", storeSlug: "eu-shop", currency: "EUR" }],
    });
    expect(assessment.locationRows[0]?.stripeSupported).toBe(true);
    expect(assessment.storefrontRows[0]?.stripeAligned).toBe(true);
    expect(assessment.distinctCurrencies).toEqual(["EUR", "JPY", "USD"]);
  });

  it("falls back invalid taxSettings currency codes to workspace default", () => {
    expect(parseLocationCurrencyFromTaxSettings({ currencyCode: "ZZZ" }, "CAD")).toBe("CAD");
    expect(parseLocationCurrencyFromTaxSettings({ currencyCode: "12" }, "USD")).toBe("USD");
    expect(parseMultiCurrencyCode("").ok).toBe(false);
  });

  it("builds storefront regional settings deep link", () => {
    expect(multiCurrencyStorefrontSettingsHref("my-store")).toBe(
      "/dashboard/storefront/settings?store=my-store",
    );
    expect(multiCurrencyStorefrontSettingsHref("café & co")).toContain(
      encodeURIComponent("café & co"),
    );
  });

  it("wires panel honesty — no auto FX conversion across network codes", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/settings/multi-currency-settings-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("MULTI_CURRENCY_NETWORK_ROLLUP_LABEL");
    expect(panel).toContain("do not auto-convert");
    expect(panel).toContain("updateWorkspaceCurrencyFormAction");
    expect(panel).toContain("updateLocationCurrencyFormAction");
  });

  it("wires server actions with currency validation and revalidation paths", () => {
    const actions = readFileSync(
      join(ROOT, "actions/finance/multi-currency-settings.ts"),
      "utf8",
    );
    expect(actions).toContain("parseMultiCurrencyCode");
    expect(actions).toContain("mergeLocationCurrencyIntoTaxSettings");
    expect(actions).toContain("revalidatePath(MULTI_CURRENCY_SETTINGS_ROUTE)");
    expect(actions).toContain("canUseSettings");
  });

  it("passes QA slot 101 audit gate", () => {
    const audit = auditQaFullCoverageSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-01-multi-currency.test.ts",
    );
  });
});
