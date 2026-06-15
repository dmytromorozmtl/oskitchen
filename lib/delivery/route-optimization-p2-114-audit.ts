import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { ROUTE_OPTIMIZATION_P2_114_CAPABILITIES } from "@/lib/delivery/route-optimization-p2-114-content";
import {
  ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT,
  ROUTE_OPTIMIZATION_P2_114_COMPONENT,
  ROUTE_OPTIMIZATION_P2_114_DOC,
  ROUTE_OPTIMIZATION_P2_114_HONESTY_MARKERS,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_DISPATCH,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_OPTIMIZE_PAGE,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_PANEL,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_POLICY,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_ROUTES,
  ROUTE_OPTIMIZATION_P2_114_OPERATIONS_PATH,
  ROUTE_OPTIMIZATION_P2_114_PAGE,
  ROUTE_OPTIMIZATION_P2_114_POLICY_ID,
  ROUTE_OPTIMIZATION_P2_114_ROUTE,
  ROUTE_OPTIMIZATION_P2_114_SERVICE_PATH,
  ROUTE_OPTIMIZATION_P2_114_WIRING_PATHS,
} from "@/lib/delivery/route-optimization-p2-114-policy";

export type RouteOptimizationP2_114AuditSummary = {
  policyId: typeof ROUTE_OPTIMIZATION_P2_114_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyRoutesLinked: boolean;
  legacyDispatchLinked: boolean;
  legacyPolicyLinked: boolean;
  legacyPanelLinked: boolean;
  legacyOptimizePageLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditRouteOptimizationP2_114(
  root = process.cwd(),
): RouteOptimizationP2_114AuditSummary {
  const wiringComplete = ROUTE_OPTIMIZATION_P2_114_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyRoutesLinked = false;
  let legacyDispatchLinked = false;
  let legacyPolicyLinked = false;
  let legacyPanelLinked = false;
  let legacyOptimizePageLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_DOC))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_DOC), "utf8");
    docWired =
      source.includes(ROUTE_OPTIMIZATION_P2_114_ROUTE) &&
      source.includes(String(ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_COMPONENT))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_COMPONENT), "utf8");
    componentWired =
      source.includes("RouteOptimizationPanel") &&
      source.includes("ROUTE_OPTIMIZATION_P2_114_CAPABILITIES");
    allTestIdsPresent =
      source.includes("ROUTE_OPTIMIZATION_P2_114_TEST_IDS[0]") &&
      source.includes("ROUTE_OPTIMIZATION_P2_114_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_PAGE))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_PAGE), "utf8");
    pageWired =
      source.includes("RouteOptimizationPanel") &&
      source.includes("ROUTE_OPTIMIZATION_P2_114_POLICY_ID");
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("optimizeRouteStops") &&
      source.includes("buildRouteOptimizationReport") &&
      source.includes("estimateMinutesFromDistanceKm") &&
      source.includes("buildRouteOptimizationDemoReport");
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_SERVICE_PATH))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadRouteOptimizationSnapshot") &&
      source.includes("ROUTE_OPTIMIZATION_P2_114_POLICY_ID");
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_ROUTES))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_ROUTES), "utf8");
    legacyRoutesLinked =
      source.includes("optimizeDeliveryRoute") && source.includes("isGoogleRoutesConfigured");
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_DISPATCH))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_DISPATCH), "utf8");
    legacyDispatchLinked =
      source.includes("loadDeliveryDispatchOptimizationModel") &&
      source.includes("optimizeDeliveryRoute");
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_POLICY))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_POLICY), "utf8");
    legacyPolicyLinked =
      source.includes("optimizeDispatchStopOrder") && source.includes("buildRouteOptimization");
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_PANEL))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_PANEL), "utf8");
    legacyPanelLinked = source.includes("DispatchOptimizationPanel");
  }

  if (existsSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_OPTIMIZE_PAGE))) {
    const source = readFileSync(join(root, ROUTE_OPTIMIZATION_P2_114_LEGACY_OPTIMIZE_PAGE), "utf8");
    legacyOptimizePageLinked =
      source.includes("DispatchOptimizationPanel") &&
      source.includes("loadDeliveryDispatchOptimizationModel");
  }

  const combinedSources = [
    ROUTE_OPTIMIZATION_P2_114_DOC,
    "lib/delivery/route-optimization-p2-114-content.ts",
    ROUTE_OPTIMIZATION_P2_114_OPERATIONS_PATH,
    ROUTE_OPTIMIZATION_P2_114_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = ROUTE_OPTIMIZATION_P2_114_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    ROUTE_OPTIMIZATION_P2_114_CAPABILITIES.length === ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyRoutesLinked &&
    legacyDispatchLinked &&
    legacyPolicyLinked &&
    legacyPanelLinked &&
    legacyOptimizePageLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: ROUTE_OPTIMIZATION_P2_114_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyRoutesLinked,
    legacyDispatchLinked,
    legacyPolicyLinked,
    legacyPanelLinked,
    legacyOptimizePageLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatRouteOptimizationP2_114AuditLines(
  summary: RouteOptimizationP2_114AuditSummary,
): string[] {
  return [
    `Route optimization audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${ROUTE_OPTIMIZATION_P2_114_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${ROUTE_OPTIMIZATION_P2_114_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy routes linked: ${summary.legacyRoutesLinked ? "yes" : "no"}`,
    `Legacy dispatch linked: ${summary.legacyDispatchLinked ? "yes" : "no"}`,
    `Legacy policy linked: ${summary.legacyPolicyLinked ? "yes" : "no"}`,
    `Legacy panel linked: ${summary.legacyPanelLinked ? "yes" : "no"}`,
    `Legacy optimize page linked: ${summary.legacyOptimizePageLinked ? "yes" : "no"}`,
    `Capabilities (${ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
