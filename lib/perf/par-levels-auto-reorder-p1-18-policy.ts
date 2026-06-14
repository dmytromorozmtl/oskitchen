/**
 * P1-18 — Batch-fix N+1 in par-levels-auto-reorder-service (findMany + createMany).
 *
 * @see docs/par-levels-auto-reorder-p1-18.md
 */

import { PAR_LEVELS_AUTO_REORDER_P2_43_SERVICE } from "@/lib/inventory/par-levels-auto-reorder-p2-43-policy";

export const PAR_LEVELS_AUTO_REORDER_P1_18_POLICY_ID =
  "p1-18-par-levels-auto-reorder-n1-v1" as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_DOC =
  "docs/par-levels-auto-reorder-p1-18.md" as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_ARTIFACT =
  "artifacts/par-levels-auto-reorder-p1-18.json" as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_SERVICE = PAR_LEVELS_AUTO_REORDER_P2_43_SERVICE;

export const PAR_LEVELS_AUTO_REORDER_P1_18_SYNC_FN = "syncReorderQueueFromBelowParLevels" as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_DRAFT_PO_FN =
  "createDraftPurchaseOrdersFromReorderQueue" as const;

/** Required batch patterns in syncReorderQueueFromBelowParLevels. */
export const PAR_LEVELS_AUTO_REORDER_P1_18_REQUIRED_BATCH_MARKERS = [
  "reorderQueueItem.findMany",
  "supplier.findMany",
  "supplierItem.findMany",
  "reorderQueueItem.createMany",
] as const;

/** Forbidden per-row query patterns inside syncReorderQueueFromBelowParLevels. */
export const PAR_LEVELS_AUTO_REORDER_P1_18_FORBIDDEN_SYNC_MARKERS = [
  "reorderQueueItem.findFirst",
  "reorderQueueItem.create({",
  "findSupplierByName",
] as const;

/** Forbidden per-row supplierItem lookup in draft PO builder. */
export const PAR_LEVELS_AUTO_REORDER_P1_18_FORBIDDEN_DRAFT_PO_MARKERS = [
  "supplierItem.findFirst",
] as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_CHECK_NPM_SCRIPT =
  "check:par-levels-auto-reorder-p1-18" as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_CI_NPM_SCRIPT =
  "test:ci:par-levels-auto-reorder-p1-18" as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_UNIT_TEST =
  "tests/unit/par-levels-auto-reorder-p1-18.test.ts" as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const PAR_LEVELS_AUTO_REORDER_P1_18_WIRING_PATHS = [
  PAR_LEVELS_AUTO_REORDER_P1_18_DOC,
  PAR_LEVELS_AUTO_REORDER_P1_18_SERVICE,
  PAR_LEVELS_AUTO_REORDER_P1_18_UNIT_TEST,
  PAR_LEVELS_AUTO_REORDER_P1_18_ARTIFACT,
  PAR_LEVELS_AUTO_REORDER_P1_18_CI_WORKFLOW,
] as const;
