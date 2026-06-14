import {
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_ALERT_CAPABILITIES,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_MIN_CAPABILITY_COVERAGE_PCT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT,
  type VendorPriceAlertCapability,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";
import {
  buildVendorPriceChangeAlert,
  buildVendorPriceChangeAlertDigest,
  classifyAlertSeverity,
  filterAlertsByIngredient,
  filterAlertsBySupplier,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-builder";
import {
  buildVendorPriceChangeAlertsCorpusP267,
  type VendorPriceChangeAlertScenarioP267,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-corpus";

export type VendorPriceChangeAlertScenarioScoreP267 = {
  scenarioId: string;
  alertDetected: boolean;
  expectedAlert: boolean;
  passed: boolean;
};

export type VendorPriceChangeAlertsBenchmarkP267Result = {
  scenarioCount: number;
  capabilityCoveragePct: number;
  passed: boolean;
  thresholdPct: number;
  uncoveredCapabilities: VendorPriceAlertCapability[];
  scenarioScores: VendorPriceChangeAlertScenarioScoreP267[];
};

function scoreScenario(scenario: VendorPriceChangeAlertScenarioP267): VendorPriceChangeAlertScenarioScoreP267 {
  const alert = buildVendorPriceChangeAlert(
    {
      id: scenario.id,
      ingredientId: `ing-${scenario.id}`,
      ingredientName: scenario.label,
      supplierName: scenario.supplierName,
      oldUnitCost: scenario.oldPrice,
      newUnitCost: scenario.newPrice,
      effectiveAt: "2026-06-10T00:00:00.000Z",
      source: "corpus",
    },
    scenario.thresholdPct,
  );

  const alertDetected = alert != null;
  const passed = alertDetected === scenario.expectsAlert;

  if (alert && scenario.capabilities.includes("severity_classification")) {
    const expectedSeverity =
      Math.abs(alert.changePercent) >= 20
        ? "high"
        : Math.abs(alert.changePercent) >= 10
          ? "medium"
          : "low";
    if (alert.severity !== expectedSeverity) {
      return { scenarioId: scenario.id, alertDetected, expectedAlert: scenario.expectsAlert, passed: false };
    }
  }

  if (alert && scenario.capabilities.includes("supplier_scoped_alert")) {
    const filtered = filterAlertsBySupplier([alert], scenario.supplierName);
    if (filtered.length !== 1) {
      return { scenarioId: scenario.id, alertDetected, expectedAlert: scenario.expectsAlert, passed: false };
    }
  }

  if (alert && scenario.capabilities.includes("ingredient_scoped_alert")) {
    const filtered = filterAlertsByIngredient([alert], `ing-${scenario.id}`);
    if (filtered.length !== 1) {
      return { scenarioId: scenario.id, alertDetected, expectedAlert: scenario.expectsAlert, passed: false };
    }
  }

  if (scenario.capabilities.includes("alert_digest") && alert) {
    const digest = buildVendorPriceChangeAlertDigest([alert]);
    if (digest.totalAlerts !== 1) {
      return { scenarioId: scenario.id, alertDetected, expectedAlert: scenario.expectsAlert, passed: false };
    }
  }

  if (scenario.id === "vpa-05-high-severity") {
    const severity = classifyAlertSeverity(25);
    if (severity !== "high") {
      return { scenarioId: scenario.id, alertDetected, expectedAlert: scenario.expectsAlert, passed: false };
    }
  }

  return { scenarioId: scenario.id, alertDetected, expectedAlert: scenario.expectsAlert, passed };
}

export function runVendorPriceChangeAlertsBenchmarkP267(
  scenarios: VendorPriceChangeAlertScenarioP267[] = buildVendorPriceChangeAlertsCorpusP267(),
): VendorPriceChangeAlertsBenchmarkP267Result {
  const covered = new Set<VendorPriceAlertCapability>();
  for (const scenario of scenarios) {
    for (const capability of scenario.capabilities) {
      covered.add(capability);
    }
  }

  const uncoveredCapabilities = VENDOR_PRICE_CHANGE_ALERTS_P2_67_ALERT_CAPABILITIES.filter(
    (c) => !covered.has(c),
  );

  const total = VENDOR_PRICE_CHANGE_ALERTS_P2_67_ALERT_CAPABILITIES.length;
  const capabilityCoveragePct =
    total === 0 ? 0 : Math.round((covered.size / total) * 100);

  const scenarioScores = scenarios.map(scoreScenario);
  const allScenariosPassed = scenarioScores.every((s) => s.passed);

  const passed =
    scenarios.length === VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT &&
    capabilityCoveragePct >= VENDOR_PRICE_CHANGE_ALERTS_P2_67_MIN_CAPABILITY_COVERAGE_PCT &&
    uncoveredCapabilities.length === 0 &&
    allScenariosPassed;

  return {
    scenarioCount: scenarios.length,
    capabilityCoveragePct,
    passed,
    thresholdPct: VENDOR_PRICE_CHANGE_ALERTS_P2_67_MIN_CAPABILITY_COVERAGE_PCT,
    uncoveredCapabilities,
    scenarioScores,
  };
}

export function buildDegradedVendorPriceChangeAlertsP267Scenarios(): VendorPriceChangeAlertScenarioP267[] {
  return buildVendorPriceChangeAlertsCorpusP267().slice(0, 3);
}
