/**
 * Blueprint P3-126 — Design partner LOI pipeline (shortlist + discovery calls).
 *
 * @see docs/loi-pipeline.md
 */

export const LOI_PIPELINE_POLICY_ID = "loi-pipeline-p3-126-v1" as const;

export const LOI_PIPELINE_DOC = "docs/loi-pipeline.md" as const;

export const LOI_PIPELINE_SHORTLIST_ARTIFACT =
  "artifacts/loi-pipeline-shortlist.json" as const;

export const LOI_PIPELINE_AUDIT_SCRIPT = "scripts/audit-loi-pipeline-p3-126.ts" as const;

export const LOI_PIPELINE_NPM_SCRIPT = "audit:loi-pipeline-p3-126" as const;

export const LOI_PIPELINE_UNIT_TEST = "tests/unit/loi-pipeline-p3-126.test.ts" as const;

export const LOI_PIPELINE_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const LOI_PIPELINE_SHORTLIST_SLOT_COUNT = 5 as const;

export const LOI_PIPELINE_TARGET_SIGNED_LOI_COUNT = 3 as const;

export const LOI_PIPELINE_RELATED_DOCS = [
  "docs/loi-design-partner-template.md",
  "docs/loi-outreach-email.md",
  "docs/icp-definition-final.md",
  "docs/DEMO_CALL_SCRIPT.md",
  "artifacts/pilot-gono-go-summary.json",
] as const;

export const LOI_PIPELINE_STAGES = [
  "identified",
  "outreach_sent",
  "discovery_scheduled",
  "discovery_completed",
  "icp_qualified",
  "loi_draft",
  "loi_signed",
  "disqualified",
] as const;

export type LoiPipelineStage = (typeof LOI_PIPELINE_STAGES)[number];

export type LoiPipelineIcpSegment = "ghost_kitchen" | "commissary" | "meal_prep" | "flexible";

export const LOI_PIPELINE_REQUIRED_ICP_SEGMENTS = [
  "ghost_kitchen",
  "commissary",
  "meal_prep",
] as const;

export const LOI_PIPELINE_SHORTLIST_SLOTS = [
  {
    id: "slot-1-ghost-kitchen",
    segment: "ghost_kitchen" as const,
    archetypeLabel: "Ghost kitchen — multi-brand production hub",
  },
  {
    id: "slot-2-commissary",
    segment: "commissary" as const,
    archetypeLabel: "Commissary — shared-facility batch scheduling",
  },
  {
    id: "slot-3-meal-prep",
    segment: "meal_prep" as const,
    archetypeLabel: "Meal prep — weekly menu + cutoff cycles",
  },
  {
    id: "slot-4-ghost-kitchen-alt",
    segment: "flexible" as const,
    archetypeLabel: "Flexible — ghost kitchen or small multi-brand operator",
  },
  {
    id: "slot-5-commissary-meal-prep-alt",
    segment: "flexible" as const,
    archetypeLabel: "Flexible — commissary tenant or meal-prep scale-up",
  },
] as const;

export const LOI_PIPELINE_DISCOVERY_CALL_MINUTES = 45 as const;

export const LOI_PIPELINE_HONESTY_MARKERS = [
  "BETA",
  "0 signed LOIs",
  "qualified beta",
  "not a signed customer",
  "template shortlist",
] as const;

export const LOI_PIPELINE_WIRING_PATHS = [
  LOI_PIPELINE_DOC,
  "lib/pm/loi-pipeline-p3-126-policy.ts",
  "lib/pm/loi-pipeline-p3-126-operations.ts",
  "lib/pm/loi-pipeline-p3-126-audit.ts",
  LOI_PIPELINE_SHORTLIST_ARTIFACT,
  LOI_PIPELINE_UNIT_TEST,
] as const;
