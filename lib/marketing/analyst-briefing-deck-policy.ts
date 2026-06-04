import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-35 — analyst briefing deck policy (enterprise interest gate).
 *
 * @see docs/analyst-briefing-deck.md
 * @see docs/enterprise-mvp-spec.md
 * @see docs/series-a-hold-notice.md
 */

export const ANALYST_BRIEFING_DECK_POLICY_ID = "analyst-briefing-deck-mkt35-v1" as const;

export const ANALYST_BRIEFING_DECK_DOC = "docs/analyst-briefing-deck.md" as const;

export const ANALYST_BRIEFING_DECK_STATUS = "INTERNAL DRAFT" as const;

export const ANALYST_BRIEFING_MIN_ENTERPRISE_INTEREST = 1 as const;

export const ANALYST_BRIEFING_SLIDES = [
  "AB1",
  "AB2",
  "AB3",
  "AB4",
  "AB5",
  "AB6",
  "AB7",
  "AB8",
  "AB9",
  "AB10",
  "AB11",
  "AB12",
] as const;

export const ANALYST_BRIEFING_ENTERPRISE_INTEREST_TYPES = [
  "security questionnaire",
  "rfp",
  "3+ location operator demo",
  "analyst firm briefing",
] as const;

export const ANALYST_BRIEFING_FORBIDDEN_CLAIMS = [
  "thousands of customers",
  "soc 2 type ii certified",
  "enterprise-ready day one",
  "all integrations live",
  "series a",
  "beat toast on everything",
  "rush-hour kds certified",
  "fabricated tam",
] as const;

export const ANALYST_BRIEFING_DOC_REQUIRED_HEADINGS = [
  "Enterprise interest gate",
  "Slide outline",
  "Forbidden analyst briefing claims",
  "Distribution checklist",
] as const;

export type AnalystBriefingDeckDocAudit = {
  docPath: typeof ANALYST_BRIEFING_DECK_DOC;
  missingHeadings: string[];
  slideCount: number;
  passed: boolean;
};

export function auditAnalystBriefingDeckDoc(root = process.cwd()): AnalystBriefingDeckDocAudit {
  const source = readFileSync(join(root, ANALYST_BRIEFING_DECK_DOC), "utf8");
  const missingHeadings = ANALYST_BRIEFING_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const slideCount = ANALYST_BRIEFING_SLIDES.filter((id) => source.includes(`**${id}**`)).length;

  return {
    docPath: ANALYST_BRIEFING_DECK_DOC,
    missingHeadings,
    slideCount,
    passed: missingHeadings.length === 0 && slideCount === ANALYST_BRIEFING_SLIDES.length,
  };
}

export function isAnalystBriefingDeckDistributable(
  enterpriseInterestCount: number,
  founderApproved = false,
): boolean {
  return (
    enterpriseInterestCount >= ANALYST_BRIEFING_MIN_ENTERPRISE_INTEREST && founderApproved
  );
}

export type AnalystBriefingDeckLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintAnalystBriefingDeckCopy(source: string): AnalystBriefingDeckLint {
  const lower = source.toLowerCase();
  const forbiddenHits = ANALYST_BRIEFING_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}

export function qualifiesEnterpriseInterest(signalType: string): boolean {
  const lower = signalType.toLowerCase();
  return ANALYST_BRIEFING_ENTERPRISE_INTEREST_TYPES.some((t) => lower.includes(t.split(" ")[0]!));
}
