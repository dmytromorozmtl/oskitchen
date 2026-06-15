import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-27 — integration honesty screen-share guide policy.
 *
 * @see docs/integration-honesty-screen-share-guide.md
 * @see docs/demo-script-15min.md
 * @see docs/forbidden-claims-training.md
 */

export const INTEGRATION_HONESTY_SCREEN_SHARE_POLICY_ID =
  "integration-honesty-screen-share-mkt27-v1" as const;

export const INTEGRATION_HONESTY_SCREEN_SHARE_DOC =
  "docs/integration-honesty-screen-share-guide.md" as const;

/** Seven screen-share segments — S1–S7. */
export const INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS = [
  { id: "S1", slug: "frame", label: "Frame honesty before sharing", durationSec: 45 },
  { id: "S2", slug: "today-strip", label: "Today Integration Health strip", durationSec: 60 },
  { id: "S3", slug: "full-matrix", label: "Full integration health matrix", durationSec: 90 },
  { id: "S4", slug: "beta-row", label: "Pause on BETA row", durationSec: 45 },
  { id: "S5", slug: "skipped-row", label: "Pause on SKIPPED row + recovery", durationSec: 60 },
  { id: "S6", slug: "placeholder-row", label: "Marketplace placeholder row", durationSec: 45 },
  { id: "S7", slug: "close", label: "Trust page + next step", durationSec: 45 },
] as const;

export type IntegrationHonestyScreenShareSegmentId =
  (typeof INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS)[number]["id"];

export const INTEGRATION_HONESTY_SCREEN_SHARE_ROUTES = [
  "/dashboard/today",
  "/dashboard/integration-health",
  "/dashboard/sales-channels",
  "/trust",
] as const;

/** Canonical maturity labels reps must explain on screen-share. */
export const INTEGRATION_HONESTY_LABELS = [
  "PASS",
  "BETA",
  "SKIPPED",
  "PLACEHOLDER",
  "FAILED",
] as const;

export type IntegrationHonestyLabel = (typeof INTEGRATION_HONESTY_LABELS)[number];

export const INTEGRATION_HONESTY_SCREEN_SHARE_PRIMARY_CTA = {
  label: "Book integration honesty walkthrough",
  href: "/book-demo?utm_source=integration-honesty&utm_medium=screen-share&utm_campaign=integration-honesty-mkt27",
} as const;

export const INTEGRATION_HONESTY_SCREEN_SHARE_FORBIDDEN_PHRASES = [
  "everything is live",
  "all integrations are live",
  "all channels live",
  "uber eats official partner",
  "doordash official partner",
  "fake green",
  "hide skipped",
  "production certified for all tenants",
  "guaranteed uptime",
  "five nines",
] as const;

export const INTEGRATION_HONESTY_SCREEN_SHARE_DOC_REQUIRED_HEADINGS = [
  "When to screen-share",
  "Label vocabulary (PASS / BETA / SKIPPED / PLACEHOLDER / FAILED)",
  "Seven screen-share segments",
  "Pre-share checklist",
  "Forbidden screen-share claims",
  "Post-share checklist",
] as const;

export type IntegrationHonestyScreenShareDocAudit = {
  docPath: typeof INTEGRATION_HONESTY_SCREEN_SHARE_DOC;
  missingHeadings: string[];
  segmentCount: number;
  labelCount: number;
  passed: boolean;
};

export function listIntegrationHonestyScreenShareSegmentIds(): IntegrationHonestyScreenShareSegmentId[] {
  return INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS.map((seg) => seg.id);
}

export function getIntegrationHonestyScreenShareSegmentById(
  id: IntegrationHonestyScreenShareSegmentId,
) {
  return INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS.find((seg) => seg.id === id);
}

export function totalIntegrationHonestyScreenShareDurationSec(): number {
  return INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS.reduce(
    (sum, seg) => sum + seg.durationSec,
    0,
  );
}

export function auditIntegrationHonestyScreenShareDoc(
  root = process.cwd(),
): IntegrationHonestyScreenShareDocAudit {
  const source = readFileSync(join(root, INTEGRATION_HONESTY_SCREEN_SHARE_DOC), "utf8");
  const missingHeadings = INTEGRATION_HONESTY_SCREEN_SHARE_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const labelCount = INTEGRATION_HONESTY_LABELS.filter((label) =>
    source.includes(label),
  ).length;

  return {
    docPath: INTEGRATION_HONESTY_SCREEN_SHARE_DOC,
    missingHeadings,
    segmentCount: INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS.length,
    labelCount,
    passed:
      missingHeadings.length === 0 &&
      INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS.length === 7 &&
      labelCount === INTEGRATION_HONESTY_LABELS.length,
  };
}

export type IntegrationHonestyScreenShareLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintIntegrationHonestyScreenShareCopy(
  source: string,
): IntegrationHonestyScreenShareLint {
  const lower = source.toLowerCase();
  const forbiddenHits = INTEGRATION_HONESTY_SCREEN_SHARE_FORBIDDEN_PHRASES.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
