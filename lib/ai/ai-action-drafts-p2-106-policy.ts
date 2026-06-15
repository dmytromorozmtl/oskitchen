/**
 * Blueprint P2-106 — AI action drafts (Create PO, Flag low margin, Draft schedule, Daily briefing, Commission spike).
 *
 * @see docs/ai-action-drafts.md
 * @see app/dashboard/ai/action-drafts/page.tsx
 */

export const AI_ACTION_DRAFTS_P2_106_POLICY_ID = "ai-action-drafts-p2-106-v1" as const;

export const AI_ACTION_DRAFTS_P2_106_DOC = "docs/ai-action-drafts.md" as const;

export const AI_ACTION_DRAFTS_P2_106_LEGACY_COPILOT =
  "services/ai/copilot-service.ts" as const;

export const AI_ACTION_DRAFTS_P2_106_LEGACY_DRAFTS_PAGE =
  "app/dashboard/copilot/drafts/page.tsx" as const;

export const AI_ACTION_DRAFTS_P2_106_LEGACY_CO_PILOT =
  "services/ai/co-pilot-service.ts" as const;

export const AI_ACTION_DRAFTS_P2_106_CONTENT_PATH =
  "lib/ai/ai-action-drafts-p2-106-content.ts" as const;

export const AI_ACTION_DRAFTS_P2_106_OPERATIONS_PATH =
  "lib/ai/ai-action-drafts-p2-106-operations.ts" as const;

export const AI_ACTION_DRAFTS_P2_106_SERVICE_PATH =
  "services/ai/ai-action-drafts-p2-106-service.ts" as const;

export const AI_ACTION_DRAFTS_P2_106_COMPONENT =
  "components/ai/ai-action-drafts-panel.tsx" as const;

export const AI_ACTION_DRAFTS_P2_106_PAGE = "app/dashboard/ai/action-drafts/page.tsx" as const;

export const AI_ACTION_DRAFTS_P2_106_ROUTE = "/dashboard/ai/action-drafts" as const;

export const AI_ACTION_DRAFTS_P2_106_COPILOT_ROUTE = "/dashboard/ai/co-pilot" as const;

export const AI_ACTION_DRAFTS_P2_106_DRAFTS_ROUTE = "/dashboard/copilot/drafts" as const;

export const AI_ACTION_DRAFTS_P2_106_DRAFT_TYPE_COUNT = 5 as const;

export const AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT = 3 as const;

export const AI_ACTION_DRAFTS_P2_106_TEST_IDS = [
  "ai-action-drafts",
  "ai-action-purchasing-schedule",
  "ai-action-margin-commission",
  "ai-action-daily-briefing",
] as const;

export const AI_ACTION_DRAFTS_P2_106_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const AI_ACTION_DRAFTS_P2_106_AUDIT_SCRIPT =
  "scripts/audit-ai-action-drafts-p2-106.ts" as const;

export const AI_ACTION_DRAFTS_P2_106_NPM_SCRIPT = "audit:ai-action-drafts-p2-106" as const;

export const AI_ACTION_DRAFTS_P2_106_UNIT_TEST =
  "tests/unit/ai-action-drafts-p2-106.test.ts" as const;

export const AI_ACTION_DRAFTS_P2_106_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const AI_ACTION_DRAFTS_P2_106_WIRING_PATHS = [
  AI_ACTION_DRAFTS_P2_106_DOC,
  AI_ACTION_DRAFTS_P2_106_CONTENT_PATH,
  AI_ACTION_DRAFTS_P2_106_OPERATIONS_PATH,
  AI_ACTION_DRAFTS_P2_106_SERVICE_PATH,
  AI_ACTION_DRAFTS_P2_106_COMPONENT,
  AI_ACTION_DRAFTS_P2_106_PAGE,
  "lib/ai/ai-action-drafts-p2-106-policy.ts",
  "lib/ai/ai-action-drafts-p2-106-audit.ts",
  AI_ACTION_DRAFTS_P2_106_UNIT_TEST,
  AI_ACTION_DRAFTS_P2_106_LEGACY_COPILOT,
  AI_ACTION_DRAFTS_P2_106_LEGACY_DRAFTS_PAGE,
  AI_ACTION_DRAFTS_P2_106_LEGACY_CO_PILOT,
] as const;
