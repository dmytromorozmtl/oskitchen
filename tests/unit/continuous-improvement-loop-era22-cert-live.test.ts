import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTINUOUS_IMPROVEMENT_LOOP_ERA22_CI_SCRIPTS,
  CONTINUOUS_IMPROVEMENT_LOOP_ERA22_OPS_SCRIPTS,
  CONTINUOUS_IMPROVEMENT_LOOP_ERA22_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_ERA22_PRODUCT_SURFACES,
  CONTINUOUS_IMPROVEMENT_LOOP_ERA22_UNIT_TESTS,
} from "@/lib/commercial/continuous-improvement-loop-era22-policy";
import { CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC } from "@/lib/commercial/continuous-improvement-loop-phases-era22";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("continuous improvement loop era22 CI certification (live repo)", () => {
  it("locks era22 continuous improvement policy id", () => {
    expect(CONTINUOUS_IMPROVEMENT_LOOP_ERA22_POLICY_ID).toBe("era22-continuous-improvement-loop-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...CONTINUOUS_IMPROVEMENT_LOOP_ERA22_OPS_SCRIPTS,
      ...CONTINUOUS_IMPROVEMENT_LOOP_ERA22_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 10 execution", () => {
    const step10 = readFileSync(join(ROOT, CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC), "utf8");
    expect(step10).toContain("era22-continuous-improvement-loop-v1");
    expect(step10).toContain(
      "run-continuous-improvement-loop-post-sustained-ops-orchestrator",
    );
    expect(step10).toContain("test:ci:commercial-pilot-runbook:cert");
    expect(step10).toContain("#continuous-improvement-loop");
  });

  it("wires product surfaces", () => {
    for (const rel of CONTINUOUS_IMPROVEMENT_LOOP_ERA22_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-continuous-improvement-loop-validate.yml")),
    ).toBe(true);
    for (const rel of CONTINUOUS_IMPROVEMENT_LOOP_ERA22_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
