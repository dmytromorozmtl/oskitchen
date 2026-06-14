import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditVendorPriceChangeAlertsP267,
  formatVendorPriceChangeAlertsP267AuditLines,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-audit";
import {
  buildVendorPriceChangeAlertDigest,
  buildVendorPriceChangeAlertsDemoRows,
  detectVendorPriceChangeAlerts,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-builder";
import { buildVendorPriceChangeAlertsCorpusP267 } from "@/lib/inventory/vendor-price-change-alerts-p2-67-corpus";
import {
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_ALERT_CAPABILITIES,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_ARTIFACT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_CHECK_NPM_SCRIPT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_CI_NPM_SCRIPT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_CI_WORKFLOW,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_DEFAULT_THRESHOLD_PCT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_DOC,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_FLOW_STEPS,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_MIN_CAPABILITY_COVERAGE_PCT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_UNIT_TEST,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_WIRING_PATHS,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";
import {
  buildDegradedVendorPriceChangeAlertsP267Scenarios,
  runVendorPriceChangeAlertsBenchmarkP267,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-scoring";

const ROOT = process.cwd();

describe("Vendor price change alerts — MarginEdge parity (P2-67)", () => {
  it("locks P2-67 policy, 12 scenarios, and alert flow steps", () => {
    expect(VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID).toBe(
      "vendor-price-change-alerts-p2-67-v1",
    );
    expect(VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT).toBe(12);
    expect(VENDOR_PRICE_CHANGE_ALERTS_P2_67_MIN_CAPABILITY_COVERAGE_PCT).toBe(100);
    expect(VENDOR_PRICE_CHANGE_ALERTS_P2_67_DEFAULT_THRESHOLD_PCT).toBe(5);
    expect(VENDOR_PRICE_CHANGE_ALERTS_P2_67_ALERT_CAPABILITIES).toHaveLength(8);
    expect(VENDOR_PRICE_CHANGE_ALERTS_P2_67_FLOW_STEPS).toEqual([
      "price-history-ingest",
      "change-detection",
      "threshold-filter",
      "alert-digest",
    ]);
  });

  it("detects price change alerts from demo history rows", () => {
    const alerts = detectVendorPriceChangeAlerts(buildVendorPriceChangeAlertsDemoRows());
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some((a) => a.alertType === "increase")).toBe(true);
    expect(alerts.some((a) => a.alertType === "decrease")).toBe(true);

    const digest = buildVendorPriceChangeAlertDigest(alerts);
    expect(digest.totalAlerts).toBe(alerts.length);
    expect(digest.suppliersAffected).toBeGreaterThan(0);
  });

  it("passes 12-scenario corpus at 100% capability coverage", () => {
    const corpus = buildVendorPriceChangeAlertsCorpusP267();
    expect(corpus.length).toBe(12);

    const result = runVendorPriceChangeAlertsBenchmarkP267(corpus);
    expect(result.capabilityCoveragePct).toBe(100);
    expect(result.uncoveredCapabilities).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it("fails degraded corpus with incomplete capability coverage", () => {
    const degraded = buildDegradedVendorPriceChangeAlertsP267Scenarios();
    expect(runVendorPriceChangeAlertsBenchmarkP267(degraded).passed).toBe(false);
  });

  it("passes full wiring audit", () => {
    const audit = auditVendorPriceChangeAlertsP267(ROOT);
    expect(audit.passed, formatVendorPriceChangeAlertsP267AuditLines(audit).join("\n")).toBe(
      true,
    );
  });

  it("registers CI scripts and wiring paths", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[VENDOR_PRICE_CHANGE_ALERTS_P2_67_CHECK_NPM_SCRIPT]).toBeTruthy();
    expect(pkg.scripts?.[VENDOR_PRICE_CHANGE_ALERTS_P2_67_CI_NPM_SCRIPT]).toBeTruthy();

    for (const rel of VENDOR_PRICE_CHANGE_ALERTS_P2_67_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }

    const ci = readFileSync(join(ROOT, VENDOR_PRICE_CHANGE_ALERTS_P2_67_CI_WORKFLOW), "utf8");
    expect(ci).toContain(VENDOR_PRICE_CHANGE_ALERTS_P2_67_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, VENDOR_PRICE_CHANGE_ALERTS_P2_67_ARTIFACT), "utf8"),
    ) as { policyId: string };
    expect(artifact.policyId).toBe(VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID);

    const doc = readFileSync(join(ROOT, VENDOR_PRICE_CHANGE_ALERTS_P2_67_DOC), "utf8");
    expect(doc).toContain("MarginEdge");
  });
});
