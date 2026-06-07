import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditEuDataResidencyRoadmapDoc,
  auditEuDataResidencyRoadmapWiring,
} from "@/lib/compliance/eu-data-residency-roadmap-audit";
import {
  EU_DATA_RESIDENCY_GAP_AREAS,
  EU_DATA_RESIDENCY_HONESTY_MARKERS,
  EU_DATA_RESIDENCY_ROADMAP_ABSOLUTE_FINAL_POLICY_ID,
  EU_DATA_RESIDENCY_ROADMAP_DOC_PATH,
  EU_DATA_RESIDENCY_TIMELINE_PHASES,
  EU_DATA_RESIDENCY_UPSTREAM_SOC2_POLICY_ID,
} from "@/lib/compliance/eu-data-residency-roadmap-absolute-final-policy";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 102 — QA full coverage for feature 87 EU data residency */
const TASK = 102;
const FEATURE = 87;

describe(`QA full coverage — EU data residency (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 102 → feature 87 EU data residency roadmap", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("eu-data-residency-roadmap");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/eu-data-residency-roadmap-absolute-final.test.ts");
    expect(EU_DATA_RESIDENCY_UPSTREAM_SOC2_POLICY_ID).toBe("soc2-roadmap-absolute-final-v1");
  });

  it("audits roadmap doc for all six timeline phases and gap areas", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    const docAudit = auditEuDataResidencyRoadmapDoc(doc);
    expect(docAudit.missingHeadings).toEqual([]);
    expect(docAudit.phaseCount).toBe(EU_DATA_RESIDENCY_TIMELINE_PHASES.length);
    expect(docAudit.gapAreaCount).toBe(EU_DATA_RESIDENCY_GAP_AREAS.length);
    for (const area of EU_DATA_RESIDENCY_GAP_AREAS) {
      expect(doc).toContain(area);
    }
  });

  it("flags incomplete doc when required phase headings are missing", () => {
    const partial = "## Timeline\nPhase 0 — Inventory\n";
    const docAudit = auditEuDataResidencyRoadmapDoc(partial);
    expect(docAudit.phaseCount).toBeLessThan(EU_DATA_RESIDENCY_TIMELINE_PHASES.length);
    expect(docAudit.missingHeadings.length).toBeGreaterThan(0);
  });

  it("documents honesty markers — no EU residency or GDPR certification claims", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    for (const marker of EU_DATA_RESIDENCY_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain("not GDPR certified");
    expect(doc).toContain("Not available");
  });

  it("wires human gate checklist before enterprise EU questionnaires", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    expect(doc).toContain("## Human gate checklist");
    expect(doc).toContain("no EU-dedicated production region");
    expect(doc).toContain("test:ci:eu-data-residency-roadmap:cert");
    expect(doc).toContain("Schrems III");
  });

  it("provides sales-safe responses for residency and GDPR buyer asks", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    expect(doc).toContain("## Sales guidance");
    expect(doc).toContain("Is data stored in the EU?");
    expect(doc).toContain("Not by default today.");
    expect(doc).toContain("Are you GDPR compliant?");
    expect(doc).toContain("not GDPR certified");
  });

  it("links engineering wiring to DSR service and forbidden-claims enforcement", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    expect(doc).toContain("data-deletion-request-service.ts");
    expect(doc).toContain("forbidden-claims-enforcement.test.ts");
    expect(doc).toContain(EU_DATA_RESIDENCY_ROADMAP_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("regional-tax-compliance.md");
  });

  it("passes base wiring audit and QA slot 102 audit gate", () => {
    const wiring = auditEuDataResidencyRoadmapWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-02-eu-data-residency.test.ts",
    );
  });
});
