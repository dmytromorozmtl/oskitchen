import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  NOT_FOUND_AUDIT_P3_99_ARTIFACT,
  NOT_FOUND_AUDIT_P3_99_POLICY_ID,
  NOT_FOUND_AUDIT_P3_99_ROOT_FALLBACK,
  NOT_FOUND_AUDIT_P3_99_SEGMENTS,
  NOT_FOUND_AUDIT_P3_99_UPSTREAM_ARTIFACT,
  NOT_FOUND_AUDIT_P3_99_UPSTREAM_POLICY,
  NOT_FOUND_AUDIT_P3_99_VERTICAL_COUNT,
  NOT_FOUND_AUDIT_P3_99_WIRING_PATHS,
} from "@/lib/frontend/not-found-audit-p3-99-policy";
import { runNotFoundAuditBenchmarkP399 } from "@/lib/frontend/not-found-audit-p3-99-scoring";

export type NotFoundAuditP399Summary = {
  policyId: typeof NOT_FOUND_AUDIT_P3_99_POLICY_ID;
  wiringComplete: boolean;
  allSegmentFilesPresent: boolean;
  allTestIdsPresent: boolean;
  allPrimaryCtasPresent: boolean;
  rootFallbackPresent: boolean;
  upstreamP379Aligned: boolean;
  segmentLayoutsPresent: boolean;
  verticalCountMet: boolean;
  uniqueTestIds: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

function readSource(root: string, rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

export function auditNotFoundP399(root = process.cwd()): NotFoundAuditP399Summary {
  const wiringComplete = NOT_FOUND_AUDIT_P3_99_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const allSegmentFilesPresent = NOT_FOUND_AUDIT_P3_99_SEGMENTS.every((segment) =>
    existsSync(join(root, segment.path)),
  );

  const allTestIdsPresent = NOT_FOUND_AUDIT_P3_99_SEGMENTS.every((segment) => {
    const source = readSource(root, segment.path);
    return source.includes(`data-testid="${segment.testId}"`);
  });

  const allPrimaryCtasPresent = NOT_FOUND_AUDIT_P3_99_SEGMENTS.every((segment) => {
    const source = readSource(root, segment.path);
    return source.includes(`href="${segment.primaryHref}"`);
  });

  const rootFallbackPresent = existsSync(join(root, NOT_FOUND_AUDIT_P3_99_ROOT_FALLBACK));

  let upstreamP379Aligned = false;
  const upstreamPath = join(root, NOT_FOUND_AUDIT_P3_99_UPSTREAM_ARTIFACT);
  if (existsSync(upstreamPath)) {
    const upstream = JSON.parse(readFileSync(upstreamPath, "utf8")) as {
      policyId?: string;
      segments?: Array<{ id: string; path: string; testId: string; primaryHref: string }>;
    };
    const coreSegments = NOT_FOUND_AUDIT_P3_99_SEGMENTS.filter((segment) =>
      ["dashboard", "vendor", "storefront"].includes(segment.id),
    );
    upstreamP379Aligned =
      upstream.policyId === NOT_FOUND_AUDIT_P3_99_UPSTREAM_POLICY &&
      Array.isArray(upstream.segments) &&
      coreSegments.every((segment) =>
        upstream.segments!.some(
          (entry) =>
            entry.id === segment.id &&
            entry.path === segment.path &&
            entry.testId === segment.testId &&
            entry.primaryHref === segment.primaryHref,
        ),
      );
  }

  const segmentLayoutsPresent = NOT_FOUND_AUDIT_P3_99_SEGMENTS.filter(
    (segment) => segment.layoutPath,
  ).every((segment) => existsSync(join(root, segment.layoutPath!)));

  const verticalCountMet = NOT_FOUND_AUDIT_P3_99_SEGMENTS.length === NOT_FOUND_AUDIT_P3_99_VERTICAL_COUNT;

  const testIds = NOT_FOUND_AUDIT_P3_99_SEGMENTS.map((segment) => segment.testId);
  const uniqueTestIds = new Set(testIds).size === testIds.length;

  const benchmark = runNotFoundAuditBenchmarkP399({
    allSegmentFilesPresent,
    allTestIdsPresent,
    allPrimaryCtasPresent,
    rootFallbackPresent,
    upstreamP379Aligned,
    segmentLayoutsPresent,
    verticalCountMet,
    uniqueTestIds,
  });

  const artifactPresent = existsSync(join(root, NOT_FOUND_AUDIT_P3_99_ARTIFACT));

  const passed = wiringComplete && benchmark.passed && artifactPresent;

  return {
    policyId: NOT_FOUND_AUDIT_P3_99_POLICY_ID,
    wiringComplete,
    allSegmentFilesPresent,
    allTestIdsPresent,
    allPrimaryCtasPresent,
    rootFallbackPresent,
    upstreamP379Aligned,
    segmentLayoutsPresent,
    verticalCountMet,
    uniqueTestIds,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatNotFoundAuditP399Lines(summary: NotFoundAuditP399Summary): string[] {
  return [
    `Not-found audit all verticals (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Vertical files (${NOT_FOUND_AUDIT_P3_99_VERTICAL_COUNT}): ${summary.allSegmentFilesPresent ? "yes" : "no"}`,
    `Test IDs: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Primary CTAs: ${summary.allPrimaryCtasPresent ? "yes" : "no"}`,
    `Root fallback: ${summary.rootFallbackPresent ? "yes" : "no"}`,
    `P3-79 aligned: ${summary.upstreamP379Aligned ? "yes" : "no"}`,
    `Vertical layouts: ${summary.segmentLayoutsPresent ? "yes" : "no"}`,
    `Unique test IDs: ${summary.uniqueTestIds ? "yes" : "no"}`,
    `Benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
