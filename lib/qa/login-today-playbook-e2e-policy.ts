/**
 * Blueprint P1-41 — Login → Today → Playbook E2E (full authenticated flow).
 *
 * @see e2e/login-today-playbook.spec.ts
 * @see app/dashboard/today/page.tsx
 * @see app/dashboard/playbooks/page.tsx
 */

export const LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID = "login-today-playbook-e2e-v1" as const;

export const LOGIN_PATH = "/login" as const;
export const TODAY_PATH = "/dashboard/today" as const;
export const PLAYBOOKS_PATH = "/dashboard/playbooks" as const;

export const DASHBOARD_POST_LOGIN_PATTERN = /\/dashboard/;

export const TODAY_HEADING_PATTERN = /^Today$|^Today in /i;
export const PLAYBOOKS_HEADING_PATTERN = /^Operations Playbooks$/i;

export const PLAYBOOK_TODAY_STRIP_TITLE = "Operations Playbooks" as const;
export const PLAYBOOK_TODAY_ALL_LINK_LABEL = /all playbooks/i;

export const LOGIN_TODAY_PLAYBOOK_E2E_SPEC = "e2e/login-today-playbook.spec.ts" as const;
export const LOGIN_TODAY_PLAYBOOK_FLOW_HELPER =
  "e2e/helpers/login-today-playbook-flow.ts" as const;
export const LOGIN_TODAY_PLAYBOOK_READY_HELPER =
  "e2e/helpers/login-today-playbook-ready.ts" as const;
export const LOGIN_TODAY_PLAYBOOK_AUDIT_SCRIPT =
  "scripts/audit-login-today-playbook-e2e.ts" as const;
export const LOGIN_TODAY_PLAYBOOK_NPM_SCRIPT = "audit:login-today-playbook-e2e" as const;
export const LOGIN_TODAY_PLAYBOOK_UNIT_TEST =
  "tests/unit/login-today-playbook-e2e.test.ts" as const;
export const LOGIN_TODAY_PLAYBOOK_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const LOGIN_TODAY_PLAYBOOK_VISIBLE_MS = 30_000 as const;

export const LOGIN_TODAY_PLAYBOOK_FLOW_STEPS = [
  "login",
  "today",
  "playbook_navigation",
  "playbooks_hub",
] as const;

export type LoginTodayPlaybookFlowStep = (typeof LOGIN_TODAY_PLAYBOOK_FLOW_STEPS)[number];

export type LoginTodayPlaybookNavigationSurface = "playbook_strip_link" | "direct_path";

export function isAllowedPlaybookDestinationHref(href: string): boolean {
  const trimmed = href.trim();
  return trimmed === PLAYBOOKS_PATH || trimmed.startsWith(`${PLAYBOOKS_PATH}/`);
}

export function hasLoginTodayPlaybookCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}
