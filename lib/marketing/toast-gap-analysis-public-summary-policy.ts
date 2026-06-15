import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-34 — Toast gap analysis public summary policy (sales-safe one-pager).
 *
 * @see docs/toast-gap-analysis.md
 * @see docs/competitive-battle-cards.md
 * @see lib/marketing/compare-content.ts
 */

export const TOAST_GAP_PUBLIC_SUMMARY_POLICY_ID =
  "toast-gap-analysis-public-summary-mkt34-v1" as const;

export const TOAST_GAP_ANALYSIS_DOC = "docs/toast-gap-analysis.md" as const;

export const TOAST_GAP_COMPARE_PATH = "/compare/toast" as const;

export const TOAST_GAP_BATTLE_CARD_ID = "BC1" as const;

export const TOAST_WINS_PUBLIC_BULLETS = ["TW1", "TW2", "TW3"] as const;

export const TOAST_OK_WEDGES_PUBLIC_BULLETS = ["OK1", "OK2", "OK3"] as const;

export const TOAST_GAP_PUBLIC_SUMMARY_CTA = {
  label: "Book competitive walkthrough",
  href: "/book-demo?utm_source=compare&utm_medium=toast-gap&utm_campaign=toast-gap-mkt34",
} as const;

export const TOAST_GAP_PUBLIC_SUMMARY_FORBIDDEN_CLAIMS = [
  "beat toast on everything",
  "toast killer",
  "toast-class rush hour",
  "production-certified doordash",
  "thousands of os kitchen customers",
  "enterprise-ready day one",
  "soc 2 certified",
] as const;

export const TOAST_GAP_PUBLIC_SUMMARY_DOC_REQUIRED_HEADINGS = [
  "Public summary",
  "Publish gates",
  "Forbidden public summary claims",
  "Toast wins (say aloud",
  "OS Kitchen wedges",
] as const;

export type ToastGapPublicSummaryDocAudit = {
  docPath: typeof TOAST_GAP_ANALYSIS_DOC;
  missingHeadings: string[];
  toastWinBulletCount: number;
  wedgeBulletCount: number;
  passed: boolean;
};

export function auditToastGapPublicSummaryDoc(
  root = process.cwd(),
): ToastGapPublicSummaryDocAudit {
  const source = readFileSync(join(root, TOAST_GAP_ANALYSIS_DOC), "utf8");
  const missingHeadings = TOAST_GAP_PUBLIC_SUMMARY_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const toastWinBulletCount = TOAST_WINS_PUBLIC_BULLETS.filter((id) =>
    source.includes(`**${id}**`),
  ).length;
  const wedgeBulletCount = TOAST_OK_WEDGES_PUBLIC_BULLETS.filter((id) =>
    source.includes(`**${id}**`),
  ).length;

  return {
    docPath: TOAST_GAP_ANALYSIS_DOC,
    missingHeadings,
    toastWinBulletCount,
    wedgeBulletCount,
    passed:
      missingHeadings.length === 0 &&
      toastWinBulletCount === TOAST_WINS_PUBLIC_BULLETS.length &&
      wedgeBulletCount === TOAST_OK_WEDGES_PUBLIC_BULLETS.length,
  };
}

export type ToastGapPublicSummaryLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintToastGapPublicSummaryCopy(source: string): ToastGapPublicSummaryLint {
  const lower = source.toLowerCase();
  const forbiddenHits = TOAST_GAP_PUBLIC_SUMMARY_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}

export function getToastGapPublicSummaryBulletIds(): {
  toastWins: readonly string[];
  osKitchenWedges: readonly string[];
} {
  return {
    toastWins: TOAST_WINS_PUBLIC_BULLETS,
    osKitchenWedges: TOAST_OK_WEDGES_PUBLIC_BULLETS,
  };
}
