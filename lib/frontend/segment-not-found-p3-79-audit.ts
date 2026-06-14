import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SEGMENT_NOT_FOUND_P3_79_ARTIFACT,
  SEGMENT_NOT_FOUND_P3_79_POLICY_ID,
  SEGMENT_NOT_FOUND_P3_79_ROOT_FALLBACK,
  SEGMENT_NOT_FOUND_P3_79_SEGMENTS,
  SEGMENT_NOT_FOUND_P3_79_UPSTREAM_ARTIFACT,
  SEGMENT_NOT_FOUND_P3_79_UPSTREAM_POLICY,
  SEGMENT_NOT_FOUND_P3_79_WIRING_PATHS,
} from "@/lib/frontend/segment-not-found-p3-79-policy";
import { runSegmentNotFoundBenchmarkP379 } from "@/lib/frontend/segment-not-found-p3-79-scoring";

export type SegmentNotFoundP379AuditSummary = {
  policyId: typeof SEGMENT_NOT_FOUND_P3_79_POLICY_ID;
  wiringComplete: boolean;
  allSegmentFilesPresent: boolean;
  allTestIdsPresent: boolean;
  allPrimaryCtasPresent: boolean;
  rootFallbackPresent: boolean;
  upstreamP133Aligned: boolean;
  segmentLayoutsPresent: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

function readSource(root: string, rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

export function auditSegmentNotFoundP379(root = process.cwd()): SegmentNotFoundP379AuditSummary {
  const wiringComplete = SEGMENT_NOT_FOUND_P3_79_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const allSegmentFilesPresent = SEGMENT_NOT_FOUND_P3_79_SEGMENTS.every((segment) =>
    existsSync(join(root, segment.path)),
  );

  const allTestIdsPresent = SEGMENT_NOT_FOUND_P3_79_SEGMENTS.every((segment) => {
    const source = readSource(root, segment.path);
    return source.includes(`data-testid="${segment.testId}"`);
  });

  const allPrimaryCtasPresent = SEGMENT_NOT_FOUND_P3_79_SEGMENTS.every((segment) => {
    const source = readSource(root, segment.path);
    return source.includes(`href="${segment.primaryHref}"`);
  });

  const rootFallbackPresent = existsSync(join(root, SEGMENT_NOT_FOUND_P3_79_ROOT_FALLBACK));

  let upstreamP133Aligned = false;
  const upstreamPath = join(root, SEGMENT_NOT_FOUND_P3_79_UPSTREAM_ARTIFACT);
  if (existsSync(upstreamPath)) {
    const upstream = JSON.parse(readFileSync(upstreamPath, "utf8")) as {
      policyId?: string;
      segments?: Array<{ id: string; path: string; testId: string; primaryHref: string }>;
    };
    upstreamP133Aligned =
      upstream.policyId === SEGMENT_NOT_FOUND_P3_79_UPSTREAM_POLICY &&
      Array.isArray(upstream.segments) &&
      upstream.segments.length === SEGMENT_NOT_FOUND_P3_79_SEGMENTS.length &&
      SEGMENT_NOT_FOUND_P3_79_SEGMENTS.every((segment) =>
        upstream.segments!.some(
          (entry) =>
            entry.id === segment.id &&
            entry.path === segment.path &&
            entry.testId === segment.testId &&
            entry.primaryHref === segment.primaryHref,
        ),
      );
  }

  const segmentLayoutsPresent = SEGMENT_NOT_FOUND_P3_79_SEGMENTS.filter(
    (segment) => segment.layoutPath,
  ).every((segment) => existsSync(join(root, segment.layoutPath!)));

  const benchmark = runSegmentNotFoundBenchmarkP379({
    allSegmentFilesPresent,
    allTestIdsPresent,
    allPrimaryCtasPresent,
    rootFallbackPresent,
    upstreamP133Aligned,
    segmentLayoutsPresent,
  });

  const artifactPresent = existsSync(join(root, SEGMENT_NOT_FOUND_P3_79_ARTIFACT));

  const passed = wiringComplete && benchmark.passed && artifactPresent;

  return {
    policyId: SEGMENT_NOT_FOUND_P3_79_POLICY_ID,
    wiringComplete,
    allSegmentFilesPresent,
    allTestIdsPresent,
    allPrimaryCtasPresent,
    rootFallbackPresent,
    upstreamP133Aligned,
    segmentLayoutsPresent,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatSegmentNotFoundP379AuditLines(
  summary: SegmentNotFoundP379AuditSummary,
): string[] {
  return [
    `Segment-level not-found (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Segment files: ${summary.allSegmentFilesPresent ? "yes" : "no"}`,
    `Test IDs: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Primary CTAs: ${summary.allPrimaryCtasPresent ? "yes" : "no"}`,
    `Root fallback: ${summary.rootFallbackPresent ? "yes" : "no"}`,
    `P1-33 aligned: ${summary.upstreamP133Aligned ? "yes" : "no"}`,
    `Segment layouts: ${summary.segmentLayoutsPresent ? "yes" : "no"}`,
    `Benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
