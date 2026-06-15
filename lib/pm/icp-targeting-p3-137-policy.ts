/**
 * Blueprint P3-137 — ICP targeting PM (meal prep + ghost kitchen profiles).
 *
 * @see docs/icp-targeting-pm.md
 */

export const ICP_TARGETING_P3_137_POLICY_ID = "icp-targeting-p3-137-v1" as const;

export const ICP_TARGETING_P3_137_DOC = "docs/icp-targeting-pm.md" as const;

export const ICP_TARGETING_P3_137_ARTIFACT =
  "artifacts/icp-targeting-pm-registry.json" as const;

export const ICP_TARGETING_P3_137_AUDIT_SCRIPT =
  "scripts/audit-icp-targeting-p3-137.ts" as const;

export const ICP_TARGETING_P3_137_NPM_SCRIPT = "audit:icp-targeting-p3-137" as const;

export const ICP_TARGETING_P3_137_UNIT_TEST =
  "tests/unit/icp-targeting-p3-137.test.ts" as const;

export const ICP_TARGETING_P3_137_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const ICP_TARGETING_P3_137_PROFILE_IDS = ["meal_prep", "ghost_kitchen"] as const;

export type IcpTargetingP3_137ProfileId = (typeof ICP_TARGETING_P3_137_PROFILE_IDS)[number];

export const ICP_TARGETING_P3_137_WAVE1_ORDER = ["meal_prep", "ghost_kitchen"] as const;

export const ICP_TARGETING_P3_137_ICP_SCORE_TARGET = 8 as const;

export const ICP_TARGETING_P3_137_IMPLEMENTATION_REFS = {
  icpDefinition: "docs/icp-definition-final.md",
  icpLandingPages: "icp-landing-pages-p1-79-v1",
  loiPipeline: "loi-pipeline-p3-126-v1",
} as const;

export const ICP_TARGETING_P3_137_LANDING_PATHS = {
  meal_prep: "/meal-prep-software",
  ghost_kitchen: "/ghost-kitchen-software",
} as const;

export const ICP_TARGETING_P3_137_LOI_SLOTS = {
  meal_prep: "slot-3-meal-prep",
  ghost_kitchen: "slot-1-ghost-kitchen",
} as const;

export const ICP_TARGETING_P3_137_LIVE_AUDIT_NPM = "audit:icp-landing-pages" as const;

export const ICP_TARGETING_P3_137_RELATED_DOCS = [
  "docs/icp-definition-final.md",
  "docs/icp-landing-pages.md",
  "docs/loi-pipeline.md",
  "docs/loi-outreach-email.md",
  "lib/marketing/icp-landing-pages-policy.ts",
] as const;

export const ICP_TARGETING_P3_137_HONESTY_MARKERS = [
  "0 signed LOIs",
  "qualified beta",
  "BETA",
  "template_only",
  "baseline",
] as const;

export const ICP_TARGETING_P3_137_WIRING_PATHS = [
  ICP_TARGETING_P3_137_DOC,
  "lib/pm/icp-targeting-p3-137-policy.ts",
  "lib/pm/icp-targeting-p3-137-operations.ts",
  "lib/pm/icp-targeting-p3-137-audit.ts",
  ICP_TARGETING_P3_137_ARTIFACT,
  ICP_TARGETING_P3_137_UNIT_TEST,
] as const;
