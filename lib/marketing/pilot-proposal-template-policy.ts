import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-24 — pilot proposal template policy (design partner & paid pilot paths).
 *
 * @see docs/pilot-proposal-template.md
 * @see lib/marketing/pilot-pricing-skus.ts
 * @see docs/era20-first-paid-pilot-package-2026-05-28.md
 */

export const PILOT_PROPOSAL_TEMPLATE_POLICY_ID = "pilot-proposal-template-mkt24-v1" as const;

export const PILOT_PROPOSAL_TEMPLATE_DOC = "docs/pilot-proposal-template.md" as const;

export const PILOT_PROPOSAL_DURATION_DAYS = 90 as const;

export const PILOT_PROPOSAL_VALIDITY_DAYS = 14 as const;

/** Ten proposal sections — P1–P10. */
export const PILOT_PROPOSAL_SECTIONS = [
  { id: "P1", slug: "executive-summary", label: "Executive summary" },
  { id: "P2", slug: "included-modules", label: "Included modules (honest maturity)" },
  { id: "P3", slug: "excluded-modules", label: "Excluded modules" },
  { id: "P4", slug: "pilot-pricing", label: "Pilot pricing table" },
  { id: "P5", slug: "timeline", label: "90-day timeline" },
  { id: "P6", slug: "success-metrics", label: "Success metrics" },
  { id: "P7", slug: "support-boundaries", label: "Support boundaries" },
  { id: "P8", slug: "next-steps", label: "Next steps and signature path" },
  { id: "P9", slug: "forbidden-claims", label: "Forbidden proposal claims" },
  { id: "P10", slug: "pre-send-checklist", label: "Pre-send checklist" },
] as const;

export type PilotProposalSectionId = (typeof PILOT_PROPOSAL_SECTIONS)[number]["id"];

/** Primary pilot SKUs referenced in proposals — mirrors pilot-pricing-skus.ts. */
export const PILOT_PROPOSAL_SKUS = [
  "LOI-DP-001",
  "PILOT-STA-50",
  "PILOT-PRO-50",
  "PILOT-TEA-50",
  "PILOT-PLAT-90",
  "PILOT-IMPL-001",
] as const;

export type PilotProposalSku = (typeof PILOT_PROPOSAL_SKUS)[number];

export const PILOT_PROPOSAL_PRIMARY_CTA = {
  label: "Book scope review",
  href: "/book-demo?utm_source=proposal&utm_medium=sales&utm_campaign=pilot-proposal-mkt24",
} as const;

export const PILOT_PROPOSAL_FORBIDDEN_PHRASES = [
  "production certified for all tenants",
  "thousands of customers",
  "all integrations are live",
  "guaranteed roi",
  "guaranteed savings",
  "soc 2 certified",
  "soc 2 type ii",
  "rush-hour kds certified",
  "live doordash",
  "live uber eats",
  "replace toast overnight",
  "offline pos included",
] as const;

export const PILOT_PROPOSAL_DOC_REQUIRED_HEADINGS = [
  "When to use",
  "Fill-in fields",
  "Executive summary (copy-paste block)",
  "Included modules (honest maturity)",
  "Excluded modules",
  "Pilot pricing table",
  "90-day timeline",
  "Success metrics",
  "Support boundaries",
  "Next steps and signature path",
  "Forbidden proposal claims",
  "Pre-send checklist",
] as const;

export type PilotProposalDocAudit = {
  docPath: typeof PILOT_PROPOSAL_TEMPLATE_DOC;
  missingHeadings: string[];
  sectionCount: number;
  skuCount: number;
  passed: boolean;
};

export function listPilotProposalSectionIds(): PilotProposalSectionId[] {
  return PILOT_PROPOSAL_SECTIONS.map((entry) => entry.id);
}

export function getPilotProposalSectionById(id: PilotProposalSectionId) {
  return PILOT_PROPOSAL_SECTIONS.find((entry) => entry.id === id);
}

export function auditPilotProposalTemplateDoc(root = process.cwd()): PilotProposalDocAudit {
  const source = readFileSync(join(root, PILOT_PROPOSAL_TEMPLATE_DOC), "utf8");
  const missingHeadings = PILOT_PROPOSAL_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const skuCount = PILOT_PROPOSAL_SKUS.filter((sku) => source.includes(sku)).length;

  return {
    docPath: PILOT_PROPOSAL_TEMPLATE_DOC,
    missingHeadings,
    sectionCount: PILOT_PROPOSAL_SECTIONS.length,
    skuCount,
    passed:
      missingHeadings.length === 0 &&
      PILOT_PROPOSAL_SECTIONS.length === 10 &&
      skuCount === PILOT_PROPOSAL_SKUS.length,
  };
}

export type PilotProposalLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintPilotProposalCopy(source: string): PilotProposalLint {
  const lower = source.toLowerCase();
  const forbiddenHits = PILOT_PROPOSAL_FORBIDDEN_PHRASES.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
