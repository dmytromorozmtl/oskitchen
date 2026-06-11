import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDemoPageImprovement,
  formatDemoPageImprovementAuditLines,
} from "@/lib/marketing/demo-page-improvement-audit";
import {
  DEMO_PAGE_IMPROVEMENT_SANDBOX_STOPS,
  DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_SEGMENTS,
} from "@/lib/marketing/demo-page-improvement-content";
import {
  DEMO_PAGE_IMPROVEMENT_CI_WORKFLOW,
  DEMO_PAGE_IMPROVEMENT_DOC,
  DEMO_PAGE_IMPROVEMENT_HEADLINE,
  DEMO_PAGE_IMPROVEMENT_NPM_SCRIPT,
  DEMO_PAGE_IMPROVEMENT_POLICY_ID,
  DEMO_PAGE_IMPROVEMENT_ROUTE,
  DEMO_PAGE_IMPROVEMENT_SANDBOX_STOP_COUNT,
  DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID,
  DEMO_PAGE_IMPROVEMENT_UNIT_TEST,
  DEMO_PAGE_IMPROVEMENT_VIDEO_SEGMENT_COUNT,
  DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_TEST_ID,
} from "@/lib/marketing/demo-page-improvement-policy";

const ROOT = process.cwd();

describe("Demo page improvement (P1-83)", () => {
  it("locks policy id, route, and five sandbox stops + video segments", () => {
    expect(DEMO_PAGE_IMPROVEMENT_POLICY_ID).toBe("demo-page-improvement-p1-83-v1");
    expect(DEMO_PAGE_IMPROVEMENT_ROUTE).toBe("/demo");
    expect(DEMO_PAGE_IMPROVEMENT_HEADLINE).toContain("interactive sandbox");
    expect(DEMO_PAGE_IMPROVEMENT_SANDBOX_STOP_COUNT).toBe(5);
    expect(DEMO_PAGE_IMPROVEMENT_VIDEO_SEGMENT_COUNT).toBe(5);
    expect(DEMO_PAGE_IMPROVEMENT_SANDBOX_STOPS).toHaveLength(5);
    expect(DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_SEGMENTS).toHaveLength(5);
  });

  it("passes full demo page improvement audit", () => {
    const summary = auditDemoPageImprovement(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.sandboxStopCountCorrect).toBe(true);
    expect(summary.videoSegmentCountCorrect).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships guided tour section with sandbox and video test ids", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/demo-guided-tour-section.tsx"),
      "utf8",
    );
    expect(source).toContain("DemoGuidedTourSection");
    expect(source).toContain("DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID");
    expect(source).toContain("DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_TEST_ID");
    expect(source).toContain("demo-sandbox-stop-${stop.id}");
    expect(source).toContain("demo-video-tour-segment-${segment.id}");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, DEMO_PAGE_IMPROVEMENT_DOC))).toBe(true);
    expect(existsSync(join(ROOT, DEMO_PAGE_IMPROVEMENT_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DEMO_PAGE_IMPROVEMENT_NPM_SCRIPT]).toContain(
      "audit-demo-page-improvement.ts",
    );
    expect(pkg.scripts?.["test:ci:demo-page-improvement"]).toContain(
      DEMO_PAGE_IMPROVEMENT_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, DEMO_PAGE_IMPROVEMENT_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:demo-page-improvement");
  });

  it("formats audit lines", () => {
    const summary = auditDemoPageImprovement(ROOT);
    const lines = formatDemoPageImprovementAuditLines(summary);
    expect(lines.some((line) => line.includes(DEMO_PAGE_IMPROVEMENT_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
