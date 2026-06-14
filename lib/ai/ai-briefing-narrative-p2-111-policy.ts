/**
 * Blueprint P2-111 — AI briefing narrative (Yesterday + channel + Next step).
 *
 * @see docs/ai-briefing-narrative.md
 * @see app/dashboard/ai/briefing-narrative/page.tsx
 */

export const AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID = "ai-briefing-narrative-p2-111-v1" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_DOC = "docs/ai-briefing-narrative.md" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING =
  "services/briefing/owner-daily-briefing-service.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING_LIB =
  "lib/briefing/owner-daily-briefing-era19.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_LEGACY_DRAFTS =
  "lib/ai/ai-action-drafts-p2-106-operations.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_LEGACY_COPILOT =
  "services/ai/copilot-service.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_CONTENT_PATH =
  "lib/ai/ai-briefing-narrative-p2-111-content.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_OPERATIONS_PATH =
  "lib/ai/ai-briefing-narrative-p2-111-operations.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_SERVICE_PATH =
  "services/ai/ai-briefing-narrative-p2-111-service.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_COMPONENT =
  "components/ai/ai-briefing-narrative-panel.tsx" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_PAGE =
  "app/dashboard/ai/briefing-narrative/page.tsx" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_ROUTE = "/dashboard/ai/briefing-narrative" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_TODAY_ROUTE = "/dashboard/today" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT = 3 as const;

export const AI_BRIEFING_NARRATIVE_P2_111_TEST_IDS = [
  "ai-briefing-narrative",
  "ai-briefing-yesterday",
  "ai-briefing-channel-mix",
  "ai-briefing-next-step",
] as const;

export const AI_BRIEFING_NARRATIVE_P2_111_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const AI_BRIEFING_NARRATIVE_P2_111_AUDIT_SCRIPT =
  "scripts/audit-ai-briefing-narrative-p2-111.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_NPM_SCRIPT = "audit:ai-briefing-narrative-p2-111" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_UNIT_TEST =
  "tests/unit/ai-briefing-narrative-p2-111.test.ts" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_WIRING_PATHS = [
  AI_BRIEFING_NARRATIVE_P2_111_DOC,
  AI_BRIEFING_NARRATIVE_P2_111_CONTENT_PATH,
  AI_BRIEFING_NARRATIVE_P2_111_OPERATIONS_PATH,
  AI_BRIEFING_NARRATIVE_P2_111_SERVICE_PATH,
  AI_BRIEFING_NARRATIVE_P2_111_COMPONENT,
  AI_BRIEFING_NARRATIVE_P2_111_PAGE,
  "lib/ai/ai-briefing-narrative-p2-111-policy.ts",
  "lib/ai/ai-briefing-narrative-p2-111-audit.ts",
  AI_BRIEFING_NARRATIVE_P2_111_UNIT_TEST,
  AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING,
  AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING_LIB,
  AI_BRIEFING_NARRATIVE_P2_111_LEGACY_DRAFTS,
  AI_BRIEFING_NARRATIVE_P2_111_LEGACY_COPILOT,
] as const;
