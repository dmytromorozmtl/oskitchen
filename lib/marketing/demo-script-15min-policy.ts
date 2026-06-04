import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-22 — 15-minute live demo script policy.
 *
 * @see docs/demo-script-15min.md
 * @see docs/discovery-call-script.md
 * @see docs/demo-video-script-5min.md
 */

export const DEMO_SCRIPT_15MIN_POLICY_ID = "demo-script-15min-mkt22-v1" as const;

export const DEMO_SCRIPT_15MIN_DOC = "docs/demo-script-15min.md" as const;

export const DEMO_SCRIPT_15MIN_TARGET_SECONDS = 900 as const;

/** Nine segments — must sum to 900 seconds (15 minutes). */
export const DEMO_SCRIPT_15MIN_SEGMENTS = [
  { id: "frame", label: "Frame + pain recap", durationSec: 60 },
  { id: "today", label: "Today Command Center", durationSec: 150 },
  { id: "orders", label: "Order Hub", durationSec: 120 },
  { id: "integration-health", label: "Integration Health", durationSec: 120 },
  { id: "kds", label: "KDS + production", durationSec: 120 },
  { id: "pos-packing", label: "POS + packing", durationSec: 90 },
  { id: "channels", label: "Channels + storefront", durationSec: 90 },
  { id: "ai-profit", label: "AI / profit glance", durationSec: 60 },
  { id: "close", label: "Pricing + CTA", durationSec: 90 },
] as const;

export const DEMO_SCRIPT_15MIN_DEMO_ROUTES = [
  "/dashboard/today",
  "/dashboard/orders",
  "/dashboard/integration-health",
  "/dashboard/kitchen",
  "/dashboard/pos",
  "/pricing",
] as const;

export const DEMO_SCRIPT_15MIN_UTM_CAMPAIGN = "demo-15min-mkt22" as const;

export const DEMO_SCRIPT_15MIN_PRIMARY_CTA = {
  label: "Book follow-up session",
  href: `/book-demo?utm_source=demo&utm_medium=live&utm_campaign=${DEMO_SCRIPT_15MIN_UTM_CAMPAIGN}`,
} as const;

export const DEMO_SCRIPT_15MIN_FORBIDDEN_PHRASES = [
  "replace toast overnight",
  "fully integrated",
  "proven roi",
  "guaranteed savings",
  "live doordash",
  "live uber eats",
  "thousands of customers",
  "national marketplace network",
  "soc 2 certified",
  "untouchable ai",
] as const;

export const DEMO_SCRIPT_15MIN_REQUIRED_HEADINGS = [
  "Pre-demo checklist",
  "Segment structure (15 minutes)",
  "Timing map",
  "Forbidden on-call claims",
  "Post-demo checklist",
] as const;

export type DemoScript15MinDocAudit = {
  docPath: typeof DEMO_SCRIPT_15MIN_DOC;
  missingHeadings: string[];
  segmentDurationTotalSec: number;
  passed: boolean;
};

export function totalDemoScript15MinDurationSec(): number {
  return DEMO_SCRIPT_15MIN_SEGMENTS.reduce((sum, seg) => sum + seg.durationSec, 0);
}

export function auditDemoScript15MinDoc(root = process.cwd()): DemoScript15MinDocAudit {
  const source = readFileSync(join(root, DEMO_SCRIPT_15MIN_DOC), "utf8");
  const missingHeadings = DEMO_SCRIPT_15MIN_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const segmentDurationTotalSec = totalDemoScript15MinDurationSec();

  return {
    docPath: DEMO_SCRIPT_15MIN_DOC,
    missingHeadings,
    segmentDurationTotalSec,
    passed:
      missingHeadings.length === 0 &&
      segmentDurationTotalSec === DEMO_SCRIPT_15MIN_TARGET_SECONDS,
  };
}

export type DemoScript15MinLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintDemoScript15MinCopy(source: string): DemoScript15MinLint {
  const lower = source.toLowerCase();
  const forbiddenHits = DEMO_SCRIPT_15MIN_FORBIDDEN_PHRASES.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
