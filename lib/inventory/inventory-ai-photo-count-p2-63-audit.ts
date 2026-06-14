import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildInventoryAiPhotoCountCorpusP263 } from "@/lib/inventory/inventory-ai-photo-count-p2-63-corpus";
import {
  INVENTORY_AI_PHOTO_COUNT_P2_63_ACTION,
  INVENTORY_AI_PHOTO_COUNT_P2_63_APPLY_TEST_ID,
  INVENTORY_AI_PHOTO_COUNT_P2_63_CAMERA_TEST_ID,
  INVENTORY_AI_PHOTO_COUNT_P2_63_COUNTS_PAGE,
  INVENTORY_AI_PHOTO_COUNT_P2_63_DOC,
  INVENTORY_AI_PHOTO_COUNT_P2_63_MARKETMAN_PARITY_NOTE,
  INVENTORY_AI_PHOTO_COUNT_P2_63_PANEL,
  INVENTORY_AI_PHOTO_COUNT_P2_63_PANEL_TEST_ID,
  INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID,
  INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_SERVICE,
  INVENTORY_AI_PHOTO_COUNT_P2_63_WIRING_PATHS,
} from "@/lib/inventory/inventory-ai-photo-count-p2-63-policy";
import { runInventoryAiPhotoCountBenchmarkP263 } from "@/lib/inventory/inventory-ai-photo-count-p2-63-scoring";

export type InventoryAiPhotoCountP263AuditSummary = {
  policyId: typeof INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  serviceWired: boolean;
  actionWired: boolean;
  panelWired: boolean;
  countsPageWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  itemRecallPct: number;
  hallucinationPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditInventoryAiPhotoCountP263(
  root = process.cwd(),
): InventoryAiPhotoCountP263AuditSummary {
  const wiringComplete = INVENTORY_AI_PHOTO_COUNT_P2_63_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_DOC))) {
    const source = readFileSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_DOC), "utf8");
    docWired =
      source.includes(INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID) &&
      source.includes("MarketMan") &&
      source.includes(String(INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT));
  }

  let serviceWired = false;
  if (existsSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_SERVICE))) {
    const source = readFileSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_SERVICE), "utf8");
    serviceWired =
      source.includes("scanShelfPhotoForCounts") &&
      source.includes("applyShelfCountsToInventoryCount") &&
      source.includes("parseShelfCountJson");
  }

  let actionWired = false;
  if (existsSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_ACTION))) {
    const source = readFileSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_ACTION), "utf8");
    actionWired =
      source.includes("scanShelfPhotoCountAction") &&
      source.includes("applyShelfPhotoCountsAction");
  }

  let panelWired = false;
  if (existsSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_PANEL))) {
    const source = readFileSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_PANEL), "utf8");
    panelWired =
      source.includes(INVENTORY_AI_PHOTO_COUNT_P2_63_PANEL_TEST_ID) &&
      source.includes(INVENTORY_AI_PHOTO_COUNT_P2_63_CAMERA_TEST_ID) &&
      source.includes(INVENTORY_AI_PHOTO_COUNT_P2_63_APPLY_TEST_ID);
  }

  let countsPageWired = false;
  if (existsSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_COUNTS_PAGE))) {
    const source = readFileSync(join(root, INVENTORY_AI_PHOTO_COUNT_P2_63_COUNTS_PAGE), "utf8");
    countsPageWired =
      source.includes("/dashboard/inventory/photo-count") ||
      source.includes("photo-count");
  }

  const corpus = buildInventoryAiPhotoCountCorpusP263();
  const result = runInventoryAiPhotoCountBenchmarkP263(corpus);
  const artifactPresent = existsSync(
    join(root, "artifacts/inventory-ai-photo-count-p2-63.json"),
  );

  const passed =
    wiringComplete &&
    docWired &&
    serviceWired &&
    actionWired &&
    panelWired &&
    countsPageWired &&
    corpus.length === INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID,
    wiringComplete,
    docWired,
    serviceWired,
    actionWired,
    panelWired,
    countsPageWired,
    corpusLoaded: corpus.length === INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT,
    scoringPassed: result.passed,
    itemRecallPct: result.itemRecallPct,
    hallucinationPct: result.hallucinationPct,
    artifactPresent,
    passed,
  };
}

export function formatInventoryAiPhotoCountP263AuditLines(
  summary: InventoryAiPhotoCountP263AuditSummary,
): string[] {
  return [
    `Inventory AI photo count (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "wired" : "missing"}`,
    `Action: ${summary.actionWired ? "wired" : "missing"}`,
    `Panel: ${summary.panelWired ? "wired" : "missing"}`,
    `Counts page link: ${summary.countsPageWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT} scenarios)`,
    `Item recall: ${summary.itemRecallPct}%`,
    `Hallucination: ${summary.hallucinationPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `MarketMan parity: ${INVENTORY_AI_PHOTO_COUNT_P2_63_MARKETMAN_PARITY_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
