import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  TYPECHECK_SLICE_ERA15_BUNDLE_SCRIPT,
  TYPECHECK_SLICE_ERA15_CANONICAL_DOC_PATHS,
  TYPECHECK_SLICE_ERA15_CANONICAL_MARKERS,
  TYPECHECK_SLICE_ERA15_CI_SCRIPTS,
  TYPECHECK_SLICE_ERA15_OPS_DOC,
  TYPECHECK_SLICE_ERA15_POLICY_ID,
  TYPECHECK_SLICE_ERA15_QUALITY_STEP,
  TYPECHECK_SLICE_ERA15_SMOKE_NPM_SCRIPT,
  TYPECHECK_SLICE_ERA15_SMOKE_SCRIPT,
  TYPECHECK_SLICE_ERA15_UNIT_TESTS,
} from "@/lib/ci/typecheck-slice-era15-policy";
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

describe("typecheck slice era15 CI certification (live repo)", () => {
  it("locks era15 typecheck slice recert policy id", () => {
    expect(TYPECHECK_SLICE_ERA15_POLICY_ID).toBe("era15-typecheck-slice-recert-v1");
  });

  it("defines era15 scripts and chains cert into typecheck-slice bundle", () => {
    const scripts = readPackageScripts();
    for (const name of TYPECHECK_SLICE_ERA15_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[TYPECHECK_SLICE_ERA15_SMOKE_NPM_SCRIPT]).toContain(
      TYPECHECK_SLICE_ERA15_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:typecheck-slice:cert"]).toContain("typecheck-slice-era15-cert-live");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:typecheck-slice:cert")).toBe(true);
    for (const slice of TYPECHECK_SLICES) {
      expect(scripts[`typecheck:slice:${slice.id}`], slice.id).toContain(slice.tsconfig);
    }
    expect(scripts[TYPECHECK_SLICE_ERA15_BUNDLE_SCRIPT]).toBeTruthy();
  });

  it("keeps typecheck:full canonical in quality and parallel typecheck-slices job", () => {
    const workflow = readFileSync(join(ROOT, TYPECHECK_SLICE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(`${TYPECHECK_SLICE_CI_JOB_ID}:`);
    expect(workflow).toContain(TYPECHECK_SLICE_ERA15_BUNDLE_SCRIPT);
    expect(workflow).toContain(TYPECHECK_SLICE_ERA15_QUALITY_STEP);
    for (const slice of TYPECHECK_SLICES) {
      expect(existsSync(join(ROOT, slice.tsconfig)), slice.tsconfig).toBe(true);
    }
  });

  it("documents era15 typecheck slice recert in canonical docs", () => {
    const ops = readFileSync(join(ROOT, TYPECHECK_SLICE_ERA15_OPS_DOC), "utf8");
    for (const marker of TYPECHECK_SLICE_ERA15_CANONICAL_MARKERS) {
      expect(ops.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of TYPECHECK_SLICE_ERA15_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(TYPECHECK_SLICE_ERA15_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(TYPECHECK_SLICE_ERA15_POLICY_ID);
    for (const rel of TYPECHECK_SLICE_ERA15_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, TYPECHECK_SLICE_ERA15_SMOKE_SCRIPT))).toBe(true);
  });
});
