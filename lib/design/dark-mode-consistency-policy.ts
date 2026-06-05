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
