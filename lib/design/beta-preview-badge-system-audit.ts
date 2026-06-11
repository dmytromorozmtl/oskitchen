import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BETA_BADGE_COLOR_TOKEN,
  BETA_BADGE_LABEL,
  BETA_BADGE_VARIANT,
  BETA_PREVIEW_BADGE_SYSTEM_POLICY_ID,
  BETA_PREVIEW_BADGE_SYSTEM_REQUIRED_BADGES,
  BETA_PREVIEW_BADGE_SYSTEM_UI_MODULES,
  COMING_SOON_BADGE_COLOR_TOKEN,
  COMING_SOON_BADGE_LABEL,
  COMING_SOON_BADGE_VARIANT,
  MATURITY_BADGE_BASE_CLASS,
  NEW_BADGE_COLOR_TOKEN,
  NEW_BADGE_LABEL,
  NEW_BADGE_VARIANT,
} from "@/lib/design/beta-preview-badge-system-policy";

export type BetaPreviewBadgeSystemAuditSummary = {
  policyId: typeof BETA_PREVIEW_BADGE_SYSTEM_POLICY_ID;
  badgeVariantsPresent: boolean;
  betaBadgeWired: boolean;
  comingSoonBadgeWired: boolean;
  newBadgeWired: boolean;
  maturityBadgeBaseWired: boolean;
  passed: boolean;
};

export function auditBetaPreviewBadgeSystem(
  root = process.cwd(),
): BetaPreviewBadgeSystemAuditSummary {
  const badgePath = join(root, BETA_PREVIEW_BADGE_SYSTEM_UI_MODULES[0]!);
  const maturityBadgePath = join(root, BETA_PREVIEW_BADGE_SYSTEM_UI_MODULES[1]!);

  const badgePresent = existsSync(badgePath);
  const maturityBadgePresent = existsSync(maturityBadgePath);

  let badgeVariantsPresent = false;
  let betaBadgeWired = false;
  let comingSoonBadgeWired = false;
  let newBadgeWired = false;
  let maturityBadgeBaseWired = false;

  if (badgePresent) {
    const source = readFileSync(badgePath, "utf8");
    badgeVariantsPresent =
      source.includes(`${BETA_BADGE_VARIANT}:`) &&
      source.includes(`${COMING_SOON_BADGE_VARIANT}:`) &&
      source.includes(`${NEW_BADGE_VARIANT}:`) &&
      source.includes(BETA_BADGE_COLOR_TOKEN) &&
      source.includes(COMING_SOON_BADGE_COLOR_TOKEN) &&
      source.includes(NEW_BADGE_COLOR_TOKEN);
  }

  if (maturityBadgePresent) {
    const source = readFileSync(maturityBadgePath, "utf8");
    betaBadgeWired =
      source.includes("BetaBadge") &&
      source.includes(BETA_BADGE_LABEL) &&
      source.includes("BETA_BADGE_VARIANT");
    comingSoonBadgeWired =
      source.includes("ComingSoonBadge") &&
      source.includes("COMING_SOON_BADGE_LABEL") &&
      source.includes("COMING_SOON_BADGE_VARIANT");
    newBadgeWired =
      source.includes("NewBadge") &&
      source.includes("NEW_BADGE_LABEL") &&
      source.includes("NEW_BADGE_VARIANT");
    maturityBadgeBaseWired = source.includes("MATURITY_BADGE_BASE_CLASS");
  }

  const passed =
    badgePresent &&
    maturityBadgePresent &&
    badgeVariantsPresent &&
    betaBadgeWired &&
    comingSoonBadgeWired &&
    newBadgeWired &&
    maturityBadgeBaseWired &&
    BETA_PREVIEW_BADGE_SYSTEM_REQUIRED_BADGES.length === 3;

  return {
    policyId: BETA_PREVIEW_BADGE_SYSTEM_POLICY_ID,
    badgeVariantsPresent,
    betaBadgeWired,
    comingSoonBadgeWired,
    newBadgeWired,
    maturityBadgeBaseWired,
    passed,
  };
}

export function formatBetaPreviewBadgeSystemAuditLines(
  summary: BetaPreviewBadgeSystemAuditSummary,
): string[] {
  return [
    `BETA/preview badge system audit (${summary.policyId})`,
    `Badge variants (beta/comingSoon/new): ${summary.badgeVariantsPresent ? "yes" : "no"}`,
    `${BETA_BADGE_LABEL} (${BETA_BADGE_COLOR_TOKEN}): ${summary.betaBadgeWired ? "yes" : "no"}`,
    `${COMING_SOON_BADGE_LABEL} (${COMING_SOON_BADGE_COLOR_TOKEN}): ${summary.comingSoonBadgeWired ? "yes" : "no"}`,
    `${NEW_BADGE_LABEL} (${NEW_BADGE_COLOR_TOKEN}): ${summary.newBadgeWired ? "yes" : "no"}`,
    `Maturity badge base class: ${summary.maturityBadgeBaseWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
