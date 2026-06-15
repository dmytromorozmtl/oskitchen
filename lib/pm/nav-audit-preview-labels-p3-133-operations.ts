import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditNavAuditPreviewLabels } from "@/lib/design/nav-audit-preview-labels-audit";
import { listNavAuditBetaSidebarLinks } from "@/lib/design/nav-audit-preview-labels-policy";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import { auditNavPreviewBadgeCoverage } from "@/lib/navigation/nav-audit-preview-policy";
import {
  getNavMaturityExposure,
  shouldShowNavLinkByMaturity,
  type NavMaturityFilterContext,
} from "@/lib/navigation/nav-maturity-governance";
import {
  NAV_AUDIT_PREVIEW_LABELS_PM_IMPLEMENTATION_REFS,
  NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID,
  NAV_AUDIT_PREVIEW_LABELS_PM_TARGET_PCT,
} from "@/lib/pm/nav-audit-preview-labels-p3-133-policy";

export type NavAuditPreviewLabelsBaseline = {
  version: string;
  policyId: typeof NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  historicalBaseline: {
    pctUnlabeledPreview: number;
    note: string;
  };
  currentSnapshot: {
    expandedNavLinkCount: number;
    previewLinkCount: number;
    labeledPreviewCount: number;
    unlabeledPreviewCount: number;
    pctUnlabeledPreview: number;
    betaLinkCount: number;
    suppressedPrefixCount: number;
  };
  targetPctUnlabeledPreview: number;
  implementationRefs: {
    p1_24: string;
    p1_56: string;
  };
  liveAuditPassed: boolean;
};

const EXPANDED_NAV_CTX: NavMaturityFilterContext = {
  fullNavAccess: false,
  navScopeAll: true,
  gtmSurfaceAccess: false,
};

export function computeNavPreviewLabelSnapshot(root = process.cwd()): {
  expandedNavLinkCount: number;
  previewLinkCount: number;
  labeledPreviewCount: number;
  unlabeledPreviewCount: number;
  pctUnlabeledPreview: number;
  betaLinkCount: number;
  suppressedPrefixCount: number;
  liveAuditPassed: boolean;
} {
  const previewCoverage = auditNavPreviewBadgeCoverage();
  const labelsAudit = auditNavAuditPreviewLabels(root);
  const betaLinkCount = listNavAuditBetaSidebarLinks().length;

  let expandedNavLinkCount = 0;
  for (const group of FINAL_NAVIGATION_GROUPS) {
    for (const link of group.links) {
      if (shouldShowNavLinkByMaturity(link.href, EXPANDED_NAV_CTX)) {
        expandedNavLinkCount += 1;
      }
    }
  }

  const previewLinkCount = previewCoverage.previewSidebarLinkCount;
  const unlabeledPreviewCount = previewCoverage.unlabeledPreviewHrefs.length;
  const labeledPreviewCount = previewCoverage.labeledPreviewLinkCount;
  const pctUnlabeledPreview =
    previewLinkCount === 0
      ? 0
      : Math.round((unlabeledPreviewCount / previewLinkCount) * 100);

  const liveAuditPassed = previewCoverage.passed && labelsAudit.passed;

  return {
    expandedNavLinkCount,
    previewLinkCount,
    labeledPreviewCount,
    unlabeledPreviewCount,
    pctUnlabeledPreview,
    betaLinkCount,
    suppressedPrefixCount: previewCoverage.suppressedPrefixCount,
    liveAuditPassed,
  };
}

export function loadNavAuditPreviewLabelsBaseline(
  root = process.cwd(),
  artifactPath = "artifacts/nav-audit-preview-labels-baseline.json",
): NavAuditPreviewLabelsBaseline {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as NavAuditPreviewLabelsBaseline;
}

export function validateNavAuditPreviewLabelsBaseline(
  baseline: NavAuditPreviewLabelsBaseline,
  liveSnapshot = computeNavPreviewLabelSnapshot(),
): {
  valid: boolean;
  policyIdMatches: boolean;
  targetMet: boolean;
  snapshotMatchesLive: boolean;
  implementationRefsMatch: boolean;
} {
  const policyIdMatches = baseline.policyId === NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID;

  const targetMet =
    baseline.targetPctUnlabeledPreview === NAV_AUDIT_PREVIEW_LABELS_PM_TARGET_PCT &&
    baseline.currentSnapshot.pctUnlabeledPreview === NAV_AUDIT_PREVIEW_LABELS_PM_TARGET_PCT &&
    baseline.currentSnapshot.unlabeledPreviewCount === 0;

  const snapshotMatchesLive =
    baseline.currentSnapshot.previewLinkCount === liveSnapshot.previewLinkCount &&
    baseline.currentSnapshot.labeledPreviewCount === liveSnapshot.labeledPreviewCount &&
    baseline.currentSnapshot.unlabeledPreviewCount === liveSnapshot.unlabeledPreviewCount &&
    baseline.currentSnapshot.pctUnlabeledPreview === liveSnapshot.pctUnlabeledPreview &&
    baseline.currentSnapshot.betaLinkCount === liveSnapshot.betaLinkCount &&
    baseline.currentSnapshot.suppressedPrefixCount === liveSnapshot.suppressedPrefixCount &&
    baseline.liveAuditPassed === liveSnapshot.liveAuditPassed;

  const implementationRefsMatch =
    baseline.implementationRefs.p1_24 === NAV_AUDIT_PREVIEW_LABELS_PM_IMPLEMENTATION_REFS.p1_24 &&
    baseline.implementationRefs.p1_56 === NAV_AUDIT_PREVIEW_LABELS_PM_IMPLEMENTATION_REFS.p1_56;

  const valid =
    policyIdMatches && targetMet && snapshotMatchesLive && implementationRefsMatch;

  return {
    valid,
    policyIdMatches,
    targetMet,
    snapshotMatchesLive,
    implementationRefsMatch,
  };
}
