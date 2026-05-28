/**
 * Mutation access Era 11 recertification — Evolution Era 11 Cycle 2.
 *
 * Re-validates Era 4 consolidation + Era 9 wave-4 recert after Era 10 production
 * calendar mutations (status workflow). No RBAC weakening.
 */

export const MUTATION_ACCESS_ERA11_POLICY_ID = "era11-mutation-access-recert-v1" as const;

export const MUTATION_ACCESS_ERA11_EXTENDS_POLICY_ID =
  "era4-mutation-access-consolidation-v1" as const;

export const MUTATION_ACCESS_ERA11_WAVE4_RECERT_ID = "era9-rbac-wave4-recert-v1" as const;

/** Inline action gates (no separate lib/* helper module) certified in Era 11. */
export const MUTATION_ACCESS_ERA11_INLINE_WAVE4_GATES = [
  {
    actionPath: "actions/production-calendar.ts",
    gateFunction: "requireProductionCalendarMutation",
    canonicalPermission: "production.manage",
    operations: [
      "production_calendar.create_task",
      "production_calendar.move_task",
      "production_calendar.update_task_status",
    ],
  },
] as const;

export const MUTATION_ACCESS_ERA11_CI_SCRIPTS = [
  "test:ci:mutation-access-era11",
  "test:ci:mutation-access-era11:cert",
] as const;

export const MUTATION_ACCESS_ERA11_UNIT_TESTS = [
  "tests/unit/mutation-access-era11-policy.test.ts",
  "tests/unit/mutation-access-era11-cert-live.test.ts",
] as const;

export const MUTATION_ACCESS_ERA11_CANONICAL_DOC_PATHS = [
  "docs/rbac-permission-architecture.md",
  "docs/qa-master-test-plan.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

export const MUTATION_ACCESS_ERA11_CANONICAL_MARKERS = [
  MUTATION_ACCESS_ERA11_POLICY_ID,
  MUTATION_ACCESS_ERA11_EXTENDS_POLICY_ID,
  "production_calendar.update_task_status",
] as const;
