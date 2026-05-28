import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  TYPECHECK_SLICE_ERA16_BUNDLE_SCRIPT,
  TYPECHECK_SLICE_ERA16_CANONICAL_DOC_PATHS,
  TYPECHECK_SLICE_ERA16_CANONICAL_MARKERS,
  TYPECHECK_SLICE_ERA16_CERT_SCRIPT,
  TYPECHECK_SLICE_ERA16_CI_SCRIPTS,
  TYPECHECK_SLICE_ERA16_FULL_GATE,
  TYPECHECK_SLICE_ERA16_PARALLEL_JOB,
  TYPECHECK_SLICE_ERA16_POLICY_ID,
  TYPECHECK_SLICE_ERA16_REPORT_NPM_SCRIPT,
  TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT,
  TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT,
  TYPECHECK_SLICE_ERA16_UNIT_TESTS,
} from "@/lib/ci/typecheck-slice-era16-policy";
import {
  TYPECHECK_SLICE_CI_JOB_ID,
  TYPECHECK_SLICE_CI_WORKFLOW,
  TYPECHECK_SLICES,
} from "@/lib/ci/typecheck-slice-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("typecheck slice era16 CI certification (live repo)", () => {
  it("locks era16 typecheck slice reporting policy id", () => {
    expect(TYPECHECK_SLICE_ERA16_POLICY_ID).toBe("era16-typecheck-slice-report-v1");
  });

  it("defines era16 scripts and chains cert into typecheck-slice bundle", () => {
    const scripts = readPackageScripts();
    for (const name of TYPECHECK_SLICE_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[TYPECHECK_SLICE_ERA16_REPORT_NPM_SCRIPT]).toContain(
      TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT,
    );
    expect(scripts["cert:typecheck-slice-report-era16"]).toContain(TYPECHECK_SLICE_ERA16_CERT_SCRIPT);
    expect(scripts["test:ci:typecheck-slice:cert"]).toContain("test:ci:typecheck-slice-era16:cert");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:typecheck-slice:cert")).toBe(true);
    expect(scripts[TYPECHECK_SLICE_ERA16_BUNDLE_SCRIPT]).toContain(TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT);
  });

  it("keeps typecheck:full canonical in quality and parallel typecheck-slices job", () => {
    const workflow = readFileSync(join(ROOT, TYPECHECK_SLICE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(`${TYPECHECK_SLICE_ERA16_PARALLEL_JOB}:`);
    expect(workflow).toContain(TYPECHECK_SLICE_ERA16_BUNDLE_SCRIPT);
    expect(workflow).toContain(TYPECHECK_SLICE_ERA16_FULL_GATE);
    expect(TYPECHECK_SLICE_CI_JOB_ID).toBe(TYPECHECK_SLICE_ERA16_PARALLEL_JOB);
    for (const slice of TYPECHECK_SLICES) {
      expect(existsSync(join(ROOT, slice.tsconfig)), slice.tsconfig).toBe(true);
      expect(readPackageScripts()[`typecheck:slice:${slice.id}`]).toContain(slice.tsconfig);
    }
  });

  it("documents era16 typecheck slice reporting in canonical docs", () => {
    for (const rel of TYPECHECK_SLICE_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(TYPECHECK_SLICE_ERA16_POLICY_ID.toLowerCase());
      for (const marker of TYPECHECK_SLICE_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(TYPECHECK_SLICE_ERA16_POLICY_ID);
    for (const rel of TYPECHECK_SLICE_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, TYPECHECK_SLICE_ERA16_CERT_SCRIPT))).toBe(true);
  });

  it("writes summary artifact path constant", () => {
    expect(TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT).toBe("artifacts/typecheck-slice-summary.json");
  });
});
