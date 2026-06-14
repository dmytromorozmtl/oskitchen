/**
 * P2-63 — Inventory AI photo count policy (MarketMan parity).
 *
 * @see docs/inventory-ai-photo-count-p2-63.md
 */

export const INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID =
  "inventory-ai-photo-count-p2-63-v1" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_DOC =
  "docs/inventory-ai-photo-count-p2-63.md" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_ARTIFACT =
  "artifacts/inventory-ai-photo-count-p2-63.json" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_SERVICE =
  "services/ai/inventory-photo-count-service.ts" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_ACTION =
  "actions/inventory/photo-count.ts" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_PANEL =
  "components/inventory/inventory-photo-count-panel.tsx" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_PAGE =
  "app/dashboard/inventory/photo-count/page.tsx" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_COUNTS_PAGE =
  "app/dashboard/inventory/counts/page.tsx" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_SCORING_MODULE =
  "lib/inventory/inventory-ai-photo-count-p2-63-scoring.ts" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_CORPUS_MODULE =
  "lib/inventory/inventory-ai-photo-count-p2-63-corpus.ts" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_AUDIT_MODULE =
  "lib/inventory/inventory-ai-photo-count-p2-63-audit.ts" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_PANEL_TEST_ID =
  "inventory-photo-count-panel" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_CAMERA_TEST_ID =
  "inventory-photo-count-camera-btn" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_APPLY_TEST_ID =
  "inventory-photo-count-apply-btn" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT = 15 as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_MIN_RECALL_PCT = 90 as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_MAX_HALLUCINATION_PCT = 0 as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_CHECK_NPM_SCRIPT =
  "check:inventory-ai-photo-count-p2-63" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_CI_NPM_SCRIPT =
  "test:ci:inventory-ai-photo-count-p2-63" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_UNIT_TEST =
  "tests/unit/inventory-ai-photo-count-p2-63.test.ts" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_FLOW_STEPS = [
  "photo-capture",
  "ai-shelf-count",
  "match-ingredients",
  "apply-to-count",
] as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_MARKETMAN_PARITY_NOTE =
  "Shelf photo → AI item counts → physical count lines — comparable to MarketMan photo count, without claiming certified parity." as const;

export const INVENTORY_AI_PHOTO_COUNT_P2_63_WIRING_PATHS = [
  INVENTORY_AI_PHOTO_COUNT_P2_63_DOC,
  INVENTORY_AI_PHOTO_COUNT_P2_63_ARTIFACT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_CORPUS_MODULE,
  INVENTORY_AI_PHOTO_COUNT_P2_63_SCORING_MODULE,
  INVENTORY_AI_PHOTO_COUNT_P2_63_AUDIT_MODULE,
  INVENTORY_AI_PHOTO_COUNT_P2_63_SERVICE,
  INVENTORY_AI_PHOTO_COUNT_P2_63_ACTION,
  INVENTORY_AI_PHOTO_COUNT_P2_63_PANEL,
  INVENTORY_AI_PHOTO_COUNT_P2_63_PAGE,
  INVENTORY_AI_PHOTO_COUNT_P2_63_UNIT_TEST,
  INVENTORY_AI_PHOTO_COUNT_P2_63_CI_WORKFLOW,
  "lib/inventory/inventory-photo-count-types.ts",
  "services/inventory/count-service.ts",
] as const;
