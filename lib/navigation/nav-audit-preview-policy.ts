import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import {
  isNavAuditSuppressedHref,
  NAV_AUDIT_SUPPRESSED_PREFIXES,
} from "@/lib/navigation/nav-audit-suppressed-prefixes";
import {
  getNavMaturityExposure,
  navMaturityBadgeForHref,
  shouldShowNavLinkByMaturity,
  type NavMaturityFilterContext,
} from "@/lib/navigation/nav-maturity-governance";

/**
 * P1-24 — nav audit: preview badges + suppress hardware / QR sprawl.
 *
 * @see docs/navigation-ia-audit.md
 * @see components/dashboard/dashboard-nav.tsx
 */

export const NAV_AUDIT_PREVIEW_POLICY_ID = "nav-audit-preview-p1-24-v1" as const;

export {
  isNavAuditSuppressedHref,
  NAV_AUDIT_SUPPRESSED_PREFIXES,
} from "@/lib/navigation/nav-audit-suppressed-prefixes";

/** Preview / placeholder / internal links that remain eligible for sidebar when expanded. */
export function listNavAuditPreviewSidebarLinks(): { href: string; exposure: string }[] {
  const ctx: NavMaturityFilterContext = {
    fullNavAccess: false,
    navScopeAll: true,
    gtmSurfaceAccess: false,
  };

  return FINAL_NAVIGATION_GROUPS.flatMap((group) =>
    group.links
      .filter((link) => shouldShowNavLinkByMaturity(link.href, ctx))
      .map((link) => ({ href: link.href, exposure: getNavMaturityExposure(link.href) }))
      .filter(
        (link) =>
          link.exposure === "preview" ||
          link.exposure === "placeholder" ||
          link.exposure === "internal",
      ),
  );
}

export type NavAuditPreviewBadgeCoverage = {
  policyId: typeof NAV_AUDIT_PREVIEW_POLICY_ID;
  previewSidebarLinkCount: number;
  labeledPreviewLinkCount: number;
  unlabeledPreviewHrefs: string[];
  suppressedPrefixCount: number;
  suppressedHiddenInExpandedNav: boolean;
  passed: boolean;
};

export function auditNavPreviewBadgeCoverage(): NavAuditPreviewBadgeCoverage {
  const previewLinks = listNavAuditPreviewSidebarLinks();
  const unlabeledPreviewHrefs: string[] = [];

  for (const link of previewLinks) {
    if (!navMaturityBadgeForHref(link.href)) {
      unlabeledPreviewHrefs.push(link.href);
    }
  }

  const expandedCtx: NavMaturityFilterContext = {
    fullNavAccess: false,
    navScopeAll: true,
    gtmSurfaceAccess: false,
  };
  const expandedHrefs = FINAL_NAVIGATION_GROUPS.flatMap((g) =>
    g.links.filter((l) => shouldShowNavLinkByMaturity(l.href, expandedCtx)).map((l) => l.href),
  );

  const suppressedHiddenInExpandedNav = NAV_AUDIT_SUPPRESSED_PREFIXES.every(
    (prefix) => !expandedHrefs.includes(prefix),
  );

  return {
    policyId: NAV_AUDIT_PREVIEW_POLICY_ID,
    previewSidebarLinkCount: previewLinks.length,
    labeledPreviewLinkCount: previewLinks.length - unlabeledPreviewHrefs.length,
    unlabeledPreviewHrefs,
    suppressedPrefixCount: NAV_AUDIT_SUPPRESSED_PREFIXES.length,
    suppressedHiddenInExpandedNav,
    passed:
      previewLinks.length > 0 &&
      unlabeledPreviewHrefs.length === 0 &&
      suppressedHiddenInExpandedNav,
  };
}

export const NAV_AUDIT_PREVIEW_CI_SCRIPTS = ["test:ci:nav-audit-preview"] as const;

export const NAV_AUDIT_PREVIEW_UI_MODULES = [
  "components/dashboard/dashboard-nav.tsx",
  "components/ui/badge.tsx",
  "components/ui/beta-badge.tsx",
] as const;

export function isNavAuditSuppressedRoute(href: string): boolean {
  return isNavAuditSuppressedHref(href);
}
