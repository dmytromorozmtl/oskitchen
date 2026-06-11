/**
 * Blueprint P1-66 — Command Center brand alignment with Today page.
 *
 * @see app/dashboard/command-center/page.tsx
 * @see components/command-center/command-center-panel.tsx
 * @see components/dashboard/today-command-center.tsx
 */

import { cn } from "@/lib/utils";
import {
  DESIGN_TOKEN_CAPTION_CLASS,
  DESIGN_TOKEN_MICRO_LABEL_CLASS,
  DESIGN_TOKEN_SECTION_GAP_CLASS,
} from "@/lib/design/design-token-pass-policy";
import {
  MOBILE_TODAY_STICKY_HEADER_CLASS,
  MOBILE_TODAY_STICKY_HEADER_TEST_ID,
} from "@/lib/design/mobile-today-scroll-policy";

export const COMMAND_CENTER_BRAND_POLICY_ID = "command-center-brand-p1-66-v1" as const;

export const COMMAND_CENTER_BRAND_PAGE_MODULE = "app/dashboard/command-center/page.tsx" as const;

export const COMMAND_CENTER_BRAND_PANEL_MODULE =
  "components/command-center/command-center-panel.tsx" as const;

export const COMMAND_CENTER_BRAND_REFERENCE_MODULE =
  "components/dashboard/today-command-center.tsx" as const;

/** Page shell — same max width and vertical rhythm as Today. */
export const COMMAND_CENTER_BRAND_PAGE_SHELL_CLASS = cn(
  "mx-auto max-w-7xl space-y-8 pb-8",
);

/** Sticky header — shared with Today command center. */
export const COMMAND_CENTER_BRAND_STICKY_HEADER_CLASS = MOBILE_TODAY_STICKY_HEADER_CLASS;

export const COMMAND_CENTER_BRAND_STICKY_HEADER_TEST_ID = MOBILE_TODAY_STICKY_HEADER_TEST_ID;

export const COMMAND_CENTER_BRAND_PAGE_TITLE_CLASS = "text-3xl font-semibold tracking-tight" as const;

export const COMMAND_CENTER_BRAND_PAGE_DESC_CLASS =
  "mt-2 max-w-2xl text-muted-foreground" as const;

/** Primary panel surface — Card tokens instead of terminal chrome. */
export const COMMAND_CENTER_BRAND_PANEL_CLASS = cn(
  "rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-6",
  DESIGN_TOKEN_SECTION_GAP_CLASS,
);

export const COMMAND_CENTER_BRAND_PANEL_TEST_ID = "command-center-panel" as const;

export const COMMAND_CENTER_BRAND_LANE_TITLE_CLASS = DESIGN_TOKEN_MICRO_LABEL_CLASS;

export const COMMAND_CENTER_BRAND_TICKER_CELL_CLASS = cn(
  "min-w-[140px] flex-1 rounded-xl border border-border/70 bg-background/80 px-3 py-2",
  "transition-colors hover:bg-muted/50",
);

export const COMMAND_CENTER_BRAND_TICKER_SYMBOL_CLASS = DESIGN_TOKEN_CAPTION_CLASS;

export const COMMAND_CENTER_BRAND_TICKER_VALUE_CLASS =
  "mt-1 truncate text-sm font-semibold tabular-nums" as const;

export const COMMAND_CENTER_BRAND_TICKER_LABEL_CLASS = DESIGN_TOKEN_CAPTION_CLASS;

export const COMMAND_CENTER_BRAND_ALERT_POSITIVE_CLASS = "text-emerald-700 dark:text-emerald-400";

export const COMMAND_CENTER_BRAND_ALERT_NEGATIVE_CLASS = "text-red-700 dark:text-red-400";

export const COMMAND_CENTER_BRAND_ALERT_WARNING_CLASS = "text-amber-700 dark:text-amber-400";

export const COMMAND_CENTER_BRAND_ALERT_NEUTRAL_CLASS = "text-foreground";

export const COMMAND_CENTER_BRAND_ALERT_ROW_CRITICAL_CLASS = cn(
  "rounded-xl border border-red-200/70 bg-red-50/30 px-3 py-2 dark:border-red-900/40 dark:bg-red-950/20",
);

export const COMMAND_CENTER_BRAND_ALERT_ROW_WARNING_CLASS = cn(
  "rounded-xl border border-amber-200/70 bg-amber-50/30 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/20",
);

export const COMMAND_CENTER_BRAND_ALERT_ROW_NEUTRAL_CLASS = cn(
  "rounded-xl border border-border/70 bg-background/80 px-3 py-2",
);

export const COMMAND_CENTER_BRAND_FOOTER_LINK_CLASS = cn(
  "text-xs font-medium text-primary hover:underline",
);

export const COMMAND_CENTER_BRAND_FORBIDDEN_CLASSES = [
  "bg-slate-950",
  "border-slate-800",
  "font-mono text-slate-200",
] as const;

export const COMMAND_CENTER_BRAND_AUDIT_SCRIPT =
  "scripts/audit-command-center-brand.ts" as const;

export const COMMAND_CENTER_BRAND_NPM_SCRIPT = "audit:command-center-brand" as const;

export const COMMAND_CENTER_BRAND_UNIT_TEST = "tests/unit/command-center-brand.test.ts" as const;

export const COMMAND_CENTER_BRAND_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;
