/**
 * Absolute Final Task 67 — bus factor mitigation: onboarding, ADRs, video walkthrough.
 *
 * @see docs/bus-factor-mitigation.md
 * @see docs/engineering-onboarding.md
 * @see docs/engineering-video-walkthrough.md
 */

export const BUS_FACTOR_MITIGATION_ABSOLUTE_FINAL_POLICY_ID =
  "bus-factor-mitigation-absolute-final-v1" as const;

export const BUS_FACTOR_MITIGATION_LEGACY_POLICY_ID = "bus-factor-mitigation-v1" as const;

export const BUS_FACTOR_MITIGATION_DOC_PATH = "docs/bus-factor-mitigation.md" as const;

export const BUS_FACTOR_ENGINEERING_ONBOARDING_DOC = "docs/engineering-onboarding.md" as const;

export const BUS_FACTOR_VIDEO_WALKTHROUGH_DOC = "docs/engineering-video-walkthrough.md" as const;

export const BUS_FACTOR_ADR_README_PATH = "docs/adr/README.md" as const;

export const BUS_FACTOR_ADR_FILES = [
  "docs/adr/0001-monolith-nextjs-server-actions.md",
  "docs/adr/0002-tenant-workspace-scoping.md",
  "docs/adr/0003-inline-webhook-queue.md",
  "docs/adr/0004-supabase-postgres-stack.md",
  "docs/adr/0005-production-cron-allowlist.md",
  "docs/adr/0006-engineering-knowledge-transfer.md",
] as const;

export const BUS_FACTOR_ONBOARDING_REQUIRED_HEADINGS = [
  "## Week 1",
  "## Week 2",
  "### Day 1",
  "## Access checklist",
  "## CI certification",
] as const;

export const BUS_FACTOR_VIDEO_REQUIRED_HEADINGS = [
  "## Chapter map",
  "## Chapter 1",
  "Repository map",
  "Deploy path",
  "on-call",
] as const;

export const BUS_FACTOR_MITIGATION_WIRING_PATHS = [
  BUS_FACTOR_MITIGATION_DOC_PATH,
  BUS_FACTOR_ENGINEERING_ONBOARDING_DOC,
  BUS_FACTOR_VIDEO_WALKTHROUGH_DOC,
  BUS_FACTOR_ADR_README_PATH,
  "lib/ops/bus-factor-mitigation-absolute-final-policy.ts",
  "lib/ops/bus-factor-mitigation-audit.ts",
  "tests/unit/bus-factor-mitigation-absolute-final.test.ts",
  ...BUS_FACTOR_ADR_FILES,
] as const;

export const BUS_FACTOR_MITIGATION_UNIT_TEST =
  "tests/unit/bus-factor-mitigation-absolute-final.test.ts" as const;

export const BUS_FACTOR_MITIGATION_CI_SCRIPTS = [
  "test:ci:bus-factor-mitigation",
  "test:ci:bus-factor-mitigation:cert",
] as const;

export const BUS_FACTOR_SCORECARD_TARGETS = {
  engineeringFteQ4: 2,
  adrCountQ4: 8,
  minAdrCount: 6,
} as const;
