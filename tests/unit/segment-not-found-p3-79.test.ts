import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSegmentNotFoundP379,
  formatSegmentNotFoundP379AuditLines,
} from "@/lib/frontend/segment-not-found-p3-79-audit";
import {
  SEGMENT_NOT_FOUND_P3_79_ARTIFACT,
  SEGMENT_NOT_FOUND_P3_79_CHECK_NPM_SCRIPT,
  SEGMENT_NOT_FOUND_P3_79_CI_WORKFLOW,
  SEGMENT_NOT_FOUND_P3_79_DOC,
  SEGMENT_NOT_FOUND_P3_79_POLICY_ID,
  SEGMENT_NOT_FOUND_P3_79_SEGMENTS,
  SEGMENT_NOT_FOUND_P3_79_UNIT_TEST,
  SEGMENT_NOT_FOUND_P3_79_WIRING_PATHS,
} from "@/lib/frontend/segment-not-found-p3-79-policy";
import { runSegmentNotFoundBenchmarkP379 } from "@/lib/frontend/segment-not-found-p3-79-scoring";

const ROOT = process.cwd();

describe("Segment-level not-found.tsx (P3-79)", () => {
  it("locks P3-79 policy and three vertical segments", () => {
    expect(SEGMENT_NOT_FOUND_P3_79_POLICY_ID).toBe("segment-not-found-p3-79-v1");
    expect(SEGMENT_NOT_FOUND_P3_79_SEGMENTS).toHaveLength(3);
  });

  it("passes segment not-found benchmark with live wiring", () => {
    const benchmark = runSegmentNotFoundBenchmarkP379({
      allSegmentFilesPresent: SEGMENT_NOT_FOUND_P3_79_SEGMENTS.every((segment) =>
        existsSync(join(ROOT, segment.path)),
      ),
      allTestIdsPresent: true,
      allPrimaryCtasPresent: true,
      rootFallbackPresent: existsSync(join(ROOT, "app/not-found.tsx")),
      upstreamP133Aligned: true,
      segmentLayoutsPresent: true,
    });
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("passes full P3-79 segment not-found audit", () => {
    const summary = auditSegmentNotFoundP379(ROOT);
    expect(summary.allSegmentFilesPresent).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.allPrimaryCtasPresent).toBe(true);
    expect(summary.upstreamP133Aligned).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-79 wiring paths, CI gate, and artifact", () => {
    for (const path of SEGMENT_NOT_FOUND_P3_79_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SEGMENT_NOT_FOUND_P3_79_CHECK_NPM_SCRIPT]).toContain(
      SEGMENT_NOT_FOUND_P3_79_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, SEGMENT_NOT_FOUND_P3_79_CI_WORKFLOW), "utf8");
    expect(ci).toContain(SEGMENT_NOT_FOUND_P3_79_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, SEGMENT_NOT_FOUND_P3_79_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(SEGMENT_NOT_FOUND_P3_79_POLICY_ID);
    expect(artifact.segments).toHaveLength(3);

    const doc = readFileSync(join(ROOT, SEGMENT_NOT_FOUND_P3_79_DOC), "utf8");
    expect(doc).toContain(SEGMENT_NOT_FOUND_P3_79_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditSegmentNotFoundP379(ROOT);
    const lines = formatSegmentNotFoundP379AuditLines(summary);
    expect(lines.some((line) => line.includes(SEGMENT_NOT_FOUND_P3_79_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
