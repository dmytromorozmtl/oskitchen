/**
 * Blueprint P1-69 — BETA / preview badge system (BETA amber, COMING SOON gray, NEW teal).
 *
 * @see components/ui/badge.tsx
 * @see components/ui/beta-badge.tsx
 */

import { cn } from "@/lib/utils";
import { DESIGN_TOKEN_BADGE_CAPTION_CLASS } from "@/lib/design/design-token-pass-policy";

export const BETA_PREVIEW_BADGE_SYSTEM_POLICY_ID =
  "beta-preview-badge-system-p1-69-v1" as const;

export const BETA_BADGE_LABEL = "BETA" as const;

export const COMING_SOON_BADGE_LABEL = "Coming soon" as const;

export const NEW_BADGE_LABEL = "NEW" as const;

export const BETA_BADGE_VARIANT = "beta" as const;

export const COMING_SOON_BADGE_VARIANT = "comingSoon" as const;

export const NEW_BADGE_VARIANT = "new" as const;

/** Shared nav / module maturity badge sizing. */
export const MATURITY_BADGE_BASE_CLASS = cn(
  "rounded-full px-1.5 py-0 font-semibold uppercase tracking-wide",
  DESIGN_TOKEN_BADGE_CAPTION_CLASS,
);

/** Amber — partner-gated integrations and surfaces. */
export const BETA_BADGE_COLOR_TOKEN = "amber-500" as const;

/** Gray — not yet available; visible in expanded nav only. */
export const COMING_SOON_BADGE_COLOR_TOKEN = "muted-foreground" as const;

/** Teal — recently shipped modules. */
export const NEW_BADGE_COLOR_TOKEN = "teal-500" as const;

export const BETA_PREVIEW_BADGE_SYSTEM_UI_MODULES = [
  "components/ui/badge.tsx",
  "components/ui/beta-badge.tsx",
] as const;

export const BETA_PREVIEW_BADGE_SYSTEM_REQUIRED_BADGES = [
  "BetaBadge",
  "ComingSoonBadge",
  "NewBadge",
] as const;

export const BETA_PREVIEW_BADGE_SYSTEM_AUDIT_SCRIPT =
  "scripts/audit-beta-preview-badge-system.ts" as const;

export const BETA_PREVIEW_BADGE_SYSTEM_NPM_SCRIPT =
  "audit:beta-preview-badge-system" as const;

export const BETA_PREVIEW_BADGE_SYSTEM_UNIT_TEST =
  "tests/unit/beta-preview-badge-system.test.ts" as const;

export const BETA_PREVIEW_BADGE_SYSTEM_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const BETA_BADGE_DEFAULT_TITLE =
  "BETA — partner credentials and staging smoke required before LIVE claim" as const;

export const COMING_SOON_BADGE_DEFAULT_TITLE =
  "Coming soon — visible in expanded nav; not production-ready yet" as const;

export const NEW_BADGE_DEFAULT_TITLE =
  "NEW — recently shipped; feedback welcome while we harden the workflow" as const;
