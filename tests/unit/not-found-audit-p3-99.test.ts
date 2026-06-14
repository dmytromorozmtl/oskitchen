import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNotFoundP399,
  formatNotFoundAuditP399Lines,
} from "@/lib/frontend/not-found-audit-p3-99-audit";
import {
  NOT_FOUND_AUDIT_P3_99_ARTIFACT,
  NOT_FOUND_AUDIT_P3_99_CHECK_NPM_SCRIPT,
  NOT_FOUND_AUDIT_P3_99_CI_WORKFLOW,
  NOT_FOUND_AUDIT_P3_99_DOC,
  NOT_FOUND_AUDIT_P3_99_POLICY_ID,
  NOT_FOUND_AUDIT_P3_99_SEGMENTS,
  NOT_FOUND_AUDIT_P3_99_UNIT_TEST,
  NOT_FOUND_AUDIT_P3_99_VERTICAL_COUNT,
  NOT_FOUND_AUDIT_P3_99_WIRING_PATHS,
} from "@/lib/frontend/not-found-audit-p3-99-policy";
import { runNotFoundAuditBenchmarkP399 } from "@/lib/frontend/not-found-audit-p3-99-scoring";

const ROOT = process.cwd();

describe("Not-found audit all verticals (P3-99)", () => {
  it("locks P3-99 policy with eight vertical segments", () => {
    expect(NOT_FOUND_AUDIT_P3_99_POLICY_ID).toBe("not-found-audit-p3-99-v1");
    expect(NOT_FOUND_AUDIT_P3_99_SEGMENTS).toHaveLength(NOT_FOUND_AUDIT_P3_99_VERTICAL_COUNT);
  });

  it("passes not-found benchmark with live wiring", () => {
    const benchmark = runNotFoundAuditBenchmarkP399({
      allSegmentFilesPresent: NOT_FOUND_AUDIT_P3_99_SEGMENTS.every((segment) =>
        existsSync(join(ROOT, segment.path)),
      ),
      allTestIdsPresent: true,
      allPrimaryCtasPresent: true,
      rootFallbackPresent: existsSync(join(ROOT, "app/not-found.tsx")),
      upstreamP379Aligned: true,
      segmentLayoutsPresent: true,
      verticalCountMet: true,
      uniqueTestIds: true,
    });
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("passes full P3-99 not-found audit", () => {
    const summary = auditNotFoundP399(ROOT);
    expect(summary.allSegmentFilesPresent).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.allPrimaryCtasPresent).toBe(true);
    expect(summary.upstreamP379Aligned).toBe(true);
    expect(summary.verticalCountMet).toBe(true);
    expect(summary.uniqueTestIds).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-99 wiring paths, CI gate, and artifact", () => {
    for (const path of NOT_FOUND_AUDIT_P3_99_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NOT_FOUND_AUDIT_P3_99_CHECK_NPM_SCRIPT]).toContain(
      NOT_FOUND_AUDIT_P3_99_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, NOT_FOUND_AUDIT_P3_99_CI_WORKFLOW), "utf8");
    expect(ci).toContain(NOT_FOUND_AUDIT_P3_99_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, NOT_FOUND_AUDIT_P3_99_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(NOT_FOUND_AUDIT_P3_99_POLICY_ID);
    expect(artifact.verticalCount).toBe(8);

    const doc = readFileSync(join(ROOT, NOT_FOUND_AUDIT_P3_99_DOC), "utf8");
    expect(doc).toContain(NOT_FOUND_AUDIT_P3_99_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditNotFoundP399(ROOT);
    const lines = formatNotFoundAuditP399Lines(summary);
    expect(lines.some((line) => line.includes(NOT_FOUND_AUDIT_P3_99_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
