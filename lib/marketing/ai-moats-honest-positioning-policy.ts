import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-17 — AI moats honest positioning page policy.
 *
 * @see docs/ai-moats-honest-positioning.md
 * @see app/ai/page.tsx
 * @see lib/ai/ai-honesty-labels.ts
 */

export const AI_MOATS_HONEST_POSITIONING_POLICY_ID =
  "ai-moats-honest-positioning-mkt17-v1" as const;

export const AI_MOATS_HONEST_POSITIONING_DOC =
  "docs/ai-moats-honest-positioning.md" as const;

export const AI_MOATS_HONEST_POSITIONING_PAGE_PATH = "app/ai/page.tsx" as const;

export const AI_MOATS_HONEST_POSITIONING_CONTENT_PATH =
  "components/marketing/ai-moats-honest-positioning-content.tsx" as const;

export const AI_MOATS_HONEST_POSITIONING_PUBLIC_PATH = "/ai" as const;

export const AI_MOATS_HONEST_POSITIONING_HEADLINE =
  "7 proprietary AI modules in production — each at qualified maturity, not magic for every workflow." as const;

/** Seven core moats — excludes copilot preview surfaces from primary count. */
export const AI_MOATS_CORE_MODULE_IDS = [
  "restaurant-brain",
  "digital-twin",
  "universal-menu",
  "food-cost-ai",
  "ai-purchasing",
  "kitchen-camera",
  "benchmark-network",
] as const;

export const AI_MOATS_HONEST_POSITIONING_PRIMARY_CTA = {
  label: "Book AI module walkthrough",
  href: "/book-demo?utm_source=ai-moats&utm_medium=landing&utm_campaign=honest-positioning-mkt17",
} as const;

export const AI_MOATS_HONEST_POSITIONING_FORBIDDEN_CLAIMS = [
  "untouchable",
  "fully autonomous restaurant ai",
  "guaranteed margin",
  "guaranteed savings",
  "live computer vision everywhere",
  "production-certified ai for all tenants",
  "magic agi",
  "toast iq parity",
] as const;

export const AI_MOATS_HONEST_POSITIONING_CROSS_CUTTING_RULES = [
  "Engineering done ≠ sales LIVE — pilot GO/NO-GO still applies until staging proof.",
  "Deterministic first — rules, structured DB signals, and math — not opaque LLM for core ops.",
  "Optional OpenAI for copilot — Restaurant Brain briefing is not GPT-dependent on core path.",
  "Show SKIPPED — Integration Health and Today briefing surface honest staging gaps in demos.",
  "Qualified wording — pilot ready, BETA, preview, deterministic over AI-powered magic.",
] as const;

export const AI_MOATS_HONEST_POSITIONING_PAGE_REQUIRED_MARKERS = [
  "AiMoatsHonestPositioningContent",
  "data-testid=\"ai-moats-honest-positioning-page\"",
  "AI_MOATS_HONEST_POSITIONING_POLICY_ID",
  "Forbidden umbrella claims",
] as const;

export type AiMoatsHonestPositioningPageAudit = {
  pagePath: typeof AI_MOATS_HONEST_POSITIONING_PAGE_PATH;
  docPath: typeof AI_MOATS_HONEST_POSITIONING_DOC;
  missingPageMarkers: string[];
  missingDocHeadings: string[];
  coreMoatCount: number;
  passed: boolean;
};

const DOC_REQUIRED_HEADINGS = [
  "Summary table",
  "Forbidden umbrella claims",
  "Cross-cutting honesty rules",
] as const;

export function auditAiMoatsHonestPositioningPage(root = process.cwd()): AiMoatsHonestPositioningPageAudit {
  const pageSource = readFileSync(join(root, AI_MOATS_HONEST_POSITIONING_PAGE_PATH), "utf8");
  const contentSource = readFileSync(join(root, AI_MOATS_HONEST_POSITIONING_CONTENT_PATH), "utf8");
  const surfaceSource = `${pageSource}\n${contentSource}`;
  const docSource = readFileSync(join(root, AI_MOATS_HONEST_POSITIONING_DOC), "utf8");

  const missingPageMarkers = AI_MOATS_HONEST_POSITIONING_PAGE_REQUIRED_MARKERS.filter(
    (marker) => !surfaceSource.includes(marker),
  );
  const missingDocHeadings = DOC_REQUIRED_HEADINGS.filter((heading) => !docSource.includes(heading));

  return {
    pagePath: AI_MOATS_HONEST_POSITIONING_PAGE_PATH,
    docPath: AI_MOATS_HONEST_POSITIONING_DOC,
    missingPageMarkers,
    missingDocHeadings,
    coreMoatCount: AI_MOATS_CORE_MODULE_IDS.length,
    passed: missingPageMarkers.length === 0 && missingDocHeadings.length === 0,
  };
}

export type AiMoatsHonestPositioningLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintAiMoatsHonestPositioningCopy(source: string): AiMoatsHonestPositioningLint {
  const lower = source.toLowerCase();
  const forbiddenHits = AI_MOATS_HONEST_POSITIONING_FORBIDDEN_CLAIMS.filter((claim) =>
    lower.includes(claim),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
