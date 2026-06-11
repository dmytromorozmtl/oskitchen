import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  NAV_AUDIT_PREVIEW_LABELS_MIN_BETA_LINKS,
  NAV_AUDIT_PREVIEW_LABELS_POLICY_ID,
  NAV_AUDIT_PREVIEW_LABELS_UI_MODULES,
  NAV_AUDIT_BETA_BADGE_VARIANT,
  NAV_AUDIT_PREVIEW_BADGE_VARIANT,
  listNavAuditBetaSidebarLinks,
} from "@/lib/design/nav-audit-preview-labels-policy";
import { auditNavPreviewBadgeCoverage } from "@/lib/navigation/nav-audit-preview-policy";
import { navMaturityBadgeForHref } from "@/lib/navigation/nav-maturity-governance";

export type NavAuditPreviewLabelsAuditSummary = {
  policyId: typeof NAV_AUDIT_PREVIEW_LABELS_POLICY_ID;
  badgePreviewVariant: boolean;
  badgeBetaVariant: boolean;
  previewBadgeUsesVariant: boolean;
  betaBadgeUsesVariant: boolean;
  navMaturityBadgePreview: boolean;
  navMaturityBadgeBeta: boolean;
  dashboardNavWired: boolean;
  betaSidebarLinkCount: number;
  betaLabeledCount: number;
  unlabeledBetaHrefs: string[];
  previewCoveragePassed: boolean;
  passed: boolean;
};

function readSource(root: string, relPath: string): string {
  const full = join(root, relPath);
  if (!existsSync(full)) return "";
  return readFileSync(full, "utf8");
}

export function auditNavAuditPreviewLabels(
  root = process.cwd(),
): NavAuditPreviewLabelsAuditSummary {
  const badgeSource = readSource(root, "components/ui/badge.tsx");
  const betaBadgeSource = readSource(root, "components/ui/beta-badge.tsx");
  const dashboardNavSource = readSource(root, "components/dashboard/dashboard-nav.tsx");

  const badgePreviewVariant = badgeSource.includes(`${NAV_AUDIT_PREVIEW_BADGE_VARIANT}:`);
  const badgeBetaVariant = badgeSource.includes(`${NAV_AUDIT_BETA_BADGE_VARIANT}:`);

  const previewBadgeUsesVariant =
    betaBadgeSource.includes('variant="preview"') ||
    betaBadgeSource.includes("variant='preview'") ||
    betaBadgeSource.includes("PreviewBadge");
  const betaBadgeUsesVariant =
    betaBadgeSource.includes('variant="beta"') ||
    betaBadgeSource.includes("variant='beta'") ||
    betaBadgeSource.includes("BETA_BADGE_VARIANT");

  const navMaturityBadgePreview =
    betaBadgeSource.includes('case "Preview"') && betaBadgeSource.includes("<PreviewBadge");
  const navMaturityBadgeBeta =
    betaBadgeSource.includes('case "Beta"') && betaBadgeSource.includes("<BetaBadge");

  const dashboardNavWired =
    dashboardNavSource.includes("NavMaturityBadge") &&
    dashboardNavSource.includes("navMaturityBadgeForHref");

  const betaLinks = listNavAuditBetaSidebarLinks();
  const unlabeledBetaHrefs: string[] = [];
  let betaLabeledCount = 0;
  for (const link of betaLinks) {
    const label = navMaturityBadgeForHref(link.href);
    if (label === "Beta") {
      betaLabeledCount += 1;
    } else {
      unlabeledBetaHrefs.push(link.href);
    }
  }

  const previewCoverage = auditNavPreviewBadgeCoverage();

  const passed =
    badgePreviewVariant &&
    badgeBetaVariant &&
    previewBadgeUsesVariant &&
    betaBadgeUsesVariant &&
    navMaturityBadgePreview &&
    navMaturityBadgeBeta &&
    dashboardNavWired &&
    betaLinks.length >= NAV_AUDIT_PREVIEW_LABELS_MIN_BETA_LINKS &&
    unlabeledBetaHrefs.length === 0 &&
    previewCoverage.passed &&
    NAV_AUDIT_PREVIEW_LABELS_UI_MODULES.every((modulePath) =>
      existsSync(join(root, modulePath)),
    );

  return {
    policyId: NAV_AUDIT_PREVIEW_LABELS_POLICY_ID,
    badgePreviewVariant,
    badgeBetaVariant,
    previewBadgeUsesVariant,
    betaBadgeUsesVariant,
    navMaturityBadgePreview,
    navMaturityBadgeBeta,
    dashboardNavWired,
    betaSidebarLinkCount: betaLinks.length,
    betaLabeledCount,
    unlabeledBetaHrefs,
    previewCoveragePassed: previewCoverage.passed,
    passed,
  };
}

export function formatNavAuditPreviewLabelsAuditLines(
  summary: NavAuditPreviewLabelsAuditSummary,
): string[] {
  return [
    `Nav audit preview labels (${summary.policyId})`,
    `Badge preview variant: ${summary.badgePreviewVariant ? "yes" : "no"}`,
    `Badge beta variant: ${summary.badgeBetaVariant ? "yes" : "no"}`,
    `PreviewBadge uses variant="preview": ${summary.previewBadgeUsesVariant ? "yes" : "no"}`,
    `BetaBadge uses variant="beta": ${summary.betaBadgeUsesVariant ? "yes" : "no"}`,
    `NavMaturityBadge Preview wired: ${summary.navMaturityBadgePreview ? "yes" : "no"}`,
    `NavMaturityBadge Beta wired: ${summary.navMaturityBadgeBeta ? "yes" : "no"}`,
    `Dashboard nav wired: ${summary.dashboardNavWired ? "yes" : "no"}`,
    `Beta sidebar links: ${summary.betaSidebarLinkCount}`,
    `Beta labeled: ${summary.betaLabeledCount}`,
    `Preview coverage: ${summary.previewCoveragePassed ? "PASS" : "FAIL"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
