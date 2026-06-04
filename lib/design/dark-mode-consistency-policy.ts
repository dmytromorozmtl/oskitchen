import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cn } from "@/lib/utils";

/**
 * DES-24 — dark mode consistency policy (theme-aware dashboard surfaces).
 *
 * @see docs/dark-mode-audit.md
 * @see app/globals.css (.dark legacy --color-* bridge)
 */

export const DARK_MODE_CONSISTENCY_POLICY_ID = "dark-mode-consistency-des24-v1" as const;

/** Root / sidebar / header chrome — responds to `.dark` via shadcn tokens. */
export const dashboardShellRootClass = cn("flex min-h-screen bg-background text-foreground");

export const dashboardShellSidebarClass = cn(
  "relative hidden w-64 shrink-0 border-r border-border/70 bg-background lg:flex lg:flex-col",
);

export const dashboardShellHeaderClass = cn(
  "sticky top-0 z-chrome flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
);

/** Theme-aware operator surfaces audited for zero `bg-white` (DES-24). */
export const DARK_MODE_CONSISTENCY_MODULES = [
  "components/dashboard/dashboard-shell.tsx",
  "app/onboarding/layout.tsx",
  "components/kitchen/kds-realtime-connection-bar.tsx",
  "components/dashboard/today-command-center.tsx",
  "components/dashboard/integration-health-strip.tsx",
] as const;

export const DARK_MODE_FORBIDDEN_LIGHT_ONLY_PATTERN = /\bbg-white\b/g;

export const DARK_MODE_TOKEN_PATTERN =
  /\bbg-background\b|\btext-foreground\b|\bdashboardShell(?:Root|Sidebar|Header)Class\b|dark:/g;

export type DarkModeConsistencyViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export type DarkModeModuleAudit = {
  module: (typeof DARK_MODE_CONSISTENCY_MODULES)[number];
  violations: DarkModeConsistencyViolation[];
  tokenReferences: number;
  passed: boolean;
};

export type DarkModeConsistencyReport = {
  policyId: typeof DARK_MODE_CONSISTENCY_POLICY_ID;
  modules: DarkModeModuleAudit[];
  legacyDarkBridgePresent: boolean;
  passed: boolean;
};

export function findDarkModeLightOnlyViolations(source: string): DarkModeConsistencyViolation[] {
  const violations: DarkModeConsistencyViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const matches = line.match(DARK_MODE_FORBIDDEN_LIGHT_ONLY_PATTERN);
    if (!matches) continue;
    for (const pattern of matches) {
      violations.push({ pattern, line: i + 1, excerpt: line.trim() });
    }
  }

  return violations;
}

export function auditDarkModeModule(
  modulePath: (typeof DARK_MODE_CONSISTENCY_MODULES)[number],
  root = process.cwd(),
): DarkModeModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findDarkModeLightOnlyViolations(source);
  const tokenReferences = (source.match(DARK_MODE_TOKEN_PATTERN) ?? []).length;

  return {
    module: modulePath,
    violations,
    tokenReferences,
    passed: violations.length === 0,
  };
}

export function hasLegacyDarkColorBridge(
  globalsCss = readFileSync(join(process.cwd(), "app/globals.css"), "utf8"),
): boolean {
  return (
    globalsCss.includes(".dark {") &&
    globalsCss.includes("--color-bg: var(--dark-bg)") &&
    globalsCss.includes("--color-text: var(--dark-text)")
  );
}

export function auditDarkModeConsistency(root = process.cwd()): DarkModeConsistencyReport {
  const modules = DARK_MODE_CONSISTENCY_MODULES.map((modulePath) =>
    auditDarkModeModule(modulePath, root),
  );
  const legacyDarkBridgePresent = hasLegacyDarkColorBridge(
    readFileSync(join(root, "app/globals.css"), "utf8"),
  );

  return {
    policyId: DARK_MODE_CONSISTENCY_POLICY_ID,
    modules,
    legacyDarkBridgePresent,
    passed: modules.every((m) => m.passed) && legacyDarkBridgePresent,
  };
}
