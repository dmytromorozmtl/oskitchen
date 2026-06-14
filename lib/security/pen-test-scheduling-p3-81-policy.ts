/**
 * P3-81 — Pen test + QSA scheduling before enterprise promotion.
 *
 * @see docs/pen-test-scheduling-p3-81.md
 */

export const PEN_TEST_SCHEDULING_P3_81_POLICY_ID = "pen-test-scheduling-p3-81-v1" as const;

export const PEN_TEST_SCHEDULING_P3_81_DOC = "docs/pen-test-scheduling-p3-81.md" as const;

export const PEN_TEST_SCHEDULING_P3_81_ARTIFACT = "artifacts/pen-test-scheduling-p3-81.json" as const;

export const PEN_TEST_SCHEDULING_P3_81_AUDIT_MODULE =
  "lib/security/pen-test-scheduling-p3-81-audit.ts" as const;

export const PEN_TEST_SCHEDULING_P3_81_SCORING_MODULE =
  "lib/security/pen-test-scheduling-p3-81-scoring.ts" as const;

export const PEN_TEST_SCHEDULING_P3_81_SCENARIO_COUNT = 6 as const;

export const PEN_TEST_SCHEDULING_P3_81_CHECK_NPM_SCRIPT = "check:pen-test-scheduling-p3-81" as const;

export const PEN_TEST_SCHEDULING_P3_81_UNIT_TEST =
  "tests/unit/pen-test-scheduling-p3-81.test.ts" as const;

export const PEN_TEST_SCHEDULING_P3_81_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const PEN_TEST_SCHEDULING_P3_81_UPSTREAM_DOCS = [
  "docs/pen-test-plan.md",
  "docs/pen-test-vendor-selection.md",
  "docs/offline-pos-pci-review.md",
  "docs/enterprise-procurement-pack.md",
] as const;

export const PEN_TEST_SCHEDULING_P3_81_PRIMARY_VENDOR = "cobalt" as const;

export const PEN_TEST_SCHEDULING_P3_81_QSA_TRACK = "pci_counsel_offline_pos" as const;

export const PEN_TEST_SCHEDULING_P3_81_TARGET_KICKOFF = "2026-07-07" as const;

export const PEN_TEST_SCHEDULING_P3_81_TARGET_REPORT = "2026-08-04" as const;

export const PEN_TEST_SCHEDULING_P3_81_QSA_INTRO = "2026-06-24" as const;

export const PEN_TEST_SCHEDULING_P3_81_WIRING_PATHS = [
  PEN_TEST_SCHEDULING_P3_81_DOC,
  PEN_TEST_SCHEDULING_P3_81_ARTIFACT,
  PEN_TEST_SCHEDULING_P3_81_AUDIT_MODULE,
  PEN_TEST_SCHEDULING_P3_81_SCORING_MODULE,
  PEN_TEST_SCHEDULING_P3_81_UNIT_TEST,
  PEN_TEST_SCHEDULING_P3_81_CI_WORKFLOW,
  "artifacts/pen-test-vendor-selection.json",
  ...PEN_TEST_SCHEDULING_P3_81_UPSTREAM_DOCS,
] as const;
