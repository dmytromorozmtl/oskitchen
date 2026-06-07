import { readFileSync } from "node:fs";
import { join } from "node:path";

import { findDarkModeLightOnlyViolations } from "@/lib/design/dark-mode-consistency-audit-policy";
import { OFFLINE_MODE_UI_INDICATOR_POLICY_ID } from "@/lib/pos/offline-mode-ui-indicator-policy";
import { SCHEDULE_GRID_DESIGN_POLICY_ID } from "@/lib/labor/schedule-grid-design-policy";
import { DATA_VIZ_STANDARDS_POLICY_ID } from "@/lib/analytics/data-viz-standards-policy";
import { MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_POLICY_ID } from "@/lib/design/mobile-first-redesign-absolute-final-policy";
import { MULTI_LOCATION_MAP_VIEW_POLICY_ID } from "@/lib/enterprise/multi-location-map-view-policy";

/**
 * Absolute Final Task 63 — dark mode audit for all new components (Tasks 56–62).
 */

export const NEW_COMPONENTS_DARK_MODE_AUDIT_POLICY_ID =
  "new-components-dark-mode-audit-absolute-final-v1" as const;

export const NEW_COMPONENTS_DARK_MODE_UPSTREAM_POLICY_IDS = [
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_POLICY_ID,
  DATA_VIZ_STANDARDS_POLICY_ID,
  MULTI_LOCATION_MAP_VIEW_POLICY_ID,
  SCHEDULE_GRID_DESIGN_POLICY_ID,
  OFFLINE_MODE_UI_INDICATOR_POLICY_ID,
] as const;

/** UI modules shipped in Absolute Final Tasks 56–62. */
export const NEW_COMPONENTS_DARK_MODE_MODULES = [
  "components/pos/pos-mobile-client.tsx",
  "components/kitchen/kds-daily-service.tsx",
  "lib/design/mobile-first-redesign-patterns.ts",
  "components/a11y/dashboard-skip-link.tsx",
  "components/analytics/waterfall-chart.tsx",
  "components/analytics/contribution-margin-chart.tsx",
  "lib/analytics/profit-dashboard-margin-visualization-policy.ts",
  "components/enterprise/multi-location-map-view.tsx",
  "components/dashboard/staff/schedule-grid-drag-drop.tsx",
  "lib/labor/schedule-grid-design-data.ts",
  "components/dashboard/offline-mode-ui-indicator.tsx",
  "components/dashboard/offline-sync-status-bar.tsx",
  "components/pwa/offline-indicator.tsx",
  "lib/pos/offline-mode-ui-indicator-data.ts",
] as const;

export const NEW_COMPONENTS_DARK_MODE_UNIT_TEST =
  "tests/unit/new-components-dark-mode-audit.test.ts" as const;

export const NEW_COMPONENTS_DARK_MODE_CI_SCRIPTS = [
  "test:ci:new-components-dark-mode-audit",
  "test:ci:new-components-dark-mode-audit:cert",
] as const;

const SURFACE_COLOR_PATTERN =
  /\bbg-(white|gray|slate|zinc|neutral|stone|red|amber|emerald|sky|violet|rose|orange|yellow|green|blue|purple|pink|indigo|cyan|lime|fuchsia)(-\d+)?\b|\btext-(black|gray|slate)-\d+\b|\bring-(amber|rose|violet)-\d+/;

const DARK_MODE_SIGNAL_PATTERN =
  /dark:|bg-background|text-foreground|bg-card|bg-muted|bg-primary|border-border|text-muted-foreground|chartAxisChrome|offlineMode(?:StatusBar|QueueBadge|SyncAnimation)Class|scheduleGrid(?:LaborHeat|Conflict|DropTarget)Class|PIN_STATUS_CLASS|marginBarClassForZone|dashboardChrome(?:Button|NavTrigger|ShortcutTile)Class|focus:bg-primary|offlineModeStatusBarToneClass/;

export type NewComponentsDarkModeViolation = {
  kind: "light-only" | "missing-dark-signal";
  line?: number;
  excerpt: string;
};

export type NewComponentsDarkModeModuleAudit = {
  module: (typeof NEW_COMPONENTS_DARK_MODE_MODULES)[number];
  violations: NewComponentsDarkModeViolation[];
  passed: boolean;
};

export type NewComponentsDarkModeReport = {
  policyId: typeof NEW_COMPONENTS_DARK_MODE_AUDIT_POLICY_ID;
  modules: NewComponentsDarkModeModuleAudit[];
  passed: boolean;
};

export function findNewComponentsDarkModeViolations(source: string): NewComponentsDarkModeViolation[] {
  const violations: NewComponentsDarkModeViolation[] = [];

  for (const lightOnly of findDarkModeLightOnlyViolations(source)) {
    violations.push({
      kind: "light-only",
      line: lightOnly.line,
      excerpt: lightOnly.excerpt,
    });
  }

  const needsDarkSignal = SURFACE_COLOR_PATTERN.test(source);
  if (needsDarkSignal && !DARK_MODE_SIGNAL_PATTERN.test(source)) {
    violations.push({
      kind: "missing-dark-signal",
      excerpt: "colored surfaces without dark: variant or shared theme-aware pattern",
    });
  }

  return violations;
}

export function auditNewComponentsDarkModeModule(
  modulePath: (typeof NEW_COMPONENTS_DARK_MODE_MODULES)[number],
  root = process.cwd(),
): NewComponentsDarkModeModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findNewComponentsDarkModeViolations(source);
  return {
    module: modulePath,
    violations,
    passed: violations.length === 0,
  };
}

export function auditNewComponentsDarkMode(root = process.cwd()): NewComponentsDarkModeReport {
  const modules = NEW_COMPONENTS_DARK_MODE_MODULES.map((modulePath) =>
    auditNewComponentsDarkModeModule(modulePath, root),
  );
  return {
    policyId: NEW_COMPONENTS_DARK_MODE_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
