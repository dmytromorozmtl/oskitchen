/**
 * Era 17 nav maturity sweep audit — focused nav + new preview route coverage.
 */

import {
  getNavMaturityExposure,
  getNavMaturityRule,
} from "@/lib/navigation/nav-maturity-governance";
import { findNavPageMaturityHonestyGaps } from "@/lib/navigation/nav-page-maturity-era14-policy";
import { getPageMaturityHonesty } from "@/lib/navigation/page-maturity-honesty";
import {
  hasInlineHonestyCopyException,
  hasInlinePlaceholderBannerException,
} from "@/lib/navigation/nav-page-maturity-era14-policy";
import { NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES } from "@/lib/navigation/nav-maturity-sweep-era17-policy";

export type NavMaturitySweepEra17AuditResult = {
  passed: boolean;
  focusedNavGaps: string[];
  era17RuleGaps: string[];
  era17HonestyGaps: string[];
};

export function findEra17NavMaturityRuleGaps(): string[] {
  const gaps: string[] = [];
  for (const prefix of NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES) {
    const rule = getNavMaturityRule(prefix);
    if (!rule) {
      gaps.push(`${prefix} missing NAV_MATURITY_RULES entry`);
      continue;
    }
    if (rule.exposure !== "preview") {
      gaps.push(`${prefix} must be preview exposure (got ${rule.exposure})`);
    }
  }
  return gaps;
}

export function findEra17NavMaturityHonestyGaps(): string[] {
  const gaps: string[] = [];
  for (const prefix of NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES) {
    if (hasInlinePlaceholderBannerException(prefix)) continue;
    if (hasInlineHonestyCopyException(prefix)) continue;
    if (getPageMaturityHonesty(prefix)) continue;
    gaps.push(`${prefix} preview route lacks PageMaturityRouteNotice copy`);
  }
  return gaps;
}

export function runNavMaturitySweepEra17Audit(): NavMaturitySweepEra17AuditResult {
  const focusedNavGaps = findNavPageMaturityHonestyGaps();
  const era17RuleGaps = findEra17NavMaturityRuleGaps();
  const era17HonestyGaps = findEra17NavMaturityHonestyGaps();

  return {
    passed:
      focusedNavGaps.length === 0 &&
      era17RuleGaps.length === 0 &&
      era17HonestyGaps.length === 0,
    focusedNavGaps,
    era17RuleGaps,
    era17HonestyGaps,
  };
}

export function summarizeNavMaturityExposureCounts(): Record<string, number> {
  const counts: Record<string, number> = {
    preview: 0,
    placeholder: 0,
    default: 0,
    hidden_default: 0,
    internal: 0,
  };

  for (const prefix of NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES) {
    const exposure = getNavMaturityExposure(prefix);
    counts[exposure] = (counts[exposure] ?? 0) + 1;
  }

  return counts;
}
