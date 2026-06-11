import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SALES_ASSETS_PACKAGE_ASSET_COUNT,
  SALES_ASSETS_PACKAGE_DOC,
  SALES_ASSETS_PACKAGE_ENTRIES,
  SALES_ASSETS_PACKAGE_HONESTY_MARKERS,
  SALES_ASSETS_PACKAGE_POLICY_ID,
  SALES_ASSETS_PACKAGE_WIRING_PATHS,
} from "@/lib/marketing/sales-assets-package-policy";

export type SalesAssetsPackageAuditSummary = {
  policyId: typeof SALES_ASSETS_PACKAGE_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  assetCountCorrect: boolean;
  allAssetsPresent: boolean;
  playbookWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditSalesAssetsPackage(root = process.cwd()): SalesAssetsPackageAuditSummary {
  const wiringComplete = SALES_ASSETS_PACKAGE_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let allAssetsPresent = false;
  let playbookWired = false;

  if (existsSync(join(root, SALES_ASSETS_PACKAGE_DOC))) {
    const source = readFileSync(join(root, SALES_ASSETS_PACKAGE_DOC), "utf8");
    docWired = SALES_ASSETS_PACKAGE_ENTRIES.every(
      (entry) => source.includes(entry.docPath) && source.includes(entry.label),
    );
  }

  allAssetsPresent = SALES_ASSETS_PACKAGE_ENTRIES.every((entry) => {
    if (!existsSync(join(root, entry.docPath))) return false;
    return (entry.companionPaths ?? []).every((rel) => existsSync(join(root, rel)));
  });

  const playbookPath = "docs/SALES_PLAYBOOK.md";
  if (existsSync(join(root, playbookPath))) {
    const source = readFileSync(join(root, playbookPath), "utf8");
    playbookWired = source.includes(SALES_ASSETS_PACKAGE_DOC);
  }

  const combinedSources = [
    SALES_ASSETS_PACKAGE_DOC,
    "docs/security-one-pager-sales.md",
    "docs/integration-list-sales.md",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = SALES_ASSETS_PACKAGE_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const assetCountCorrect = SALES_ASSETS_PACKAGE_ENTRIES.length === SALES_ASSETS_PACKAGE_ASSET_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    assetCountCorrect &&
    allAssetsPresent &&
    playbookWired &&
    honestyMarkersPresent;

  return {
    policyId: SALES_ASSETS_PACKAGE_POLICY_ID,
    wiringComplete,
    docWired,
    assetCountCorrect,
    allAssetsPresent,
    playbookWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatSalesAssetsPackageAuditLines(
  summary: SalesAssetsPackageAuditSummary,
): string[] {
  return [
    `Sales assets package audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${SALES_ASSETS_PACKAGE_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Asset count (${SALES_ASSETS_PACKAGE_ASSET_COUNT}): ${summary.assetCountCorrect ? "yes" : "no"}`,
    `All assets present: ${summary.allAssetsPresent ? "yes" : "no"}`,
    `Sales playbook wired: ${summary.playbookWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
