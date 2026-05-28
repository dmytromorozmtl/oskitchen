/**
 * Persona-based staff default landing — Evolution Era 18 Workstream J Cycle 5.
 *
 * Replaces legacy STAFF → /dashboard/kitchen post-auth with RBAC-aware primary workflow.
 * Does NOT claim full Square role-nav parity or remove operator home hub at /dashboard.
 */

export const OPERATOR_DEFAULT_LANDING_ERA18_POLICY_ID =
  "era18-operator-default-landing-v1" as const;

export const OPERATOR_DEFAULT_LANDING_ERA18_DECISION_DATE = "2026-05-28" as const;

export const OPERATOR_DEFAULT_LANDING_ERA18_PROOF_STATUS =
  "operator_default_landing_wired" as const;

export const OPERATOR_DEFAULT_LANDING_ERA18_RESOLVER_MODULE =
  "lib/navigation/operator-home-era18.ts" as const;

export const OPERATOR_DEFAULT_LANDING_ERA18_POST_AUTH_MODULE =
  "lib/navigation/resolve-operator-post-auth-path.ts" as const;

export const OPERATOR_DEFAULT_LANDING_ERA18_PERSONA_LANDINGS = {
  cashier: "/dashboard/pos/terminal",
  kitchen: "/dashboard/kitchen",
  manager: "/dashboard/today",
  owner: "/dashboard/today",
} as const;

export const OPERATOR_DEFAULT_LANDING_ERA18_FORBIDDEN_CLAIMS = [
  "full square role navigation parity",
  "staff cannot reach operator home hub",
  "custom per-tenant landing overrides",
] as const;

export const OPERATOR_DEFAULT_LANDING_ERA18_UNIT_TESTS = [
  "tests/unit/operator-home-era18.test.ts",
] as const;

export const OPERATOR_DEFAULT_LANDING_ERA18_BACKLOG_ID = "KOS-E18-005" as const;
