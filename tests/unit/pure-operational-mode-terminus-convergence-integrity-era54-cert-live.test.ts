import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_CI_SCRIPTS,
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_OPS_SCRIPTS,
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID,
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_UNIT_TESTS,
} from "@/lib/commercial/pure-operational-mode-terminus-convergence-integrity-era54-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pure operational mode terminus convergence integrity era54 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID).toBe(
      "era54-pure-operational-mode-terminus-convergence-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_OPS_SCRIPTS,
      ...PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-pure-operational-mode-terminus-convergence-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const path of PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
