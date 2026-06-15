import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditPilotWeek1RoadmapDoc,
  PILOT_WEEK1_ROADMAP_DOC,
  PILOT_WEEK1_ROADMAP_KPI_TARGETS,
  PILOT_WEEK1_ROADMAP_MILESTONES,
  PILOT_WEEK1_ROADMAP_POLICY_ID,
  PILOT_WEEK1_ROADMAP_REQUIRED_HEADINGS,
  PILOT_WEEK1_ROADMAP_ROUTES,
} from "@/lib/commercial/pilot-week1-roadmap-policy";

const ROOT = process.cwd();

describe("Pilot Week 1 roadmap (Task 28)", () => {
  it("locks absolute-final roadmap policy id and doc path", () => {
    expect(PILOT_WEEK1_ROADMAP_POLICY_ID).toBe("pilot-week1-roadmap-absolute-final-v1");
    expect(PILOT_WEEK1_ROADMAP_DOC).toBe("docs/pilot-week1-roadmap.md");
    expect(PILOT_WEEK1_ROADMAP_MILESTONES).toHaveLength(4);
    expect(PILOT_WEEK1_ROADMAP_ROUTES).toHaveLength(4);
  });

  it("passes audit on canonical pilot-week1-roadmap doc", () => {
    const source = readFileSync(join(ROOT, PILOT_WEEK1_ROADMAP_DOC), "utf8");
    const audit = auditPilotWeek1RoadmapDoc(source);

    expect(audit.missingHeadings, audit.missingHeadings.join("; ")).toEqual([]);
    expect(audit.milestoneCount).toBe(PILOT_WEEK1_ROADMAP_MILESTONES.length);
    expect(audit.routeCount).toBe(PILOT_WEEK1_ROADMAP_ROUTES.length);
    expect(audit.kpiCount).toBe(PILOT_WEEK1_ROADMAP_KPI_TARGETS.length);
    expect(audit.passed).toBe(true);
  });

  it("includes all required milestone headings and KPI targets", () => {
    const source = readFileSync(join(ROOT, PILOT_WEEK1_ROADMAP_DOC), "utf8");
    for (const heading of PILOT_WEEK1_ROADMAP_REQUIRED_HEADINGS) {
      expect(source).toContain(heading);
    }
    for (const milestone of PILOT_WEEK1_ROADMAP_MILESTONES) {
      expect(source).toContain(milestone);
    }
    for (const kpi of PILOT_WEEK1_ROADMAP_KPI_TARGETS) {
      expect(source).toContain(kpi);
    }
  });

  it("links to pilot-week1-checklist and commercial runbook", () => {
    const source = readFileSync(join(ROOT, PILOT_WEEK1_ROADMAP_DOC), "utf8");
    expect(source).toContain("pilot-week1-checklist.md");
    expect(source).toContain("commercial-pilot-runbook.md");
    expect(source).toContain("smoke:pilot-metrics-baseline");
  });
});
