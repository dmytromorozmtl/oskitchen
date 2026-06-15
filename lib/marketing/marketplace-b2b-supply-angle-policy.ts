import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-16 — marketplace B2B supply angle policy (buyer + vendor sales narrative).
 *
 * @see docs/marketplace-b2b-supply-angle.md
 * @see docs/marketplace-pricing-strategy.md
 * @see docs/vendor-seeding-strategy.md
 */

export const MARKETPLACE_B2B_SUPPLY_ANGLE_POLICY_ID =
  "marketplace-b2b-supply-angle-mkt16-v1" as const;

export const MARKETPLACE_B2B_SUPPLY_ANGLE_DOC =
  "docs/marketplace-b2b-supply-angle.md" as const;

export const MARKETPLACE_B2B_SUPPLY_ONE_LINE_PITCH =
  "Order packaging, cleaning, and kitchen supplies inside the same workspace where you run production and margin — HoReCa B2B catalog with honest BETA labels until seeded vendors and staging checkout PASS." as const;

export const MARKETPLACE_B2B_SUPPLY_STORY_BEATS = [
  { id: "pain", label: "The pain", durationSec: 25 },
  { id: "wedge", label: "The wedge", durationSec: 30 },
  { id: "today", label: "What works today", durationSec: 35 },
  { id: "pilot", label: "Pilot offer", durationSec: 20 },
  { id: "close", label: "Honest close", durationSec: 10 },
] as const;

export const MARKETPLACE_B2B_SUPPLY_ROUTES = [
  "/dashboard/marketplace",
  "/dashboard/marketplace/catalog",
  "/dashboard/marketplace/vendors",
] as const;

export const MARKETPLACE_B2B_SUPPLY_ICP_SEGMENTS = [
  "Commissary / ghost kitchen operator",
  "Multi-brand meal prep",
  "Independent restaurant (2–5 sites)",
  "Regional HoReCa supplier (vendor)",
] as const;

export const MARKETPLACE_B2B_SUPPLY_PRIMARY_CTA = {
  label: "Book B2B supply fit call",
  href: "/book-demo?utm_source=marketplace-b2b&utm_medium=sales&utm_campaign=supply-angle-mkt16",
} as const;

export const MARKETPLACE_B2B_SUPPLY_FORBIDDEN_CLAIMS = [
  "national marketplace network live",
  "thousands of vendors",
  "faire parity",
  "amazon business parity",
  "toast marketplace parity",
  "square marketplace parity",
  "guaranteed gmv",
  "zero commission forever",
  "sysco replacement",
  "instant nationwide delivery",
] as const;

export const MARKETPLACE_B2B_SUPPLY_STORY_REQUIRED_HEADINGS = [
  "One-line pitch",
  "Story arc (2 minutes)",
  "Approved demo script (30 seconds)",
  "Forbidden claims",
  "Demo flow (8 minutes)",
] as const;

export type MarketplaceB2bSupplyAngleDocAudit = {
  docPath: typeof MARKETPLACE_B2B_SUPPLY_ANGLE_DOC;
  missingHeadings: string[];
  storyBeatCount: number;
  passed: boolean;
};

export function totalMarketplaceB2bSupplyStoryDurationSec(): number {
  return MARKETPLACE_B2B_SUPPLY_STORY_BEATS.reduce(
    (sum, beat) => sum + beat.durationSec,
    0,
  );
}

export function auditMarketplaceB2bSupplyAngleDoc(
  root = process.cwd(),
): MarketplaceB2bSupplyAngleDocAudit {
  const source = readFileSync(join(root, MARKETPLACE_B2B_SUPPLY_ANGLE_DOC), "utf8");
  const missingHeadings = MARKETPLACE_B2B_SUPPLY_STORY_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: MARKETPLACE_B2B_SUPPLY_ANGLE_DOC,
    missingHeadings,
    storyBeatCount: MARKETPLACE_B2B_SUPPLY_STORY_BEATS.length,
    passed: missingHeadings.length === 0,
  };
}

export type MarketplaceB2bSupplyAngleLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintMarketplaceB2bSupplyAngleCopy(
  source: string,
): MarketplaceB2bSupplyAngleLint {
  const lower = source.toLowerCase();
  const forbiddenHits = MARKETPLACE_B2B_SUPPLY_FORBIDDEN_CLAIMS.filter((claim) =>
    lower.includes(claim),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
