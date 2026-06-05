import {
  DARK_MODE_CONSISTENCY_MODULES,
  DARK_MODE_CONSISTENCY_POLICY_ID,
} from "@/lib/design/dark-mode-consistency-policy";

/**
 * DES-26 — dark mode everywhere (all operator roles + leadership surfaces).
 *
 * Extends DES-24 shell audit to role UIs, command center, and analytics/export pages.
 *
 * @see lib/design/dark-mode-everywhere-patterns.ts
 * @see lib/design/dark-mode-everywhere-audit-policy.ts
 */

export const DARK_MODE_EVERYWHERE_POLICY_ID = "dark-mode-everywhere-des26-v1" as const;

export const DARK_MODE_EVERYWHERE_EXTENDS = DARK_MODE_CONSISTENCY_POLICY_ID;

export const DARK_MODE_EVERYWHERE_PATTERN_IMPORT =
  "@/lib/design/dark-mode-everywhere-patterns" as const;

/** Operator surfaces that must render without hardcoded light-only chrome. */
export const DARK_MODE_EVERYWHERE_ROLE_MODULES = [
  "app/dashboard/roles/layout.tsx",
  "app/dashboard/roles/owner/page.tsx",
  "app/dashboard/roles/manager/page.tsx",
  "app/dashboard/roles/chef/page.tsx",
  "app/dashboard/roles/cashier/page.tsx",
  "app/dashboard/roles/driver/page.tsx",
  "components/roles/owner-role-panel.tsx",
  "components/roles/manager-role-panel.tsx",
  "components/roles/chef-role-panel.tsx",
  "components/roles/cashier-role-panel.tsx",
  "components/roles/driver-role-panel.tsx",
  "components/dashboard/roles-subnav.tsx",
] as const;

export const DARK_MODE_EVERYWHERE_LEADERSHIP_MODULES = [
  "components/command-center/command-center-panel.tsx",
  "app/dashboard/command-center/page.tsx",
  "app/dashboard/analytics/suite/page.tsx",
  "app/dashboard/data/export/page.tsx",
] as const;

export const DARK_MODE_EVERYWHERE_MODULES = [
  ...DARK_MODE_CONSISTENCY_MODULES,
  ...DARK_MODE_EVERYWHERE_ROLE_MODULES,
  ...DARK_MODE_EVERYWHERE_LEADERSHIP_MODULES,
] as const;

export const DARK_MODE_EVERYWHERE_ROLE_COUNT = DARK_MODE_EVERYWHERE_ROLE_MODULES.length;
