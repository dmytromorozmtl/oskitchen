/**
 * Absolute Final Task 66 — SOC 2 roadmap with timeline and gap analysis.
 *
 * @see docs/soc2-roadmap-with-timeline.md
 * @see docs/soc2-readiness-assessment.md
 */

export const SOC2_ROADMAP_ABSOLUTE_FINAL_POLICY_ID = "soc2-roadmap-absolute-final-v1" as const;

export const SOC2_ROADMAP_UPSTREAM_ASSESSMENT_POLICY_ID = "soc2-readiness-assessment-v1" as const;

export const SOC2_ROADMAP_DOC_PATH = "docs/soc2-roadmap-with-timeline.md" as const;

export const SOC2_ROADMAP_REQUIRED_HEADINGS = [
  "## Timeline",
  "## Gap analysis",
  "## Human gate checklist",
  "Phase 0 — Baseline",
  "Phase 1 — Gap analysis",
  "Phase 2 — Readiness",
  "Phase 3 — Type I prep",
  "Phase 4 — Observation",
  "Phase 5 — Type II report",
] as const;

export const SOC2_ROADMAP_TIMELINE_PHASES = [
  "Phase 0 — Baseline",
  "Phase 1 — Gap analysis",
  "Phase 2 — Readiness",
  "Phase 3 — Type I prep",
  "Phase 4 — Observation",
  "Phase 5 — Type II report",
] as const;

export const SOC2_ROADMAP_GAP_AREAS = [
  "CC1 Control environment",
  "CC6 Logical access",
  "CC7 System operations",
  "CC9 Vendor risk",
  "Availability (A)",
] as const;

export const SOC2_ROADMAP_HONESTY_MARKERS = [
  "Not certified",
  "Do **not** claim",
  "~35%",
] as const;

export const SOC2_ROADMAP_WIRING_PATHS = [
  SOC2_ROADMAP_DOC_PATH,
  "docs/soc2-readiness-assessment.md",
  "lib/compliance/soc2-roadmap-absolute-final-policy.ts",
  "lib/compliance/soc2-roadmap-audit.ts",
  "tests/unit/soc2-roadmap-absolute-final.test.ts",
] as const;

export const SOC2_ROADMAP_UNIT_TEST = "tests/unit/soc2-roadmap-absolute-final.test.ts" as const;

export const SOC2_ROADMAP_CI_SCRIPTS = [
  "test:ci:soc2-roadmap",
  "test:ci:soc2-roadmap:cert",
] as const;

export type Soc2RoadmapPhase = (typeof SOC2_ROADMAP_TIMELINE_PHASES)[number];
