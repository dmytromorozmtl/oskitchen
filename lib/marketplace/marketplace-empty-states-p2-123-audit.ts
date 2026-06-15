import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES } from "@/lib/marketplace/marketplace-empty-states-p2-123-content";
import {
  MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT,
  MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_PAGE,
  MARKETPLACE_EMPTY_STATES_P2_123_COMPONENT,
  MARKETPLACE_EMPTY_STATES_P2_123_DOC,
  MARKETPLACE_EMPTY_STATES_P2_123_HONESTY_MARKERS,
  MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_DESIGN_POLICY,
  MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_ILLUSTRATION,
  MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_POLICY,
  MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_UI,
  MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_PAGE,
  MARKETPLACE_EMPTY_STATES_P2_123_OPERATIONS_PATH,
  MARKETPLACE_EMPTY_STATES_P2_123_PAGE,
  MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID,
  MARKETPLACE_EMPTY_STATES_P2_123_ROUTE,
  MARKETPLACE_EMPTY_STATES_P2_123_SERVICE_PATH,
  MARKETPLACE_EMPTY_STATES_P2_123_VENDORS_MODULE,
  MARKETPLACE_EMPTY_STATES_P2_123_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-policy";

export type MarketplaceEmptyStatesP2_123AuditSummary = {
  policyId: typeof MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyPolicyLinked: boolean;
  legacyDesignPolicyLinked: boolean;
  legacyUiLinked: boolean;
  legacyIllustrationLinked: boolean;
  catalogPageWired: boolean;
  ordersPageWired: boolean;
  vendorsModuleWired: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

function moduleUsesScenario(path: string, scenario: string, root: string): boolean {
  const fullPath = join(root, path);
  if (!existsSync(fullPath)) return false;
  const source = readFileSync(fullPath, "utf8");
  return (
    source.includes(`"${scenario}"`) ||
    source.includes(`scenario="${scenario}"`) ||
    source.includes(`scenario={'${scenario}'}`)
  );
}

export function auditMarketplaceEmptyStatesP2_123(
  root = process.cwd(),
): MarketplaceEmptyStatesP2_123AuditSummary {
  const wiringComplete = MARKETPLACE_EMPTY_STATES_P2_123_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyPolicyLinked = false;
  let legacyDesignPolicyLinked = false;
  let legacyUiLinked = false;
  let legacyIllustrationLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_DOC))) {
    const source = readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_DOC), "utf8");
    docWired =
      source.includes(MARKETPLACE_EMPTY_STATES_P2_123_ROUTE) &&
      source.includes(String(MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_COMPONENT))) {
    const source = readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_COMPONENT), "utf8");
    componentWired =
      source.includes("MarketplaceEmptyStatesP2_123Panel") &&
      source.includes("MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES") &&
      source.includes("MarketplaceEmptyState");
    allTestIdsPresent =
      source.includes("MARKETPLACE_EMPTY_STATES_P2_123_TEST_IDS[0]") &&
      source.includes("MARKETPLACE_EMPTY_STATES_P2_123_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_PAGE))) {
    const source = readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_PAGE), "utf8");
    pageWired =
      source.includes("MarketplaceEmptyStatesP2_123Panel") &&
      source.includes("MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID");
  }

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildNoProductsBlock") &&
      source.includes("buildNoOrdersBlock") &&
      source.includes("buildNoVendorsBlock") &&
      source.includes("buildMarketplaceEmptyStatesP2_123DemoReport");
  }

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_SERVICE_PATH))) {
    const source = readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadMarketplaceEmptyStatesP2_123Snapshot") &&
      source.includes("MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID");
  }

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_POLICY))) {
    const source = readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_POLICY), "utf8");
    legacyPolicyLinked =
      source.includes("catalog_empty") &&
      source.includes("orders_empty") &&
      source.includes("vendors_empty");
  }

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_DESIGN_POLICY))) {
    const source = readFileSync(
      join(root, MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_DESIGN_POLICY),
      "utf8",
    );
    legacyDesignPolicyLinked =
      source.includes("MARKETPLACE_EMPTY_STATES_DESIGN_CORE_SCENARIOS") &&
      source.includes("vendors_empty");
  }

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_UI))) {
    const source = readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_UI), "utf8");
    legacyUiLinked =
      source.includes("MarketplaceEmptyState") &&
      source.includes("MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID");
  }

  if (existsSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_ILLUSTRATION))) {
    const source = readFileSync(
      join(root, MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_ILLUSTRATION),
      "utf8",
    );
    legacyIllustrationLinked = source.includes("MarketplaceEmptyStateIllustration");
  }

  const catalogPageWired =
    moduleUsesScenario(MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_PAGE, "catalog_empty", root) &&
    readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_PAGE), "utf8").includes(
      "MarketplaceEmptyState",
    );

  const ordersPageWired =
    moduleUsesScenario(MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_PAGE, "orders_empty", root) &&
    readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_PAGE), "utf8").includes(
      "MarketplaceEmptyState",
    );

  const vendorsModuleWired =
    moduleUsesScenario(MARKETPLACE_EMPTY_STATES_P2_123_VENDORS_MODULE, "vendors_empty", root) &&
    readFileSync(join(root, MARKETPLACE_EMPTY_STATES_P2_123_VENDORS_MODULE), "utf8").includes(
      "MarketplaceEmptyState",
    );

  const combinedSources = [
    MARKETPLACE_EMPTY_STATES_P2_123_DOC,
    "lib/marketplace/marketplace-empty-states-p2-123-content.ts",
    MARKETPLACE_EMPTY_STATES_P2_123_OPERATIONS_PATH,
    MARKETPLACE_EMPTY_STATES_P2_123_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MARKETPLACE_EMPTY_STATES_P2_123_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES.length ===
    MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyPolicyLinked &&
    legacyDesignPolicyLinked &&
    legacyUiLinked &&
    legacyIllustrationLinked &&
    catalogPageWired &&
    ordersPageWired &&
    vendorsModuleWired &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyPolicyLinked,
    legacyDesignPolicyLinked,
    legacyUiLinked,
    legacyIllustrationLinked,
    catalogPageWired,
    ordersPageWired,
    vendorsModuleWired,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatMarketplaceEmptyStatesP2_123AuditLines(
  summary: MarketplaceEmptyStatesP2_123AuditSummary,
): string[] {
  return [
    `Marketplace empty states audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MARKETPLACE_EMPTY_STATES_P2_123_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${MARKETPLACE_EMPTY_STATES_P2_123_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy policy linked: ${summary.legacyPolicyLinked ? "yes" : "no"}`,
    `Legacy design policy linked: ${summary.legacyDesignPolicyLinked ? "yes" : "no"}`,
    `Legacy UI linked: ${summary.legacyUiLinked ? "yes" : "no"}`,
    `Legacy illustration linked: ${summary.legacyIllustrationLinked ? "yes" : "no"}`,
    `Catalog page wired: ${summary.catalogPageWired ? "yes" : "no"}`,
    `Orders page wired: ${summary.ordersPageWired ? "yes" : "no"}`,
    `Vendors module wired: ${summary.vendorsModuleWired ? "yes" : "no"}`,
    `Capabilities (${MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
