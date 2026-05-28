/**
 * Mutation access consolidation policy — Evolution Era 4 Cycle 11.
 *
 * Single narrative: resolve workspace actor → check canonical permission via
 * `requireMutationPermission` → domain helpers add audits and scoped lookups.
 */

export const MUTATION_ACCESS_POLICY_ID = "era4-mutation-access-consolidation-v1" as const;

export const MUTATION_ACCESS_NARRATIVE = {
  coreEntrypoint: "requireMutationPermission",
  coreModule: "lib/permissions/mutation-access.ts",
  actorResolver: "requireWorkspacePermissionActor",
  registryModule: "lib/permissions/domain-mutation-registry.ts",
  uiMirror: "lib/permissions/resolve-ui-permissions.ts",
} as const;

/** Documented exceptions — must not be mistaken for missing RBAC. */
export const MUTATION_ACCESS_DOCUMENTED_EXCEPTIONS = [
  {
    id: "copilot_capability_matrix",
    module: "lib/ai/require-copilot-mutation.ts",
    reason: "Copilot uses capability matrix + workspace actor, not a single PermissionKey.",
  },
  {
    id: "feedback_session_only",
    module: "lib/feedback/require-app-feedback-submit.ts",
    reason: "In-app feedback requires authenticated session; not a workspace capability mutation.",
  },
  {
    id: "platform_roles",
    module: "lib/platform/platform-guards.ts",
    reason: "Platform/support principals use platform role rows, not workspace PermissionKey grants.",
  },
] as const;

export const MUTATION_ACCESS_CI_SCRIPTS = [
  "test:ci:mutation-access-consolidation",
  "test:ci:mutation-access-consolidation:cert",
] as const;

export const MUTATION_ACCESS_UNIT_TESTS = [
  "tests/unit/domain-mutation-registry.test.ts",
  "tests/unit/log-domain-mutation-denied.test.ts",
] as const;
