import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_CI_SCRIPTS,
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_OPS_SCRIPTS,
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID,
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_UNIT_TESTS,
} from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("paid pilot GO convergence integrity era47 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID).toBe(
      "era47-paid-pilot-go-convergence-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_OPS_SCRIPTS,
      ...PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-paid-pilot-go-convergence-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const path of PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
