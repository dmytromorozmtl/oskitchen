import { getFilteredNavGroups } from "@/lib/business-modes";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import {
  filterNavGroupsByMaturityGovernance,
  getNavMaturityExposure,
  getNavMaturityRule,
  shouldShowNavLinkByMaturity,
  type NavMaturityFilterContext,
} from "@/lib/navigation/nav-maturity-governance";

/**
 * DES-11 — preview route hiding confirmation policy.
 *
 * Certifies preview/placeholder sidebar links are hidden in focused nav and
 * defines operator copy before revealing advanced modules.
 *
 * @see docs/navigation-ia-audit.md
 * @see components/dashboard/preview-route-hiding-confirmation-dialog.tsx
 */

export const PREVIEW_ROUTE_HIDING_CONFIRMATION_POLICY_ID =
  "preview-route-hiding-confirmation-des11-v1" as const;

export const PREVIEW_REVEAL_DIALOG_TITLE = "Show preview modules?" as const;

export const PREVIEW_REVEAL_DIALOG_BODY =
  "Advanced navigation includes Preview and BETA modules that are not certified for daily operations or customer demos. Each preview page shows an honesty banner — do not sell these surfaces without qualification." as const;

export const PREVIEW_REVEAL_CONFIRM_LABEL = "Show preview modules" as const;

export const PREVIEW_REVEAL_CANCEL_LABEL = "Keep focused nav" as const;

export const PREVIEW_MODULES_VISIBLE_BANNER =
  "Preview modules visible in sidebar — not certified for sales demos. Switch back to focused nav for pilot walkthroughs." as const;

const FOCUSED_NAV_CTX: NavMaturityFilterContext = {
  fullNavAccess: false,
  navScopeAll: false,
  gtmSurfaceAccess: false,
};

const EXPANDED_NAV_CTX: NavMaturityFilterContext = {
  fullNavAccess: false,
  navScopeAll: true,
  gtmSurfaceAccess: false,
};

export type PreviewSidebarLink = {
  href: string;
  exposure: ReturnType<typeof getNavMaturityExposure>;
  matrixRef: string;
};

/** Sidebar links classified as preview or placeholder in nav maturity rules. */
export function listPreviewSidebarLinks(): PreviewSidebarLink[] {
  const hrefs = FINAL_NAVIGATION_GROUPS.flatMap((g) => g.links.map((l) => l.href));
  const out: PreviewSidebarLink[] = [];

  for (const href of hrefs) {
    const exposure = getNavMaturityExposure(href);
    if (exposure !== "preview" && exposure !== "placeholder") continue;
    const rule = getNavMaturityRule(href);
    out.push({
      href,
      exposure,
      matrixRef: rule?.matrixRef ?? href,
    });
  }

  return out.sort((a, b) => a.href.localeCompare(b.href));
}

export type PreviewRouteHidingAudit = {
  previewSidebarLinkCount: number;
  hiddenInFocusedNav: number;
  visibleWhenExpanded: number;
  passed: boolean;
  gaps: string[];
};

export function auditPreviewRoutesHiddenInFocusedNav(): PreviewRouteHidingAudit {
  const previewLinks = listPreviewSidebarLinks();
  const gaps: string[] = [];

  for (const link of previewLinks) {
    const hidden = !shouldShowNavLinkByMaturity(link.href, FOCUSED_NAV_CTX);
    if (!hidden) {
      gaps.push(`${link.href} (${link.exposure}) visible in focused nav`);
    }
  }

  const focusedHrefs = filterNavGroupsByMaturityGovernance(FINAL_NAVIGATION_GROUPS, FOCUSED_NAV_CTX)
    .flatMap((g) => g.links.map((l) => l.href));
  const expandedHrefs = filterNavGroupsByMaturityGovernance(FINAL_NAVIGATION_GROUPS, EXPANDED_NAV_CTX)
    .flatMap((g) => g.links.map((l) => l.href));

  let visibleWhenExpanded = 0;
  for (const link of previewLinks) {
    if (expandedHrefs.includes(link.href)) visibleWhenExpanded += 1;
  }

  return {
    previewSidebarLinkCount: previewLinks.length,
    hiddenInFocusedNav: previewLinks.length - gaps.length,
    visibleWhenExpanded,
    passed: gaps.length === 0 && previewLinks.length > 0,
    gaps,
  };
}

/** Full nav stack audit — business mode + maturity governance in focused mode. */
export function auditPreviewRoutesHiddenInFilteredNav(): PreviewRouteHidingAudit {
  const previewLinks = listPreviewSidebarLinks();
  const gaps: string[] = [];

  const focused = getFilteredNavGroups({
    businessType: "RESTAURANT",
    navScopeAll: false,
    fullNavAccess: false,
    isOwner: true,
    userRole: "OWNER",
  });
  const focusedHrefs = new Set(focused.flatMap((g) => g.links.map((l) => l.href)));

  for (const link of previewLinks) {
    if (focusedHrefs.has(link.href)) {
      gaps.push(`${link.href} (${link.exposure}) visible in owner focused nav`);
    }
  }

  const expanded = getFilteredNavGroups({
    businessType: "RESTAURANT",
    navScopeAll: true,
    fullNavAccess: false,
    isOwner: true,
    userRole: "OWNER",
  });
  const expandedHrefs = new Set(expanded.flatMap((g) => g.links.map((l) => l.href)));

  let visibleWhenExpanded = 0;
  for (const link of previewLinks) {
    if (expandedHrefs.has(link.href)) visibleWhenExpanded += 1;
  }

  return {
    previewSidebarLinkCount: previewLinks.length,
    hiddenInFocusedNav: previewLinks.length - gaps.length,
    visibleWhenExpanded,
    passed: gaps.length === 0 && previewLinks.length > 0,
    gaps,
  };
}
