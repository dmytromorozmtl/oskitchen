/**
 * Blueprint P1-56 — Nav audit preview labels (Badge variant preview / beta).
 *
 * @see lib/navigation/nav-audit-preview-policy.ts
 * @see components/ui/badge.tsx
 * @see components/ui/beta-badge.tsx
 */

import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import {
  getNavMaturityRule,
  shouldShowNavLinkByMaturity,
  type NavMaturityFilterContext,
} from "@/lib/navigation/nav-maturity-governance";

export const NAV_AUDIT_PREVIEW_LABELS_POLICY_ID =
  "nav-audit-preview-labels-p1-56-v1" as const;

export const NAV_AUDIT_PREVIEW_LABELS_MIN_BETA_LINKS = 2 as const;

export const NAV_AUDIT_PREVIEW_LABELS_UI_MODULES = [
  "components/ui/badge.tsx",
  "components/ui/beta-badge.tsx",
  "components/dashboard/dashboard-nav.tsx",
  "components/dashboard/command-palette.tsx",
] as const;

export const NAV_AUDIT_PREVIEW_LABELS_AUDIT_SCRIPT =
  "scripts/audit-nav-audit-preview-labels.ts" as const;

export const NAV_AUDIT_PREVIEW_LABELS_NPM_SCRIPT =
  "audit:nav-audit-preview-labels" as const;

export const NAV_AUDIT_PREVIEW_LABELS_UNIT_TEST =
  "tests/unit/nav-audit-preview-labels.test.ts" as const;

export const NAV_AUDIT_PREVIEW_LABELS_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

const EXPANDED_NAV_CTX: NavMaturityFilterContext = {
  fullNavAccess: false,
  navScopeAll: true,
  gtmSurfaceAccess: false,
};

/** Integration preview links whose matrix ref marks BETA maturity. */
export function listNavAuditBetaSidebarLinks(): { href: string; matrixRef: string }[] {
  return FINAL_NAVIGATION_GROUPS.flatMap((group) =>
    group.links
      .filter((link) => shouldShowNavLinkByMaturity(link.href, EXPANDED_NAV_CTX))
      .map((link) => {
        const rule = getNavMaturityRule(link.href);
        if (!rule || rule.exposure !== "preview" || !/BETA/i.test(rule.matrixRef)) {
          return null;
        }
        return { href: link.href, matrixRef: rule.matrixRef };
      })
      .filter((link): link is { href: string; matrixRef: string } => link !== null),
  );
}

export const NAV_AUDIT_PREVIEW_BADGE_VARIANT = "preview" as const;
export const NAV_AUDIT_BETA_BADGE_VARIANT = "beta" as const;
