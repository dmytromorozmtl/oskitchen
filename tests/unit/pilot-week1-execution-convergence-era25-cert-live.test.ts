import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CI_SCRIPTS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_OPS_SCRIPTS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POLICY_ID,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PRODUCT_SURFACES,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_UNIT_TESTS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/pilot-week1-execution-convergence-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot week 1 execution convergence era25 CI certification (live repo)", () => {
  it("locks era25 convergence policy id", () => {
    expect(PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POLICY_ID).toBe(
      "era25-pilot-week1-execution-convergence-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_OPS_SCRIPTS,
      ...PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents convergence slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC), "utf8");
    expect(doc).toContain("pilot-week1-execution-convergence");
    expect(doc).toContain(
      "run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25",
    );
    expect(doc).toContain("pilotWeek1ExecutionConvergenceEra25Milestone");
    expect(doc).toContain("#era25-pilot-week1-execution-convergence");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-pilot-week1-execution-convergence-era25-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
