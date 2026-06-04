import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-23 — objection handling policy (twelve core sales objections).
 *
 * @see docs/objection-handling.md
 * @see docs/sales-limitation-sheet.md
 */

export const OBJECTION_HANDLING_POLICY_ID = "objection-handling-mkt23-v1" as const;

export const OBJECTION_HANDLING_DOC = "docs/objection-handling.md" as const;

export const OBJECTION_HANDLING_FRAMEWORK = "LAER" as const;

/** Twelve canonical objections — ids O1–O12. */
export const OBJECTION_HANDLING_CORE = [
  { id: "O1", slug: "toast-square-lightspeed", label: "We already use Toast / Square / Lightspeed" },
  { id: "O2", slug: "shopify-woocommerce", label: "We already use Shopify / WooCommerce" },
  { id: "O3", slug: "square-is-free", label: "Square is free — why pay?" },
  { id: "O4", slug: "no-customers", label: "You have no customers / no proof" },
  { id: "O5", slug: "integrations-skipped", label: "Integrations aren't live / SKIPPED" },
  { id: "O6", slug: "offline-pos", label: "We need offline POS" },
  { id: "O7", slug: "sso-soc2", label: "We need SSO / SOC 2" },
  { id: "O8", slug: "staff-adoption", label: "Staff won't learn another system" },
  { id: "O9", slug: "too-complex", label: "Too complex / too many features" },
  { id: "O10", slug: "aggregators-enough", label: "Uber Eats / DoorDash enough" },
  { id: "O11", slug: "ai-hype", label: "We don't trust AI" },
  { id: "O12", slug: "spreadsheets-fine", label: "Spreadsheets work fine" },
] as const;

export type ObjectionHandlingCoreId = (typeof OBJECTION_HANDLING_CORE)[number]["id"];

export const OBJECTION_HANDLING_PRIMARY_CTA = {
  label: "Book follow-up demo",
  href: "/book-demo?utm_source=objection&utm_medium=sales&utm_campaign=objection-handling-mkt23",
} as const;

export const OBJECTION_HANDLING_FORBIDDEN_RESPONSES = [
  "thousands of customers",
  "all integrations are live",
  "we beat toast on everything",
  "guaranteed roi in 90 days",
  "soc 2 certified",
  "uber eats official partner",
] as const;

export const OBJECTION_HANDLING_DOC_REQUIRED_HEADINGS = [
  "Response framework (LAER)",
  "Twelve core objections",
  "Quick reference matrix",
  "Forbidden responses (when handling objections)",
  "CRM logging",
] as const;

export type ObjectionHandlingDocAudit = {
  docPath: typeof OBJECTION_HANDLING_DOC;
  missingHeadings: string[];
  objectionCount: number;
  passed: boolean;
};

export function listObjectionHandlingCoreIds(): ObjectionHandlingCoreId[] {
  return OBJECTION_HANDLING_CORE.map((entry) => entry.id);
}

export function getObjectionById(id: ObjectionHandlingCoreId) {
  return OBJECTION_HANDLING_CORE.find((entry) => entry.id === id);
}

export function auditObjectionHandlingDoc(root = process.cwd()): ObjectionHandlingDocAudit {
  const source = readFileSync(join(root, OBJECTION_HANDLING_DOC), "utf8");
  const missingHeadings = OBJECTION_HANDLING_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: OBJECTION_HANDLING_DOC,
    missingHeadings,
    objectionCount: OBJECTION_HANDLING_CORE.length,
    passed: missingHeadings.length === 0 && OBJECTION_HANDLING_CORE.length === 12,
  };
}

export type ObjectionHandlingLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintObjectionHandlingCopy(source: string): ObjectionHandlingLint {
  const lower = source.toLowerCase();
  const forbiddenHits = OBJECTION_HANDLING_FORBIDDEN_RESPONSES.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
