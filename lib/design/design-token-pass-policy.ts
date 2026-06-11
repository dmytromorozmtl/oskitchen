/**
 * Blueprint P1-63 — Design token pass (85%→95%): colors, spacing, unified typography.
 *
 * @see lib/design/color-token-audit-policy.ts
 * @see lib/design/color-tokens.ts
 * @see app/globals.css
 */

import { cn } from "@/lib/utils";

export const DESIGN_TOKEN_PASS_POLICY_ID = "design-token-pass-p1-63-v1" as const;

export const DESIGN_TOKEN_PASS_BASELINE_PERCENT = 85 as const;

export const DESIGN_TOKEN_PASS_TARGET_PERCENT = 95 as const;

/** Unified caption — replaces text-[10px] / text-[11px] in dashboard chrome. */
export const DESIGN_TOKEN_CAPTION_CLASS = cn("text-xs leading-snug text-muted-foreground");

export const DESIGN_TOKEN_MICRO_LABEL_CLASS = cn(
  "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
);

export const DESIGN_TOKEN_BADGE_CAPTION_CLASS = cn(
  "text-xs uppercase tracking-wide",
);

export const DESIGN_TOKEN_NAV_ACTION_CLASS = cn(
  "text-xs font-medium text-muted-foreground",
);

export const DESIGN_TOKEN_NAV_LINK_ACTION_CLASS = cn(
  "text-xs font-medium normal-case tracking-normal text-primary",
);

export const DESIGN_TOKEN_SECTION_GAP_CLASS = "space-y-4" as const;

export const DESIGN_TOKEN_INLINE_GAP_CLASS = "gap-2" as const;

export const DESIGN_TOKEN_PAGE_SHELL_PADDING_CLASS = "mx-auto w-full px-0" as const;

export const DESIGN_TOKEN_PASS_MODULES = [
  "components/dashboard/dashboard-nav.tsx",
  "components/layout/page-shell.tsx",
  "components/feedback/error-state.tsx",
  "components/ui/permission-denied-card.tsx",
  "components/dashboard/overview-charts.tsx",
] as const;

export type DesignTokenPassModule = (typeof DESIGN_TOKEN_PASS_MODULES)[number];

export const DESIGN_TOKEN_PASS_AUDIT_SCRIPT = "scripts/audit-design-token-pass.ts" as const;

export const DESIGN_TOKEN_PASS_NPM_SCRIPT = "audit:design-token-pass" as const;

export const DESIGN_TOKEN_PASS_UNIT_TEST = "tests/unit/design-token-pass.test.ts" as const;

export const DESIGN_TOKEN_PASS_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const DESIGN_TOKEN_ARBITRARY_TEXT_PATTERN = /text-\[\d+px\]/g;

export const DESIGN_TOKEN_ARBITRARY_SPACING_PATTERN = /(?:gap|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-\[\d+px\]/g;
