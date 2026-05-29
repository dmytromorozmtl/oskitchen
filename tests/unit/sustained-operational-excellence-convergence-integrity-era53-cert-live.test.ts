import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_CI_SCRIPTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_OPS_SCRIPTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_UNIT_TESTS,
} from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("sustained operational excellence convergence integrity era53 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID).toBe(
      "era53-sustained-operational-excellence-convergence-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_OPS_SCRIPTS,
      ...SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-sustained-operational-excellence-convergence-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const path of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
