import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  TYPECHECK_SLICE_ERA11_CANONICAL_DOC_PATHS,
  TYPECHECK_SLICE_ERA11_CANONICAL_MARKERS,
  TYPECHECK_SLICE_ERA11_CI_SCRIPTS,
  TYPECHECK_SLICE_ERA11_NEW_SLICE_TSCONFIG,
  TYPECHECK_SLICE_ERA11_POLICY_ID,
  TYPECHECK_SLICE_ERA11_UNIT_TESTS,
} from "@/lib/ci/typecheck-slice-era11-policy";
import { TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT } from "@/lib/ci/typecheck-slice-era16-policy";
import {
  TYPECHECK_SLICE_CI_BUNDLE_SCRIPT,
  TYPECHECK_SLICES,
} from "@/lib/ci/typecheck-slice-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("typecheck slice era11 CI certification (live repo)", () => {
  it("locks era11 typecheck slice v3 policy id", () => {
    expect(TYPECHECK_SLICE_ERA11_POLICY_ID).toBe("era11-typecheck-slice-v3");
    expect(TYPECHECK_SLICES.map((s) => s.id)).toContain("platform-auth");
  });

  it("defines era11 slice scripts and chains cert into typecheck-slice bundle", () => {
    const scripts = readPackageScripts();
    for (const name of TYPECHECK_SLICE_ERA11_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:typecheck-slice:cert"]).toContain("typecheck-slice-era11-cert-live");
    expect(scripts["typecheck:slice:platform-auth"]).toContain(TYPECHECK_SLICE_ERA11_NEW_SLICE_TSCONFIG);
    expect(scripts[TYPECHECK_SLICE_CI_BUNDLE_SCRIPT]).toContain(TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT);
    expect(governanceBundlesIncludesCert(scripts, "test:ci:typecheck-slice:cert")).toBe(true);
  });

  it("has platform-auth tsconfig and era11 unit tests on disk", () => {
    expect(existsSync(join(ROOT, TYPECHECK_SLICE_ERA11_NEW_SLICE_TSCONFIG))).toBe(true);
    for (const rel of TYPECHECK_SLICE_ERA11_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("documents era11 typecheck slice in canonical docs", () => {
    for (const rel of TYPECHECK_SLICE_ERA11_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of TYPECHECK_SLICE_ERA11_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(TYPECHECK_SLICE_ERA11_POLICY_ID);
  });
});
