import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_CI_SCRIPTS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_OPS_SCRIPTS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_UNIT_TESTS,
} from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot week 1 execution convergence integrity era48 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID).toBe(
      "era48-pilot-week1-execution-convergence-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_OPS_SCRIPTS,
      ...PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-pilot-week1-execution-convergence-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const path of PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
