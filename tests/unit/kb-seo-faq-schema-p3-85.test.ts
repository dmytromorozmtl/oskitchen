import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { KB_FAQ_ENTRIES, KB_FAQ_MIN_ENTRY_COUNT } from "@/lib/kb/kb-faq-content";
import { auditKbFaqSchemaContent, buildKbFaqPageJsonLd } from "@/lib/kb/kb-faq-schema";
import {
  auditKbSeoFaqSchemaP385,
  formatKbSeoFaqSchemaP385AuditLines,
} from "@/lib/marketing/kb-seo-faq-schema-p3-85-audit";
import {
  KB_SEO_FAQ_SCHEMA_P3_85_ARTIFACT,
  KB_SEO_FAQ_SCHEMA_P3_85_CHECK_NPM_SCRIPT,
  KB_SEO_FAQ_SCHEMA_P3_85_CI_WORKFLOW,
  KB_SEO_FAQ_SCHEMA_P3_85_DOC,
  KB_SEO_FAQ_SCHEMA_P3_85_MIN_ENTRIES,
  KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID,
  KB_SEO_FAQ_SCHEMA_P3_85_UNIT_TEST,
  KB_SEO_FAQ_SCHEMA_P3_85_WIRING_PATHS,
} from "@/lib/marketing/kb-seo-faq-schema-p3-85-policy";

const ROOT = process.cwd();

describe("KB SEO FAQ schema (P3-85)", () => {
  it("locks policy id and minimum FAQ entry count", () => {
    expect(KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID).toBe("kb-seo-faq-schema-p3-85-v1");
    expect(KB_FAQ_ENTRIES.length).toBeGreaterThanOrEqual(KB_SEO_FAQ_SCHEMA_P3_85_MIN_ENTRIES);
    expect(KB_FAQ_MIN_ENTRY_COUNT).toBe(8);
  });

  it("builds valid FAQPage JSON-LD", () => {
    const jsonLd = buildKbFaqPageJsonLd("en");
    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity).toHaveLength(KB_FAQ_ENTRIES.length);
    expect(jsonLd.mainEntity[0]?.["@type"]).toBe("Question");
    expect(jsonLd.mainEntity[0]?.acceptedAnswer["@type"]).toBe("Answer");
  });

  it("passes FAQ content audit", () => {
    const audit = auditKbFaqSchemaContent();
    expect(audit.passed, audit.failures.join("; ")).toBe(true);
    expect(audit.entryCount).toBe(8);
  });

  it("passes full P3-85 KB SEO FAQ schema audit", () => {
    const summary = auditKbSeoFaqSchemaP385(ROOT);
    expect(summary.faqContentValid).toBe(true);
    expect(summary.kbHomeWired).toBe(true);
    expect(summary.faqSchemaComponent).toBe(true);
    expect(summary.jsonLdTypesPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-85 wiring paths, CI gate, and artifact", () => {
    for (const path of KB_SEO_FAQ_SCHEMA_P3_85_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[KB_SEO_FAQ_SCHEMA_P3_85_CHECK_NPM_SCRIPT]).toContain(
      KB_SEO_FAQ_SCHEMA_P3_85_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, KB_SEO_FAQ_SCHEMA_P3_85_CI_WORKFLOW), "utf8");
    expect(ci).toContain(KB_SEO_FAQ_SCHEMA_P3_85_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, KB_SEO_FAQ_SCHEMA_P3_85_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID);
    expect(artifact.schemaType).toBe("FAQPage");
    expect(artifact.faqEntryCount).toBe(8);

    const doc = readFileSync(join(ROOT, KB_SEO_FAQ_SCHEMA_P3_85_DOC), "utf8");
    expect(doc).toContain(KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditKbSeoFaqSchemaP385(ROOT);
    const lines = formatKbSeoFaqSchemaP385AuditLines(summary);
    expect(lines.some((line) => line.includes(KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
