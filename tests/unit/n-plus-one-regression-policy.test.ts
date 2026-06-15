import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  N_PLUS_ONE_REGRESSION_CI_SCRIPTS,
  N_PLUS_ONE_REGRESSION_HARNESS_PATH,
  N_PLUS_ONE_REGRESSION_P0_SPEC_PATH,
  N_PLUS_ONE_REGRESSION_POLICY_ID,
  N_PLUS_ONE_REGRESSION_SPEC_PATH,
  N_PLUS_ONE_REGRESSION_TARGET_COUNT,
  nPlusOneRegressionTargetIds,
} from "@/lib/testing/n-plus-one-regression-policy";

const ROOT = process.cwd();

describe("N+1 regression policy wiring (Absolute Final Task 53)", () => {
  it("locks eight guarded service targets", () => {
    expect(N_PLUS_ONE_REGRESSION_POLICY_ID).toBe("n-plus-one-regression-absolute-final-v1");
    expect(N_PLUS_ONE_REGRESSION_TARGET_COUNT).toBe(8);
    expect(nPlusOneRegressionTargetIds()).toHaveLength(8);
  });

  it("ships query-count harness and regression spec", () => {
    const harness = readFileSync(join(ROOT, N_PLUS_ONE_REGRESSION_HARNESS_PATH), "utf8");
    expect(harness).toContain("createPrismaCallTracker");
    expect(harness).toContain("assertSubLinearQueryGrowth");

    const spec = readFileSync(join(ROOT, N_PLUS_ONE_REGRESSION_SPEC_PATH), "utf8");
    expect(spec).toContain("N+1 regression query counts");
    expect(spec).toContain("assertSubLinearQueryGrowth");
    expect(spec).toContain("getMergedPartnerOAuthAppsByClientIds");

    const p0Spec = readFileSync(join(ROOT, N_PLUS_ONE_REGRESSION_P0_SPEC_PATH), "utf8");
    expect(p0Spec).toContain("P0 N+1 query pattern fixes");
  });

  it("ships npm ci script", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of N_PLUS_ONE_REGRESSION_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(pkg.scripts?.["test:ci:n-plus-one-regression"]).toContain(
      N_PLUS_ONE_REGRESSION_SPEC_PATH,
    );
  });
});
