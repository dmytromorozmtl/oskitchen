import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_CI_SCRIPTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_OPS_SCRIPTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_PRODUCT_SURFACES,
  SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_UNIT_TESTS,
} from "@/lib/commercial/sustained-operational-excellence-era21-policy";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("sustained operational excellence era21 CI certification (live repo)", () => {
  it("locks era21 sustained ops policy id", () => {
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_POLICY_ID).toBe(
      "era21-sustained-operational-excellence-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_OPS_SCRIPTS,
      ...SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 9 execution", () => {
    const step9 = readFileSync(join(ROOT, SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC), "utf8");
    expect(step9).toContain("SUSTAINED_OPS_DAILY_CADENCE_ATTESTED");
    expect(step9).toContain("era21-sustained-operational-excellence-v1");
    expect(step9).toContain("smoke:pilot-metrics-baseline");
  });

  it("wires product surfaces", () => {
    for (const rel of SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-sustained-operational-excellence-validate.yml")),
    ).toBe(true);
    for (const rel of SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
