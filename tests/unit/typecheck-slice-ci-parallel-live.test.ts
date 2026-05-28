import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT } from "@/lib/ci/typecheck-slice-era16-policy";
import {
  TYPECHECK_SLICE_CI_BUNDLE_SCRIPT,
  TYPECHECK_SLICE_CI_JOB_HEAP_MB,
  TYPECHECK_SLICE_CI_JOB_ID,
  TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID,
  TYPECHECK_SLICE_CI_QUALITY_STEP,
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

describe("typecheck slice parallel CI certification (live repo)", () => {
  it("locks era6 parallel slice CI policy", () => {
    expect(TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID).toBe("era6-typecheck-slice-ci-v1");
    expect(TYPECHECK_SLICE_CI_JOB_ID).toBe("typecheck-slices");
    expect(TYPECHECK_SLICE_CI_JOB_HEAP_MB).toBe(6144);
  });

  it("defines typecheck:ci:slices bundle over all strict slices", () => {
    const scripts = readPackageScripts();
    const bundle = scripts[TYPECHECK_SLICE_CI_BUNDLE_SCRIPT];
    expect(bundle).toBeTruthy();
    expect(bundle).toContain(TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT);
    for (const slice of TYPECHECK_SLICES) {
      expect(scripts[`typecheck:slice:${slice.id}`], slice.id).toContain(slice.tsconfig);
    }
  });

  it("wires parallel typecheck-slices job without replacing quality typecheck", () => {
    const workflowPath = join(ROOT, TYPECHECK_SLICE_CI_WORKFLOW);
    expect(existsSync(workflowPath)).toBe(true);
    const workflow = readFileSync(workflowPath, "utf8");
    expect(workflow).toContain(`${TYPECHECK_SLICE_CI_JOB_ID}:`);
    expect(workflow).toContain(TYPECHECK_SLICE_CI_BUNDLE_SCRIPT);
    expect(workflow).toContain(TYPECHECK_SLICE_CI_QUALITY_STEP);
    expect(workflow).toMatch(new RegExp(`${TYPECHECK_SLICE_CI_JOB_ID}:[\\s\\S]*max-old-space-size=${TYPECHECK_SLICE_CI_JOB_HEAP_MB}`));
  });

  it("includes parallel CI cert in typecheck-slice cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:typecheck-slice:cert"]).toContain(
      "typecheck-slice-ci-parallel-live.test.ts",
    );
  });

  it("documents parallel slice CI in devops readiness", () => {
    const devops = readFileSync(join(ROOT, "docs/devops-release-enterprise-readiness.md"), "utf8");
    expect(devops).toContain(TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID);
    expect(devops).toContain(TYPECHECK_SLICE_CI_JOB_ID);
    expect(devops).toContain(TYPECHECK_SLICE_CI_BUNDLE_SCRIPT);
    expect(devops).toMatch(/quality.*typecheck:full|typecheck:full.*canonical/i);
  });
});
