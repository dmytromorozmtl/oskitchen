import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditSoc2RoadmapDoc, auditSoc2RoadmapWiring } from "@/lib/compliance/soc2-roadmap-audit";
import {
  SOC2_ROADMAP_ABSOLUTE_FINAL_POLICY_ID,
  SOC2_ROADMAP_CI_SCRIPTS,
  SOC2_ROADMAP_DOC_PATH,
  SOC2_ROADMAP_TIMELINE_PHASES,
  SOC2_ROADMAP_UNIT_TEST,
  SOC2_ROADMAP_UPSTREAM_ASSESSMENT_POLICY_ID,
} from "@/lib/compliance/soc2-roadmap-absolute-final-policy";

const ROOT = process.cwd();

describe("SOC2 roadmap with timeline (Absolute Final Task 66)", () => {
  it("locks absolute final policy extending readiness assessment", () => {
    expect(SOC2_ROADMAP_ABSOLUTE_FINAL_POLICY_ID).toBe("soc2-roadmap-absolute-final-v1");
    expect(SOC2_ROADMAP_UPSTREAM_ASSESSMENT_POLICY_ID).toBe("soc2-readiness-assessment-v1");
    expect(SOC2_ROADMAP_DOC_PATH).toBe("docs/soc2-roadmap-with-timeline.md");
    expect(SOC2_ROADMAP_TIMELINE_PHASES).toHaveLength(6);
  });

  it("documents timeline, gap analysis, and honesty rules", () => {
    const doc = readFileSync(join(ROOT, SOC2_ROADMAP_DOC_PATH), "utf8");
    const audit = auditSoc2RoadmapDoc(doc);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.phaseCount).toBe(6);
    expect(audit.gapAreaCount).toBe(5);
    expect(doc).toContain("soc2-readiness-assessment.md");
    expect(doc).toContain("Not certified");
  });

  it("passes wiring audit", () => {
    const audit = auditSoc2RoadmapWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("aligns with readiness assessment no-certification stance", () => {
    const roadmap = readFileSync(join(ROOT, SOC2_ROADMAP_DOC_PATH), "utf8");
    const assessment = readFileSync(join(ROOT, "docs/soc2-readiness-assessment.md"), "utf8");
    expect(roadmap).toMatch(/Not certified/i);
    expect(assessment).toMatch(/Not certified/i);
    expect(roadmap).toContain("~35%");
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of SOC2_ROADMAP_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(SOC2_ROADMAP_UNIT_TEST).toBe("tests/unit/soc2-roadmap-absolute-final.test.ts");
  });
});
