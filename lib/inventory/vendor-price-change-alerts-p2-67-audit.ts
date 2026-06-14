import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildVendorPriceChangeAlertsCorpusP267 } from "@/lib/inventory/vendor-price-change-alerts-p2-67-corpus";
import {
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_ARTIFACT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_BUILDER,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_DOC,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_LIST_TEST_ID,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_MARGINEDGE_PARITY_NOTE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_PAGE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_PANEL,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_PANEL_TEST_ID,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_SERVICE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_SUMMARY_TEST_ID,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_WIRING_PATHS,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";
import { runVendorPriceChangeAlertsBenchmarkP267 } from "@/lib/inventory/vendor-price-change-alerts-p2-67-scoring";

export type VendorPriceChangeAlertsP267AuditSummary = {
  policyId: typeof VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  builderWired: boolean;
  serviceWired: boolean;
  panelWired: boolean;
  pageWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  capabilityCoveragePct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditVendorPriceChangeAlertsP267(
  root = process.cwd(),
): VendorPriceChangeAlertsP267AuditSummary {
  const wiringComplete = VENDOR_PRICE_CHANGE_ALERTS_P2_67_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_DOC))) {
    const source = readFileSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_DOC), "utf8");
    docWired =
      source.includes(VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID) &&
      source.includes("MarginEdge") &&
      source.includes(String(VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT));
  }

  let builderWired = false;
  if (existsSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_BUILDER))) {
    const source = readFileSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_BUILDER), "utf8");
    builderWired =
      source.includes("detectVendorPriceChangeAlerts") &&
      source.includes("buildVendorPriceChangeAlertDigest") &&
      source.includes("classifyAlertSeverity");
  }

  let serviceWired = false;
  if (existsSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_SERVICE))) {
    const source = readFileSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_SERVICE), "utf8");
    serviceWired =
      source.includes("loadVendorPriceChangeAlertsSnapshot") &&
      source.includes("detectVendorPriceChangeAlerts");
  }

  let panelWired = false;
  if (existsSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_PANEL))) {
    const source = readFileSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_PANEL), "utf8");
    panelWired =
      source.includes(VENDOR_PRICE_CHANGE_ALERTS_P2_67_PANEL_TEST_ID) &&
      source.includes(VENDOR_PRICE_CHANGE_ALERTS_P2_67_LIST_TEST_ID) &&
      source.includes(VENDOR_PRICE_CHANGE_ALERTS_P2_67_SUMMARY_TEST_ID) &&
      source.includes("MarginEdge");
  }

  let pageWired = false;
  if (existsSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_PAGE))) {
    const source = readFileSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_PAGE), "utf8");
    pageWired =
      source.includes("VendorPriceChangeAlertsPanel") &&
      source.includes("MarginEdge");
  }

  const corpus = buildVendorPriceChangeAlertsCorpusP267();
  const result = runVendorPriceChangeAlertsBenchmarkP267(corpus);
  const artifactPresent = existsSync(join(root, VENDOR_PRICE_CHANGE_ALERTS_P2_67_ARTIFACT));

  const passed =
    wiringComplete &&
    docWired &&
    builderWired &&
    serviceWired &&
    panelWired &&
    pageWired &&
    corpus.length === VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID,
    wiringComplete,
    docWired,
    builderWired,
    serviceWired,
    panelWired,
    pageWired,
    corpusLoaded: corpus.length === VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT,
    scoringPassed: result.passed,
    capabilityCoveragePct: result.capabilityCoveragePct,
    artifactPresent,
    passed,
  };
}

export function formatVendorPriceChangeAlertsP267AuditLines(
  summary: VendorPriceChangeAlertsP267AuditSummary,
): string[] {
  return [
    `Vendor price change alerts (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Builder: ${summary.builderWired ? "wired" : "missing"}`,
    `Service: ${summary.serviceWired ? "wired" : "missing"}`,
    `Panel: ${summary.panelWired ? "wired" : "missing"}`,
    `Page: ${summary.pageWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT} scenarios)`,
    `Capability coverage: ${summary.capabilityCoveragePct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `MarginEdge parity: ${VENDOR_PRICE_CHANGE_ALERTS_P2_67_MARGINEDGE_PARITY_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
