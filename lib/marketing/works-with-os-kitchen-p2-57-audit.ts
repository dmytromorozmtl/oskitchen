import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS,
  worksWithLogoPublicPath,
} from "@/lib/marketing/works-with-os-kitchen-p2-57-content";
import {
  WORKS_WITH_OS_KITCHEN_P2_57_DOC,
  WORKS_WITH_OS_KITCHEN_P2_57_GRID_COMPONENT,
  WORKS_WITH_OS_KITCHEN_P2_57_HONESTY_MARKERS,
  WORKS_WITH_OS_KITCHEN_P2_57_LIVE_COUNT,
  WORKS_WITH_OS_KITCHEN_P2_57_PAGE,
  WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID,
  WORKS_WITH_OS_KITCHEN_P2_57_PUBLIC_ROUTE,
  WORKS_WITH_OS_KITCHEN_P2_57_WIRING_PATHS,
} from "@/lib/marketing/works-with-os-kitchen-p2-57-policy";

export type WorksWithOsKitchenP257AuditSummary = {
  policyId: typeof WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  pageWired: boolean;
  gridWired: boolean;
  liveCountOk: boolean;
  logosPresent: boolean;
  registryAligned: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditWorksWithOsKitchenP257(
  root = process.cwd(),
): WorksWithOsKitchenP257AuditSummary {
  const wiringComplete = WORKS_WITH_OS_KITCHEN_P2_57_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let honestyMarkersPresent = false;
  if (existsSync(join(root, WORKS_WITH_OS_KITCHEN_P2_57_DOC))) {
    const source = readFileSync(join(root, WORKS_WITH_OS_KITCHEN_P2_57_DOC), "utf8");
    docWired =
      source.includes(WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID) &&
      source.includes(String(WORKS_WITH_OS_KITCHEN_P2_57_LIVE_COUNT));
    honestyMarkersPresent = WORKS_WITH_OS_KITCHEN_P2_57_HONESTY_MARKERS.every((marker) =>
      source.toLowerCase().includes(marker.toLowerCase()),
    );
  }

  let pageWired = false;
  let gridWired = false;
  if (existsSync(join(root, WORKS_WITH_OS_KITCHEN_P2_57_PAGE))) {
    const page = readFileSync(join(root, WORKS_WITH_OS_KITCHEN_P2_57_PAGE), "utf8");
    pageWired =
      page.includes(WORKS_WITH_OS_KITCHEN_P2_57_PUBLIC_ROUTE) &&
      page.includes("WorksWithOsKitchenIntegrationGrid");
  }
  if (existsSync(join(root, WORKS_WITH_OS_KITCHEN_P2_57_GRID_COMPONENT))) {
    const grid = readFileSync(join(root, WORKS_WITH_OS_KITCHEN_P2_57_GRID_COMPONENT), "utf8");
    gridWired =
      grid.includes("WORKS_WITH_OS_KITCHEN_P2_57_GRID_TEST_ID") &&
      grid.includes("WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS") &&
      grid.includes("logoPath");
  }

  const liveCountOk =
    WORKS_WITH_OS_KITCHEN_P2_57_LIVE_COUNT === 17 &&
    WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS.length === 17;

  const logosPresent = WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS.every((card) =>
    existsSync(join(root, worksWithLogoPublicPath(card.id))),
  );

  let registryAligned = false;
  if (existsSync(join(root, "lib/integrations/integration-registry.ts"))) {
    const registry = readFileSync(join(root, "lib/integrations/integration-registry.ts"), "utf8");
    registryAligned = WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS.every(
      (card) =>
        registry.includes(`id: "${card.id}"`) &&
        registry.includes(`name: "${card.name}"`) &&
        card.status === "LIVE",
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    pageWired &&
    gridWired &&
    liveCountOk &&
    logosPresent &&
    registryAligned &&
    honestyMarkersPresent;

  return {
    policyId: WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID,
    wiringComplete,
    docWired,
    pageWired,
    gridWired,
    liveCountOk,
    logosPresent,
    registryAligned,
    honestyMarkersPresent,
    passed,
  };
}

export function formatWorksWithOsKitchenP257AuditLines(
  summary: WorksWithOsKitchenP257AuditSummary,
): string[] {
  return [
    `Works with OS Kitchen (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Page: ${summary.pageWired ? "yes" : "no"}`,
    `Grid: ${summary.gridWired ? "yes" : "no"}`,
    `17 LIVE count: ${summary.liveCountOk ? "yes" : "no"}`,
    `Logos: ${summary.logosPresent ? "yes" : "no"}`,
    `Registry aligned: ${summary.registryAligned ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
