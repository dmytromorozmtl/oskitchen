import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeParGapQuantity,
  isBelowParLevel,
  suggestParReplenishmentQuantity,
} from "@/lib/inventory/par-levels-auto-reorder-p2-43-measurement";
import {
  PAR_LEVELS_AUTO_REORDER_P2_43_ACTIONS,
  PAR_LEVELS_AUTO_REORDER_P2_43_DOC,
  PAR_LEVELS_AUTO_REORDER_P2_43_DRAFT_PO_TEST_ID,
  PAR_LEVELS_AUTO_REORDER_P2_43_FLOW_STEPS,
  PAR_LEVELS_AUTO_REORDER_P2_43_HONESTY_MARKERS,
  PAR_LEVELS_AUTO_REORDER_P2_43_POLICY_ID,
  PAR_LEVELS_AUTO_REORDER_P2_43_PURCHASING_ROUTE,
  PAR_LEVELS_AUTO_REORDER_P2_43_REORDER_PAGE,
  PAR_LEVELS_AUTO_REORDER_P2_43_REORDER_ROUTE,
  PAR_LEVELS_AUTO_REORDER_P2_43_ROOT_TEST_ID,
  PAR_LEVELS_AUTO_REORDER_P2_43_SERVICE,
  PAR_LEVELS_AUTO_REORDER_P2_43_SYNC_TEST_ID,
  PAR_LEVELS_AUTO_REORDER_P2_43_WIRING_PATHS,
} from "@/lib/inventory/par-levels-auto-reorder-p2-43-policy";

export type ParLevelsAutoReorderP2_43AuditSummary = {
  policyId: typeof PAR_LEVELS_AUTO_REORDER_P2_43_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  serviceWired: boolean;
  actionsWired: boolean;
  reorderPageWired: boolean;
  purchasingPageWired: boolean;
  goldenParMathOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditParLevelsAutoReorderP2_43(
  root = process.cwd(),
): ParLevelsAutoReorderP2_43AuditSummary {
  const wiringComplete = PAR_LEVELS_AUTO_REORDER_P2_43_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, PAR_LEVELS_AUTO_REORDER_P2_43_DOC))) {
    const source = readFileSync(join(root, PAR_LEVELS_AUTO_REORDER_P2_43_DOC), "utf8");
    docWired =
      source.includes(PAR_LEVELS_AUTO_REORDER_P2_43_REORDER_ROUTE) &&
      source.includes("MarketMan parity") &&
      source.includes("par level") &&
      source.includes("draft PO");
  }

  let serviceWired = false;
  if (existsSync(join(root, PAR_LEVELS_AUTO_REORDER_P2_43_SERVICE))) {
    const source = readFileSync(join(root, PAR_LEVELS_AUTO_REORDER_P2_43_SERVICE), "utf8");
    serviceWired =
      source.includes("syncReorderQueueFromBelowParLevels") &&
      source.includes("createDraftPurchaseOrdersFromReorderQueue") &&
      source.includes("PAR_REPLENISHMENT");
  }

  let actionsWired = false;
  if (existsSync(join(root, PAR_LEVELS_AUTO_REORDER_P2_43_ACTIONS))) {
    const source = readFileSync(join(root, PAR_LEVELS_AUTO_REORDER_P2_43_ACTIONS), "utf8");
    actionsWired =
      source.includes("syncParLevelsToReorderQueueAction") &&
      source.includes("createDraftPosFromReorderQueueAction");
  }

  let reorderPageWired = false;
  if (existsSync(join(root, PAR_LEVELS_AUTO_REORDER_P2_43_REORDER_PAGE))) {
    const source = readFileSync(join(root, PAR_LEVELS_AUTO_REORDER_P2_43_REORDER_PAGE), "utf8");
    reorderPageWired =
      source.includes(PAR_LEVELS_AUTO_REORDER_P2_43_ROOT_TEST_ID) &&
      source.includes(PAR_LEVELS_AUTO_REORDER_P2_43_SYNC_TEST_ID) &&
      source.includes(PAR_LEVELS_AUTO_REORDER_P2_43_DRAFT_PO_TEST_ID);
  }

  let purchasingPageWired = false;
  const purchasingPage = join(root, "app/dashboard/purchasing/page.tsx");
  if (existsSync(purchasingPage)) {
    const source = readFileSync(purchasingPage, "utf8");
    purchasingPageWired =
      source.includes("syncParLevelsToReorderQueueAction") &&
      source.includes(PAR_LEVELS_AUTO_REORDER_P2_43_SYNC_TEST_ID);
  }

  const belowPar = isBelowParLevel({ currentStock: 4, parLevel: 10, reorderPoint: 6 });
  const gap = computeParGapQuantity({ currentStock: 4, parLevel: 10 });
  const suggested = suggestParReplenishmentQuantity({ currentStock: 4, parLevel: 10, reorderPoint: 6 });
  const goldenParMathOk = belowPar === true && gap === 6 && suggested === 6;

  const combined = [PAR_LEVELS_AUTO_REORDER_P2_43_DOC, PAR_LEVELS_AUTO_REORDER_P2_43_SERVICE]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = PAR_LEVELS_AUTO_REORDER_P2_43_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    serviceWired &&
    actionsWired &&
    reorderPageWired &&
    purchasingPageWired &&
    goldenParMathOk &&
    honestyMarkersPresent &&
    PAR_LEVELS_AUTO_REORDER_P2_43_FLOW_STEPS.length === 4;

  return {
    policyId: PAR_LEVELS_AUTO_REORDER_P2_43_POLICY_ID,
    wiringComplete,
    docWired,
    serviceWired,
    actionsWired,
    reorderPageWired,
    purchasingPageWired,
    goldenParMathOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatParLevelsAutoReorderP2_43AuditLines(
  summary: ParLevelsAutoReorderP2_43AuditSummary,
): string[] {
  return [
    `Par levels auto-reorder audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${PAR_LEVELS_AUTO_REORDER_P2_43_DOC})`,
    `Service: ${summary.serviceWired ? "wired" : "missing"}`,
    `Actions: ${summary.actionsWired ? "wired" : "missing"}`,
    `Reorder queue page: ${summary.reorderPageWired ? "yes" : "no"} (${PAR_LEVELS_AUTO_REORDER_P2_43_REORDER_ROUTE})`,
    `Purchasing page sync: ${summary.purchasingPageWired ? "yes" : "no"} (${PAR_LEVELS_AUTO_REORDER_P2_43_PURCHASING_ROUTE})`,
    `Golden par math: ${summary.goldenParMathOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
