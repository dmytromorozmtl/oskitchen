/**
 * Absolute Final Task 87 — EU data residency roadmap.
 *
 * @see docs/eu-data-residency-roadmap.md
 * @see docs/soc2-roadmap-with-timeline.md
 */

export const EU_DATA_RESIDENCY_ROADMAP_ABSOLUTE_FINAL_POLICY_ID =
  "eu-data-residency-roadmap-absolute-final-v1" as const;

export const EU_DATA_RESIDENCY_ROADMAP_DOC_PATH = "docs/eu-data-residency-roadmap.md" as const;

export const EU_DATA_RESIDENCY_UPSTREAM_SOC2_POLICY_ID = "soc2-roadmap-absolute-final-v1" as const;

export const EU_DATA_RESIDENCY_REQUIRED_HEADINGS = [
  "## Timeline",
  "## Gap analysis",
  "## Human gate checklist",
  "## Sales guidance",
  "Phase 0 — Inventory",
  "Phase 1 — Legal foundation",
  "Phase 2 — Technical assessment",
  "Phase 3 — EU pilot architecture",
  "Phase 4 — Operational readiness",
  "Phase 5 — General availability",
] as const;

export const EU_DATA_RESIDENCY_TIMELINE_PHASES = [
  "Phase 0 — Inventory",
  "Phase 1 — Legal foundation",
  "Phase 2 — Technical assessment",
  "Phase 3 — EU pilot architecture",
  "Phase 4 — Operational readiness",
  "Phase 5 — General availability",
] as const;

export const EU_DATA_RESIDENCY_GAP_AREAS = [
  "Primary database region",
  "Application hosting region",
  "Object storage / media",
  "Subprocessor cross-border transfers",
  "DSR workflow (access / delete / export)",
  "Encryption & key management",
] as const;

export const EU_DATA_RESIDENCY_HONESTY_MARKERS = [
  "Do **not** claim",
  "Not available",
  "US-primary",
  "~15%",
  "not GDPR certified",
] as const;

export const EU_DATA_RESIDENCY_WIRING_PATHS = [
  EU_DATA_RESIDENCY_ROADMAP_DOC_PATH,
  "docs/soc2-roadmap-with-timeline.md",
  "docs/ENTERPRISE_TRUST_COMPLIANCE_READINESS.md",
  "lib/compliance/eu-data-residency-roadmap-absolute-final-policy.ts",
  "lib/compliance/eu-data-residency-roadmap-audit.ts",
  "tests/unit/eu-data-residency-roadmap-absolute-final.test.ts",
] as const;

export const EU_DATA_RESIDENCY_UNIT_TEST =
  "tests/unit/eu-data-residency-roadmap-absolute-final.test.ts" as const;

export const EU_DATA_RESIDENCY_CI_SCRIPTS = [
  "test:ci:eu-data-residency-roadmap",
  "test:ci:eu-data-residency-roadmap:cert",
] as const;

export type EuDataResidencyRoadmapPhase = (typeof EU_DATA_RESIDENCY_TIMELINE_PHASES)[number];
