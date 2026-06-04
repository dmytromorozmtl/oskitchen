import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-28 — LOI template walkthrough policy (design partner live-call guide).
 *
 * @see docs/loi-template-walkthrough.md
 * @see docs/loi-design-partner-template.md
 * @see docs/loi-outreach-email.md
 */

export const LOI_TEMPLATE_WALKTHROUGH_POLICY_ID =
  "loi-template-walkthrough-mkt28-v1" as const;

export const LOI_TEMPLATE_WALKTHROUGH_DOC = "docs/loi-template-walkthrough.md" as const;

export const LOI_TEMPLATE_WALKTHROUGH_SKU = "LOI-DP-001" as const;

export const LOI_DEFAULT_TERM_MONTHS = 3 as const;

/** Eight walkthrough steps — W1–W8 (~25 min live call). */
export const LOI_TEMPLATE_WALKTHROUGH_STEPS = [
  { id: "W1", slug: "frame", label: "Frame non-binding design partner LOI", durationSec: 120 },
  { id: "W2", slug: "purpose", label: "Purpose and mutual intent", durationSec: 120 },
  { id: "W3", slug: "partner-commitments", label: "Design partner commitments", durationSec: 180 },
  { id: "W4", slug: "os-kitchen-commitments", label: "OS Kitchen commitments", durationSec: 120 },
  { id: "W5", slug: "scope-limitations", label: "Scope and honest limitations (Exhibit A)", durationSec: 300 },
  { id: "W6", slug: "confidentiality", label: "Confidentiality and non-binding", durationSec: 120 },
  { id: "W7", slug: "exhibits", label: "Exhibits B and C cadence", durationSec: 180 },
  { id: "W8", slug: "signature", label: "Signature path and post-LOI ops", durationSec: 120 },
] as const;

export type LoiTemplateWalkthroughStepId =
  (typeof LOI_TEMPLATE_WALKTHROUGH_STEPS)[number]["id"];

export const LOI_TEMPLATE_WALKTHROUGH_EXHIBITS = ["A", "B", "C"] as const;

export type LoiTemplateWalkthroughExhibitId =
  (typeof LOI_TEMPLATE_WALKTHROUGH_EXHIBITS)[number];

export const LOI_TEMPLATE_WALKTHROUGH_PRIMARY_CTA = {
  label: "Schedule LOI review call",
  href: "/book-demo?utm_source=loi&utm_medium=walkthrough&utm_campaign=loi-walkthrough-mkt28",
} as const;

export const LOI_TEMPLATE_WALKTHROUGH_FORBIDDEN_CLAIMS = [
  "binding production sla",
  "production certified for all tenants",
  "all integrations are live",
  "live doordash",
  "live uber eats",
  "soc 2 certified",
  "enterprise sso included",
  "guaranteed roi",
  "thousands of customers",
  "existing design partners",
] as const;

export const LOI_TEMPLATE_WALKTHROUGH_DOC_REQUIRED_HEADINGS = [
  "When to walk through the LOI",
  "Pre-walkthrough checklist",
  "Eight walkthrough steps",
  "Exhibit A — modules to read aloud",
  "Forbidden LOI walkthrough claims",
  "Post-signature checklist",
] as const;

export type LoiTemplateWalkthroughDocAudit = {
  docPath: typeof LOI_TEMPLATE_WALKTHROUGH_DOC;
  missingHeadings: string[];
  stepCount: number;
  exhibitCount: number;
  passed: boolean;
};

export function listLoiTemplateWalkthroughStepIds(): LoiTemplateWalkthroughStepId[] {
  return LOI_TEMPLATE_WALKTHROUGH_STEPS.map((step) => step.id);
}

export function getLoiTemplateWalkthroughStepById(id: LoiTemplateWalkthroughStepId) {
  return LOI_TEMPLATE_WALKTHROUGH_STEPS.find((step) => step.id === id);
}

export function totalLoiTemplateWalkthroughDurationSec(): number {
  return LOI_TEMPLATE_WALKTHROUGH_STEPS.reduce((sum, step) => sum + step.durationSec, 0);
}

export function auditLoiTemplateWalkthroughDoc(
  root = process.cwd(),
): LoiTemplateWalkthroughDocAudit {
  const source = readFileSync(join(root, LOI_TEMPLATE_WALKTHROUGH_DOC), "utf8");
  const missingHeadings = LOI_TEMPLATE_WALKTHROUGH_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const stepCount = LOI_TEMPLATE_WALKTHROUGH_STEPS.filter((step) =>
    source.includes(`### ${step.id} —`),
  ).length;
  const exhibitCount = LOI_TEMPLATE_WALKTHROUGH_EXHIBITS.filter((ex) =>
    source.includes(`Exhibit ${ex}`),
  ).length;

  return {
    docPath: LOI_TEMPLATE_WALKTHROUGH_DOC,
    missingHeadings,
    stepCount,
    exhibitCount,
    passed:
      missingHeadings.length === 0 &&
      stepCount === LOI_TEMPLATE_WALKTHROUGH_STEPS.length &&
      exhibitCount === LOI_TEMPLATE_WALKTHROUGH_EXHIBITS.length,
  };
}

export type LoiTemplateWalkthroughLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintLoiTemplateWalkthroughCopy(
  source: string,
): LoiTemplateWalkthroughLint {
  const lower = source.toLowerCase();
  const forbiddenHits = LOI_TEMPLATE_WALKTHROUGH_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
