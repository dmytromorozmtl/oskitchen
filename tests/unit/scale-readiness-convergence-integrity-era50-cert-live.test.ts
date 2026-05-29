import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_CI_SCRIPTS,
  SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_OPS_SCRIPTS,
  SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID,
  SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_UNIT_TESTS,
} from "@/lib/commercial/scale-readiness-convergence-integrity-era50-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("scale readiness convergence integrity era50 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID).toBe(
      "era50-scale-readiness-convergence-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_OPS_SCRIPTS,
      ...SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-scale-readiness-convergence-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const path of SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
