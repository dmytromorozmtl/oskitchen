import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_CI_SCRIPTS,
  PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_OPS_SCRIPTS,
  PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID,
  PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_UNIT_TESTS,
} from "@/lib/commercial/pilot-week1-execution-integrity-era28-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot week1 execution integrity era28 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID).toBe(
      "era28-pilot-week1-execution-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_OPS_SCRIPTS,
      ...PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-pilot-week1-execution-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
