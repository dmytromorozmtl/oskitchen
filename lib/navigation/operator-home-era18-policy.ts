/**
 * Role-based operator home — Evolution Era 18 Workstream J Cycle 43.
 *
 * Focused dashboard entry for cashier/kitchen/manager personas.
 * Does NOT replace owner HomeOverview or claim full Square role-nav parity.
 */

export const OPERATOR_HOME_ERA18_POLICY_ID = "era18-operator-home-v1" as const;

export const OPERATOR_HOME_ERA18_DECISION_DATE = "2026-05-28" as const;

export const OPERATOR_HOME_ERA18_PROOF_STATUS = "operator_home_mvp_wired" as const;

export const OPERATOR_HOME_ERA18_RESOLVER_MODULE =
  "lib/navigation/operator-home-era18.ts" as const;

export const OPERATOR_HOME_ERA18_PANEL_MODULE =
  "components/dashboard/operator-home-panel.tsx" as const;

export const OPERATOR_HOME_ERA18_DASHBOARD_PAGE = "app/dashboard/page.tsx" as const;

export const OPERATOR_HOME_ERA18_PERSONAS = [
  "owner",
  "manager",
  "cashier",
  "kitchen",
] as const;

export const OPERATOR_HOME_ERA18_FORBIDDEN_CLAIMS = [
  "full square role navigation parity",
  "owner home replaced for all tenants",
  "custom per-tenant role dashboards",
] as const;

export const OPERATOR_HOME_ERA18_UNIT_TESTS = [
  "tests/unit/operator-home-era18.test.ts",
] as const;

export const OPERATOR_HOME_ERA18_BACKLOG_ID = "KOS-E18-003" as const;
