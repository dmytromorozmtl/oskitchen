import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LEGACY_ONBOARDING_ENTRIES,
  ONBOARDING_HUB_PATH,
  SINGLE_ONBOARDING_ENTRY_LEGACY_HREFS,
  SINGLE_ONBOARDING_ENTRY_MODULE,
  SINGLE_ONBOARDING_ENTRY_PAGE,
  SINGLE_ONBOARDING_ENTRY_POLICY_ID,
} from "@/lib/design/single-onboarding-entry-policy";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import {
  getNavMaturityExposure,
  shouldShowNavLinkByMaturity,
} from "@/lib/navigation/nav-maturity-governance";
import { PILOT_TIER_NAV_HREFS } from "@/lib/navigation/navigation-release-profile-policy";

export type SingleOnboardingEntryAuditSummary = {
  policyId: typeof SINGLE_ONBOARDING_ENTRY_POLICY_ID;
  hubPagePresent: boolean;
  hubViewPresent: boolean;
  hubInFocusedNav: boolean;
  legacyEntryCount: number;
  legacyHiddenFromFocusedNav: number;
  pilotNavUsesHub: boolean;
  hubLinksAllLegacyEntries: boolean;
  passed: boolean;
};

const FOCUSED_NAV_CTX = {
  fullNavAccess: false,
  navScopeAll: false,
  gtmSurfaceAccess: false,
} as const;

export function auditSingleOnboardingEntry(
  root = process.cwd(),
): SingleOnboardingEntryAuditSummary {
  const hubPagePresent = existsSync(join(root, SINGLE_ONBOARDING_ENTRY_PAGE));
  const hubViewPresent = existsSync(join(root, SINGLE_ONBOARDING_ENTRY_MODULE));

  const focusedHrefs = FINAL_NAVIGATION_GROUPS.flatMap((group) =>
    group.links
      .filter((link) => shouldShowNavLinkByMaturity(link.href, FOCUSED_NAV_CTX))
      .map((link) => link.href),
  );

  const hubInFocusedNav = focusedHrefs.includes(ONBOARDING_HUB_PATH);

  let legacyHiddenFromFocusedNav = 0;
  for (const href of SINGLE_ONBOARDING_ENTRY_LEGACY_HREFS) {
    const exposure = getNavMaturityExposure(href);
    const visible = shouldShowNavLinkByMaturity(href, FOCUSED_NAV_CTX);
    if (exposure !== "default" || !visible) {
      legacyHiddenFromFocusedNav += 1;
    }
  }

  let hubLinksAllLegacyEntries = false;
  if (hubViewPresent) {
    const source = readFileSync(join(root, SINGLE_ONBOARDING_ENTRY_MODULE), "utf8");
    hubLinksAllLegacyEntries =
      source.includes("LEGACY_ONBOARDING_ENTRIES") &&
      source.includes("entry.href") &&
      LEGACY_ONBOARDING_ENTRIES.length === 4;
  }

  const pilotNavUsesHub = (PILOT_TIER_NAV_HREFS as readonly string[]).includes(
    ONBOARDING_HUB_PATH,
  );

  const passed =
    hubPagePresent &&
    hubViewPresent &&
    hubInFocusedNav &&
    LEGACY_ONBOARDING_ENTRIES.length === 4 &&
    legacyHiddenFromFocusedNav === SINGLE_ONBOARDING_ENTRY_LEGACY_HREFS.length &&
    pilotNavUsesHub &&
    hubLinksAllLegacyEntries;

  return {
    policyId: SINGLE_ONBOARDING_ENTRY_POLICY_ID,
    hubPagePresent,
    hubViewPresent,
    hubInFocusedNav,
    legacyEntryCount: LEGACY_ONBOARDING_ENTRIES.length,
    legacyHiddenFromFocusedNav,
    pilotNavUsesHub,
    hubLinksAllLegacyEntries,
    passed,
  };
}

export function formatSingleOnboardingEntryAuditLines(
  summary: SingleOnboardingEntryAuditSummary,
): string[] {
  return [
    `Single onboarding entry audit (${summary.policyId})`,
    `Onboarding Hub page: ${summary.hubPagePresent ? "present" : "missing"} (${ONBOARDING_HUB_PATH})`,
    `Hub view component: ${summary.hubViewPresent ? "present" : "missing"}`,
    `Hub in focused nav: ${summary.hubInFocusedNav ? "yes" : "no"}`,
    `Legacy entries consolidated: ${summary.legacyEntryCount}`,
    `Legacy hidden from focused nav: ${summary.legacyHiddenFromFocusedNav}/${summary.legacyEntryCount}`,
    `Pilot nav uses hub: ${summary.pilotNavUsesHub ? "yes" : "no"}`,
    `Hub links all legacy paths: ${summary.hubLinksAllLegacyEntries ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
