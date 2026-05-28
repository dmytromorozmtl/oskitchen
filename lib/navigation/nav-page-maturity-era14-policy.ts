/**
 * Nav / page maturity Era 14 recert — Evolution Era 14 Cycle 1.
 *
 * Re-validates Era 4 page maturity sweep against focused sidebar nav: every
 * preview/placeholder nav link must have nav badges plus in-page honesty
 * (or an approved inline PlaceholderBanner exception).
 */

import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import {
  getNavMaturityExposure,
  type NavMaturityExposure,
} from "@/lib/navigation/nav-maturity-governance";
import { getPageMaturityHonesty } from "@/lib/navigation/page-maturity-honesty";
import { PAGE_MATURITY_INLINE_PLACEHOLDER_ROUTES } from "@/lib/navigation/page-maturity-sweep-policy";

export const NAV_PAGE_MATURITY_ERA14_POLICY_ID = "era14-nav-page-maturity-recert-v1" as const;

export const NAV_PAGE_MATURITY_ERA14_EXTENDS_POLICIES = [
  "era4-page-maturity-sweep-v1",
] as const;

/** Prefixes added in Era 14 gap closure (nav-visible preview without honesty). */
export const NAV_PAGE_MATURITY_ERA14_GAP_CLOSURE_PREFIXES = [
  "/dashboard/staff/payroll",
  "/dashboard/marketing/email-campaigns",
] as const;

export const NAV_PAGE_MATURITY_ERA14_CI_SCRIPTS = [
  "test:ci:nav-page-maturity-era14",
  "test:ci:nav-page-maturity-era14:cert",
] as const;

export const NAV_PAGE_MATURITY_ERA14_UNIT_TESTS = [
  "tests/unit/nav-page-maturity-era14-policy.test.ts",
  "tests/unit/nav-page-maturity-era14-cert-live.test.ts",
] as const;

export const NAV_PAGE_MATURITY_ERA14_CANONICAL_DOC_PATHS = [
  "docs/feature-maturity-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/implementation-backlog.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

function normalizeHref(href: string): string {
  return href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
}

function hrefMatchesPrefix(href: string, prefix: string): boolean {
  const h = normalizeHref(href);
  const p = normalizeHref(prefix);
  return h === p || h.startsWith(`${p}/`);
}

export function collectFocusedNavHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const group of FINAL_NAVIGATION_GROUPS) {
    for (const link of group.links) {
      hrefs.add(normalizeHref(link.href));
    }
  }
  return [...hrefs].sort();
}

export function hasInlinePlaceholderBannerException(href: string): boolean {
  return PAGE_MATURITY_INLINE_PLACEHOLDER_ROUTES.some((prefix) =>
    hrefMatchesPrefix(href, prefix),
  );
}

export function navHrefRequiresPageHonesty(exposure: NavMaturityExposure): boolean {
  return exposure === "preview" || exposure === "placeholder";
}

/**
 * Returns a gap message when a preview/placeholder nav href lacks in-page honesty.
 */
export function navPageMaturityHonestyGap(href: string): string | null {
  const exposure = getNavMaturityExposure(href);
  if (!navHrefRequiresPageHonesty(exposure)) return null;
  if (hasInlinePlaceholderBannerException(href)) return null;
  if (getPageMaturityHonesty(href)) return null;
  return `Nav link ${href} is ${exposure} but has no PageMaturityRouteNotice copy`;
}

export function findNavPageMaturityHonestyGaps(): string[] {
  return collectFocusedNavHrefs()
    .map((href) => navPageMaturityHonestyGap(href))
    .filter((gap): gap is string => gap !== null);
}
