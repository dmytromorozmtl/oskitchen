/**
 * Blueprint P1-64 — Mobile Today scroll (5+ playbooks, no horizontal scroll, sticky header).
 *
 * @see app/dashboard/today/page.tsx
 * @see components/dashboard/playbooks/playbook-today-strip.tsx
 * @see components/dashboard/today-command-center.tsx
 */

import { cn } from "@/lib/utils";

export const MOBILE_TODAY_SCROLL_POLICY_ID = "mobile-today-scroll-p1-64-v1" as const;

export const MOBILE_TODAY_MIN_PLAYBOOK_COUNT = 5 as const;

export const MOBILE_TODAY_RECOMMENDED_FETCH_LIMIT = 6 as const;

export const MOBILE_TODAY_PAGE_MODULE = "app/dashboard/today/page.tsx" as const;

export const MOBILE_TODAY_PLAYBOOK_STRIP_MODULE =
  "components/dashboard/playbooks/playbook-today-strip.tsx" as const;

export const MOBILE_TODAY_COMMAND_CENTER_MODULE =
  "components/dashboard/today-command-center.tsx" as const;

/** Page shell — clip horizontal overflow on narrow viewports. */
export const MOBILE_TODAY_PAGE_CLASS = "overflow-x-hidden" as const;

/** Vertical scroll body — stacked sections, no horizontal carousel. */
export const MOBILE_TODAY_SCROLL_BODY_CLASS = "space-y-6 overflow-x-hidden" as const;

/** Sticky Today header — stays visible while scrolling playbooks and metrics. */
export const MOBILE_TODAY_STICKY_HEADER_CLASS = cn(
  "sticky top-0 z-20 -mx-4 border-b border-border/60 bg-background/95 px-4 py-3",
  "backdrop-blur supports-[backdrop-filter]:bg-background/80",
  "sm:mx-0 sm:px-0",
);

/** Vertical playbook grid — 5+ cards on mobile without horizontal scroll. */
export const MOBILE_TODAY_PLAYBOOK_GRID_CLASS = cn(
  "grid grid-cols-1 gap-3 overflow-x-hidden sm:grid-cols-2",
);

export const MOBILE_TODAY_PLAYBOOK_CARD_CLASS = cn(
  "rounded-lg border border-border/80 bg-card p-3 shadow-sm",
);

export const MOBILE_TODAY_PLAYBOOK_GRID_TEST_ID = "today-playbook-grid" as const;

export const MOBILE_TODAY_STICKY_HEADER_TEST_ID = "today-sticky-header" as const;

export const MOBILE_TODAY_SCROLL_AUDIT_SCRIPT =
  "scripts/audit-mobile-today-scroll.ts" as const;

export const MOBILE_TODAY_SCROLL_NPM_SCRIPT = "audit:mobile-today-scroll" as const;

export const MOBILE_TODAY_SCROLL_UNIT_TEST =
  "tests/unit/mobile-today-scroll.test.ts" as const;

export const MOBILE_TODAY_SCROLL_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;
