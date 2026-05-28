import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_WEEK1_EXECUTION_ERA21_CI_SCRIPTS,
  PILOT_WEEK1_EXECUTION_ERA21_OPS_SCRIPTS,
  PILOT_WEEK1_EXECUTION_ERA21_POLICY_ID,
  PILOT_WEEK1_EXECUTION_ERA21_PRODUCT_SURFACES,
  PILOT_WEEK1_EXECUTION_ERA21_UNIT_TESTS,
} from "@/lib/commercial/pilot-week1-execution-era21-policy";
import { PILOT_WEEK1_EXECUTION_STEP4_DOC } from "@/lib/commercial/pilot-week1-execution-phases-era21";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot week1 execution era21 CI certification (live repo)", () => {
  it("locks era21 pilot week1 policy id", () => {
    expect(PILOT_WEEK1_EXECUTION_ERA21_POLICY_ID).toBe("era21-pilot-week1-execution-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PILOT_WEEK1_EXECUTION_ERA21_OPS_SCRIPTS,
      ...PILOT_WEEK1_EXECUTION_ERA21_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 4 execution", () => {
    const step4 = readFileSync(join(ROOT, PILOT_WEEK1_EXECUTION_STEP4_DOC), "utf8");
    expect(step4).toContain("smoke:pilot-metrics-baseline");
    expect(step4).toContain("PILOT_WEEK1_TTV_HOURS");
    expect(step4).toContain("era21-pilot-week1-execution-v1");
  });

  it("wires product surfaces", () => {
    for (const rel of PILOT_WEEK1_EXECUTION_ERA21_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, ".github/workflows/ops-pilot-week1-validate.yml"))).toBe(true);
    for (const rel of PILOT_WEEK1_EXECUTION_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
