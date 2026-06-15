import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_CI_SCRIPTS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_OPS_SCRIPTS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_UNIT_TESTS,
} from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("series a partner expansion convergence integrity era51 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID).toBe(
      "era51-series-a-partner-expansion-convergence-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_OPS_SCRIPTS,
      ...SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-series-a-partner-expansion-convergence-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const path of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
