import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-15 — profit engine owner margin story policy.
 *
 * @see docs/profit-engine-owner-margin-story.md
 * @see docs/EXECUTIVE_PROFITABILITY.md
 */

export const PROFIT_ENGINE_OWNER_MARGIN_STORY_POLICY_ID =
  "profit-engine-owner-margin-story-mkt15-v1" as const;

export const PROFIT_ENGINE_OWNER_MARGIN_STORY_DOC =
  "docs/profit-engine-owner-margin-story.md" as const;

export const PROFIT_ENGINE_OWNER_MARGIN_ONE_LINE_PITCH =
  "See today's margin by channel, table, and menu item — recipe COGS when configured, honest defaults when not — with alerts before food cost erodes your week." as const;

export const PROFIT_ENGINE_OWNER_MARGIN_STORY_BEATS = [
  { id: "pain", label: "The pain", durationSec: 25 },
  { id: "wedge", label: "The wedge", durationSec: 30 },
  { id: "today", label: "What owners see today", durationSec: 35 },
  { id: "pilot", label: "Pilot proof path", durationSec: 20 },
  { id: "close", label: "Honest close", durationSec: 10 },
] as const;

export const PROFIT_ENGINE_OWNER_MARGIN_ROUTES = [
  "/dashboard/today/profit",
  "/dashboard/analytics/food-cost",
  "/dashboard/executive/profitability",
] as const;

export const PROFIT_ENGINE_OWNER_MARGIN_PRIMARY_CTA = {
  label: "Book owner margin walkthrough",
  href: "/book-demo?utm_source=profit-engine-story&utm_medium=sales&utm_campaign=owner-margin-mkt15",
} as const;

export const PROFIT_ENGINE_OWNER_MARGIN_FORBIDDEN_CLAIMS = [
  "guaranteed roi",
  "guaranteed savings",
  "100% accurate",
  "perfect food cost",
  "replaces quickbooks",
  "gaap statements",
  "magic agi",
  "audited financial statements",
] as const;

export const PROFIT_ENGINE_OWNER_MARGIN_STORY_REQUIRED_HEADINGS = [
  "One-line pitch",
  "Story arc (2 minutes)",
  "Approved demo script (30 seconds)",
  "Forbidden claims",
  "Demo flow (8 minutes)",
] as const;

export type ProfitEngineOwnerMarginStoryDocAudit = {
  docPath: typeof PROFIT_ENGINE_OWNER_MARGIN_STORY_DOC;
  missingHeadings: string[];
  storyBeatCount: number;
  passed: boolean;
};

export function totalProfitEngineOwnerMarginStoryDurationSec(): number {
  return PROFIT_ENGINE_OWNER_MARGIN_STORY_BEATS.reduce(
    (sum, beat) => sum + beat.durationSec,
    0,
  );
}

export function auditProfitEngineOwnerMarginStoryDoc(
  root = process.cwd(),
): ProfitEngineOwnerMarginStoryDocAudit {
  const source = readFileSync(join(root, PROFIT_ENGINE_OWNER_MARGIN_STORY_DOC), "utf8");
  const missingHeadings = PROFIT_ENGINE_OWNER_MARGIN_STORY_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: PROFIT_ENGINE_OWNER_MARGIN_STORY_DOC,
    missingHeadings,
    storyBeatCount: PROFIT_ENGINE_OWNER_MARGIN_STORY_BEATS.length,
    passed: missingHeadings.length === 0,
  };
}

export type ProfitEngineOwnerMarginStoryLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintProfitEngineOwnerMarginStoryCopy(
  source: string,
): ProfitEngineOwnerMarginStoryLint {
  const lower = source.toLowerCase();
  const forbiddenHits = PROFIT_ENGINE_OWNER_MARGIN_FORBIDDEN_CLAIMS.filter((claim) =>
    lower.includes(claim),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
