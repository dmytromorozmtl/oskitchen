import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-18 — ghost kitchen webinar playbook policy.
 *
 * @see docs/webinar-ghost-kitchens.md
 * @see docs/webinar-strategy.md
 */

export const WEBINAR_GHOST_KITCHENS_POLICY_ID = "webinar-ghost-kitchens-mkt18-v1" as const;

export const WEBINAR_GHOST_KITCHENS_DOC = "docs/webinar-ghost-kitchens.md" as const;

export const WEBINAR_GHOST_KITCHENS_ONE_LINE_PITCH =
  "Run multiple virtual brands from one kitchen — unified Order Hub, shared KDS, and honest Integration Health — without claiming Toast parity or live aggregator certification." as const;

export const WEBINAR_GHOST_KITCHENS_STORY_BEATS = [
  { id: "pain", label: "The pain", durationSec: 25 },
  { id: "wedge", label: "The wedge", durationSec: 30 },
  { id: "today", label: "What works today", durationSec: 35 },
  { id: "pilot", label: "Pilot offer", durationSec: 20 },
  { id: "close", label: "Honest close", durationSec: 10 },
] as const;

export const WEBINAR_GHOST_KITCHENS_RUN_OF_SHOW = [
  { id: "welcome", label: "Welcome + honesty framing", durationMin: 5 },
  { id: "pain-slide", label: "Ghost kitchen pain", durationMin: 3 },
  { id: "today-demo", label: "Today + briefing", durationMin: 10 },
  { id: "orders-kds", label: "Order Hub + KDS", durationMin: 8 },
  { id: "integration-health", label: "Integration Health", durationMin: 6 },
  { id: "channels", label: "Channels + storefront", durationMin: 3 },
  { id: "qa", label: "Q&A", durationMin: 7 },
  { id: "cta", label: "CTA + LOI", durationMin: 3 },
] as const;

export const WEBINAR_GHOST_KITCHENS_DEMO_ROUTES = [
  "/dashboard/today",
  "/dashboard/orders",
  "/dashboard/kitchen",
  "/dashboard/integration-health",
] as const;

export const WEBINAR_GHOST_KITCHENS_UTM_CAMPAIGN = "ghost-kitchen-mkt18" as const;

export const WEBINAR_GHOST_KITCHENS_PRIMARY_CTA = {
  label: "Book ghost kitchen fit call",
  href: `/book-demo?utm_source=webinar&utm_medium=live&utm_campaign=${WEBINAR_GHOST_KITCHENS_UTM_CAMPAIGN}`,
} as const;

export const WEBINAR_GHOST_KITCHENS_LANDING_CTA = {
  label: "Ghost kitchen solution",
  href: `/solutions/ghost-kitchens?utm_source=webinar&utm_medium=live&utm_campaign=${WEBINAR_GHOST_KITCHENS_UTM_CAMPAIGN}`,
} as const;

export const WEBINAR_GHOST_KITCHENS_FORBIDDEN_CLAIMS = [
  "trusted by thousands of ghost kitchens",
  "deliverect parity",
  "uber eats official partner",
  "doordash official integration live",
  "guaranteed margin by brand",
  "fully autonomous kitchen ai",
  "all aggregators synced",
  "soc 2 certified",
] as const;

export const WEBINAR_GHOST_KITCHENS_DOC_REQUIRED_HEADINGS = [
  "One-line pitch",
  "Story arc (2 minutes)",
  "Approved demo script (30 seconds)",
  "Run-of-show (45 minutes)",
  "Forbidden claims",
  "Demo flow (8 minutes)",
] as const;

export type WebinarGhostKitchensDocAudit = {
  docPath: typeof WEBINAR_GHOST_KITCHENS_DOC;
  missingHeadings: string[];
  storyBeatCount: number;
  runOfShowDurationMin: number;
  passed: boolean;
};

export function totalWebinarGhostKitchensStoryDurationSec(): number {
  return WEBINAR_GHOST_KITCHENS_STORY_BEATS.reduce(
    (sum, beat) => sum + beat.durationSec,
    0,
  );
}

export function totalWebinarGhostKitchensRunOfShowMin(): number {
  return WEBINAR_GHOST_KITCHENS_RUN_OF_SHOW.reduce(
    (sum, segment) => sum + segment.durationMin,
    0,
  );
}

export function auditWebinarGhostKitchensDoc(root = process.cwd()): WebinarGhostKitchensDocAudit {
  const source = readFileSync(join(root, WEBINAR_GHOST_KITCHENS_DOC), "utf8");
  const missingHeadings = WEBINAR_GHOST_KITCHENS_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: WEBINAR_GHOST_KITCHENS_DOC,
    missingHeadings,
    storyBeatCount: WEBINAR_GHOST_KITCHENS_STORY_BEATS.length,
    runOfShowDurationMin: totalWebinarGhostKitchensRunOfShowMin(),
    passed: missingHeadings.length === 0,
  };
}

export type WebinarGhostKitchensLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintWebinarGhostKitchensCopy(source: string): WebinarGhostKitchensLint {
  const lower = source.toLowerCase();
  const forbiddenHits = WEBINAR_GHOST_KITCHENS_FORBIDDEN_CLAIMS.filter((claim) =>
    lower.includes(claim),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
