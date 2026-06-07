import { describe, expect, it } from "vitest";

import { auditEuDataResidencyRoadmapWiring } from "@/lib/compliance/eu-data-residency-roadmap-audit";
import {
  EU_DATA_RESIDENCY_CI_SCRIPTS,
  EU_DATA_RESIDENCY_GAP_AREAS,
  EU_DATA_RESIDENCY_ROADMAP_ABSOLUTE_FINAL_POLICY_ID,
  EU_DATA_RESIDENCY_ROADMAP_DOC_PATH,
  EU_DATA_RESIDENCY_TIMELINE_PHASES,
  EU_DATA_RESIDENCY_UNIT_TEST,
} from "@/lib/compliance/eu-data-residency-roadmap-absolute-final-policy";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

describe("EU data residency roadmap (Absolute Final Task 87)", () => {
  it("locks absolute final policy and doc path", () => {
    expect(EU_DATA_RESIDENCY_ROADMAP_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "eu-data-residency-roadmap-absolute-final-v1",
    );
    expect(EU_DATA_RESIDENCY_ROADMAP_DOC_PATH).toBe("docs/eu-data-residency-roadmap.md");
    expect(EU_DATA_RESIDENCY_TIMELINE_PHASES).toHaveLength(6);
    expect(EU_DATA_RESIDENCY_GAP_AREAS).toHaveLength(6);
  });

  it("documents six phases and honest US-primary posture", () => {
    const doc = readFileSync(join(ROOT, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
    expect(doc).toContain("eu-data-residency-roadmap-absolute-final-v1");
    expect(doc).toContain("Phase 0 — Inventory");
    expect(doc).toContain("Phase 5 — General availability");
    expect(doc).toContain("US-primary");
    expect(doc).toContain("Do **not** claim");
  });

  it("passes wiring audit", () => {
    const audit = auditEuDataResidencyRoadmapWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.phaseCount).toBe(6);
    expect(audit.gapAreaCount).toBe(6);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of EU_DATA_RESIDENCY_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(EU_DATA_RESIDENCY_UNIT_TEST).toBe(
      "tests/unit/eu-data-residency-roadmap-absolute-final.test.ts",
    );
  });
});
