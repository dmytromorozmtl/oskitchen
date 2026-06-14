import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { KB_FAQ_ENTRIES, KB_FAQ_MIN_ENTRY_COUNT } from "@/lib/kb/kb-faq-content";
import { auditKbFaqSchemaContent } from "@/lib/kb/kb-faq-schema";
import {
  KB_SEO_FAQ_SCHEMA_P3_85_COMPONENT,
  KB_SEO_FAQ_SCHEMA_P3_85_DOC,
  KB_SEO_FAQ_SCHEMA_P3_85_FAQ_COMPONENT,
  KB_SEO_FAQ_SCHEMA_P3_85_KB_PAGES,
  KB_SEO_FAQ_SCHEMA_P3_85_MIN_ENTRIES,
  KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID,
  KB_SEO_FAQ_SCHEMA_P3_85_REQUIRED_TYPES,
  KB_SEO_FAQ_SCHEMA_P3_85_WIRING_PATHS,
} from "@/lib/marketing/kb-seo-faq-schema-p3-85-policy";

export type KbSeoFaqSchemaP385AuditSummary = {
  policyId: typeof KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  faqContentValid: boolean;
  faqEntryCount: number;
  kbHomeWired: boolean;
  visibleFaqSection: boolean;
  faqSchemaComponent: boolean;
  jsonLdTypesPresent: boolean;
  passed: boolean;
};

export function auditKbSeoFaqSchemaP385(root = process.cwd()): KbSeoFaqSchemaP385AuditSummary {
  const wiringComplete = KB_SEO_FAQ_SCHEMA_P3_85_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, KB_SEO_FAQ_SCHEMA_P3_85_DOC))) {
    const doc = readFileSync(join(root, KB_SEO_FAQ_SCHEMA_P3_85_DOC), "utf8");
    docWired =
      doc.includes(KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID) &&
      doc.includes("FAQPage") &&
      doc.includes("Featured Snippets");
  }

  const contentAudit = auditKbFaqSchemaContent();
  const faqContentValid = contentAudit.passed;
  const faqEntryCount = KB_FAQ_ENTRIES.length;

  let kbHomeWired = false;
  let visibleFaqSection = false;
  let componentUsesFaqSchema = false;
  if (existsSync(join(root, KB_SEO_FAQ_SCHEMA_P3_85_KB_PAGES))) {
    const kbPages = readFileSync(join(root, KB_SEO_FAQ_SCHEMA_P3_85_KB_PAGES), "utf8");
    kbHomeWired = kbPages.includes("KbFaqSection");
    visibleFaqSection = kbPages.includes('data-testid="kb-home"');
  }

  let faqSchemaComponent = false;
  let jsonLdTypesPresent = false;
  if (existsSync(join(root, KB_SEO_FAQ_SCHEMA_P3_85_FAQ_COMPONENT))) {
    const schemaOrg = readFileSync(join(root, KB_SEO_FAQ_SCHEMA_P3_85_FAQ_COMPONENT), "utf8");
    faqSchemaComponent = schemaOrg.includes("export function FAQSchema");
    jsonLdTypesPresent = KB_SEO_FAQ_SCHEMA_P3_85_REQUIRED_TYPES.every((type) =>
      schemaOrg.includes(type),
    );
  }

  if (existsSync(join(root, KB_SEO_FAQ_SCHEMA_P3_85_COMPONENT))) {
    const component = readFileSync(join(root, KB_SEO_FAQ_SCHEMA_P3_85_COMPONENT), "utf8");
    componentUsesFaqSchema =
      component.includes("FAQSchema") && component.includes('data-testid="kb-faq-section"');
  }

  const passed =
    wiringComplete &&
    docWired &&
    faqContentValid &&
    faqEntryCount >= KB_SEO_FAQ_SCHEMA_P3_85_MIN_ENTRIES &&
    faqEntryCount >= KB_FAQ_MIN_ENTRY_COUNT &&
    kbHomeWired &&
    visibleFaqSection &&
    faqSchemaComponent &&
    jsonLdTypesPresent &&
    componentUsesFaqSchema;

  return {
    policyId: KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID,
    wiringComplete,
    docWired,
    faqContentValid,
    faqEntryCount,
    kbHomeWired,
    visibleFaqSection,
    faqSchemaComponent,
    jsonLdTypesPresent,
    passed,
  };
}

export function formatKbSeoFaqSchemaP385AuditLines(
  summary: KbSeoFaqSchemaP385AuditSummary,
): string[] {
  return [
    `KB SEO FAQ schema (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `FAQ content valid: ${summary.faqContentValid ? "yes" : "no"}`,
    `FAQ entries: ${summary.faqEntryCount}`,
    `KB home wired: ${summary.kbHomeWired ? "yes" : "no"}`,
    `Visible FAQ section: ${summary.visibleFaqSection ? "yes" : "no"}`,
    `FAQSchema component: ${summary.faqSchemaComponent ? "yes" : "no"}`,
    `JSON-LD types: ${summary.jsonLdTypesPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
