import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditEuDataResidencyRoadmapDoc,
  auditEuDataResidencyRoadmapWiring,
} from "@/lib/compliance/eu-data-residency-roadmap-audit";
import {
  EU_DATA_RESIDENCY_HONESTY_MARKERS,
  EU_DATA_RESIDENCY_ROADMAP_DOC_PATH,
  EU_DATA_RESIDENCY_TIMELINE_PHASES,
} from "@/lib/compliance/eu-data-residency-roadmap-absolute-final-policy";
import { auditDesignFullPolishSlot } from "@/lib/design/absolute-final-design-full-polish-audit";
import {
  DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  getDesignFullPolishSlot,
} from "@/lib/design/absolute-final-design-full-polish-policy";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_DOC_DARK_MODE_MARKER,
  DESIGN_POLISH_DOC_HERO_MARKER,
  DESIGN_POLISH_DOC_REQUIRED_MARKERS,
  DESIGN_POLISH_DOC_STATUS_MARKER,
  DESIGN_POLISH_DOC_TIMELINE_MARKER,
  docUsesDesignPolishTokens,
} from "@/lib/design/absolute-final-design-polish-tokens";

const ROOT = process.cwd();
/** Absolute Final Task 117 — Design full polish for feature 87 EU data residency */
const TASK = 117;
const FEATURE = 87;

describe(`Design full polish — EU data residency (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 117 → feature 87 EU data residency roadmap", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("eu-data-residency-roadmap");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("doc");
    expect(slot?.targetPath).toBe(EU_DATA_RESIDENCY_ROADMAP_DOC_PATH);
  });

  it("applies design polish doc markers to the EU residency roadmap", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    for (const marker of DESIGN_POLISH_DOC_REQUIRED_MARKERS) {
      expect(doc, `missing ${marker}`).toContain(marker);
    }
    expect(docUsesDesignPolishTokens(doc)).toBe(true);
    expect(doc).toContain(DESIGN_POLISH_DOC_HERO_MARKER);
    expect(doc).toContain(DESIGN_POLISH_DOC_STATUS_MARKER);
    expect(doc).toContain(DESIGN_POLISH_DOC_TIMELINE_MARKER);
  });

  it("includes dark-mode-safe doc polish note for GitHub readers", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    expect(doc).toContain(DESIGN_POLISH_DOC_DARK_MODE_MARKER);
    expect(doc).toContain("GitHub light and dark themes");
    expect(doc).toContain("without custom HTML colors");
  });

  it("preserves hero honesty — no EU residency or GDPR certification claims", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    for (const marker of EU_DATA_RESIDENCY_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain("no EU-dedicated production region today");
    expect(doc).toContain("US-primary");
  });

  it("keeps timeline and gap analysis structure after visual polish", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    const docAudit = auditEuDataResidencyRoadmapDoc(doc);
    expect(docAudit.missingHeadings).toEqual([]);
    expect(docAudit.phaseCount).toBe(EU_DATA_RESIDENCY_TIMELINE_PHASES.length);
    expect(doc).toContain("## Gap analysis");
    expect(doc).toContain("## Human gate checklist");
    expect(doc).toContain("## Sales guidance");
  });

  it("wires design polish policy id in doc header comment", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    expect(doc).toContain(`design-polish: ${DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}`);
    expect(doc).toContain("task-117");
    expect(doc).toContain("feature-87");
  });

  it("passes base EU residency wiring audit after doc polish", () => {
    const wiring = auditEuDataResidencyRoadmapWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 117 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-02-eu-data-residency.test.ts",
    );
  });
});
