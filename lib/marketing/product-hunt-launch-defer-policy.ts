import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-30 — Product Hunt launch defer policy (≥3 pilots before submit).
 *
 * @see docs/product-hunt-launch-defer.md
 * @see docs/press-release-first-design-partner.md
 * @see docs/series-a-hold-notice.md
 */

export const PRODUCT_HUNT_LAUNCH_DEFER_POLICY_ID =
  "product-hunt-launch-defer-mkt30-v1" as const;

export const PRODUCT_HUNT_LAUNCH_DEFER_DOC =
  "docs/product-hunt-launch-defer.md" as const;

/** Minimum active pilots before PH launch reconsideration. */
export const PRODUCT_HUNT_MIN_PILOTS_REQUIRED = 3 as const;

export const PRODUCT_HUNT_LAUNCH_DECISION = "DEFER" as const;

export const PRODUCT_HUNT_LAUNCH_GATES = [
  "active pilots",
  "pilot metrics baseline",
  "case study draft",
  "staging golden path",
  "p0 orchestrator",
  "demo stability",
  "forbidden claims",
  "trust linked",
] as const;

export const PRODUCT_HUNT_FORBIDDEN_CLAIMS = [
  "toast killer",
  "thousands of restaurants",
  "all integrations live",
  "production-certified",
  "enterprise-ready",
  "soc 2",
  "guaranteed roi",
  "series a",
  "best pos",
  "#1 product",
] as const;

export const PRODUCT_HUNT_DOC_REQUIRED_HEADINGS = [
  "Decision summary",
  "Launch gates",
  "Why defer now",
  "Forbidden Product Hunt claims",
  "Reconsideration trigger",
] as const;

export type ProductHuntLaunchDeferDocAudit = {
  docPath: typeof PRODUCT_HUNT_LAUNCH_DEFER_DOC;
  missingHeadings: string[];
  gateCount: number;
  minPilotsDocumented: boolean;
  passed: boolean;
};

export function auditProductHuntLaunchDeferDoc(
  root = process.cwd(),
): ProductHuntLaunchDeferDocAudit {
  const source = readFileSync(join(root, PRODUCT_HUNT_LAUNCH_DEFER_DOC), "utf8");
  const missingHeadings = PRODUCT_HUNT_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const gateCount = PRODUCT_HUNT_LAUNCH_GATES.filter((gate) =>
    source.toLowerCase().includes(gate),
  ).length;
  const minPilotsDocumented = source.includes(String(PRODUCT_HUNT_MIN_PILOTS_REQUIRED));

  return {
    docPath: PRODUCT_HUNT_LAUNCH_DEFER_DOC,
    missingHeadings,
    gateCount,
    minPilotsDocumented,
    passed:
      missingHeadings.length === 0 &&
      gateCount >= 6 &&
      minPilotsDocumented &&
      source.includes(PRODUCT_HUNT_LAUNCH_DECISION),
  };
}

export type ProductHuntLaunchDeferLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintProductHuntLaunchDeferCopy(
  source: string,
): ProductHuntLaunchDeferLint {
  const lower = source.toLowerCase();
  const forbiddenHits = PRODUCT_HUNT_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}

export function isProductHuntLaunchAllowed(activePilotCount: number): boolean {
  return activePilotCount >= PRODUCT_HUNT_MIN_PILOTS_REQUIRED;
}
