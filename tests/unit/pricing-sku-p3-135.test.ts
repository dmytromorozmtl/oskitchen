import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPricingSkuP3_135,
  formatPricingSkuP3_135AuditLines,
} from "@/lib/pm/pricing-sku-p3-135-audit";
import {
  computeLivePricingSkuPair,
  loadPricingSkuRegistry,
  validatePricingSkuRegistry,
} from "@/lib/pm/pricing-sku-p3-135-operations";
import {
  PRICING_SKU_P3_135_CI_WORKFLOW,
  PRICING_SKU_P3_135_DOC,
  PRICING_SKU_P3_135_NPM_SCRIPT,
  PRICING_SKU_P3_135_PILOT_MONTHLY_USD,
  PRICING_SKU_P3_135_PILOT_SKU,
  PRICING_SKU_P3_135_PILOT_TERM_MONTHS,
  PRICING_SKU_P3_135_PILOT_TOTAL_USD,
  PRICING_SKU_P3_135_POLICY_ID,
  PRICING_SKU_P3_135_STANDARD_MONTHLY_USD,
  PRICING_SKU_P3_135_STANDARD_SKU,
  PRICING_SKU_P3_135_UNIT_TEST,
} from "@/lib/pm/pricing-sku-p3-135-policy";

const ROOT = process.cwd();

describe("Pricing SKU PM (P3-135)", () => {
  it("locks Pilot $40/3mo and Standard $79/mo canonical pair", () => {
    expect(PRICING_SKU_P3_135_POLICY_ID).toBe("pricing-sku-p3-135-v1");
    expect(PRICING_SKU_P3_135_PILOT_SKU).toBe("PILOT-PRO-50");
    expect(PRICING_SKU_P3_135_STANDARD_SKU).toBe("STD-PRO");
    expect(PRICING_SKU_P3_135_PILOT_MONTHLY_USD).toBe(40);
    expect(PRICING_SKU_P3_135_STANDARD_MONTHLY_USD).toBe(79);
    expect(PRICING_SKU_P3_135_PILOT_TERM_MONTHS).toBe(3);
    expect(PRICING_SKU_P3_135_PILOT_TOTAL_USD).toBe(120);
  });

  it("validates registry against live plan registry and pilot SKUs", () => {
    const registry = loadPricingSkuRegistry(ROOT);
    const live = computeLivePricingSkuPair();
    const validation = validatePricingSkuRegistry(registry, live);

    expect(validation.valid).toBe(true);
    expect(live.pilotMonthlyUsd).toBe(40);
    expect(live.standardMonthlyUsd).toBe(79);
    expect(live.pilotTotalUsd).toBe(120);
  });

  it("passes full pricing SKU PM audit", () => {
    const summary = auditPricingSkuP3_135(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveSourcesWired).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, PRICING_SKU_P3_135_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PRICING_SKU_P3_135_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PRICING_SKU_P3_135_NPM_SCRIPT]).toContain("audit-pricing-sku-p3-135.ts");
    expect(pkg.scripts?.["test:ci:pricing-sku-p3-135"]).toContain(PRICING_SKU_P3_135_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, PRICING_SKU_P3_135_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:pricing-sku-p3-135");
  });

  it("formats audit lines", () => {
    const summary = auditPricingSkuP3_135(ROOT);
    const lines = formatPricingSkuP3_135AuditLines(summary);
    expect(lines.some((line) => line.includes(PRICING_SKU_P3_135_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
