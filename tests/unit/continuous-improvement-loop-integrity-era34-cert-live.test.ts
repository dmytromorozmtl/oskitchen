import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_CI_SCRIPTS,
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_OPS_SCRIPTS,
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_UNIT_TESTS,
} from "@/lib/commercial/continuous-improvement-loop-integrity-era34-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("continuous improvement loop integrity era34 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID).toBe(
      "era34-continuous-improvement-loop-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_OPS_SCRIPTS,
      ...CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-continuous-improvement-loop-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const path of CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
