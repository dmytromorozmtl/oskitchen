import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SCALE_READINESS_INTEGRITY_ERA30_CI_SCRIPTS,
  SCALE_READINESS_INTEGRITY_ERA30_OPS_SCRIPTS,
  SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID,
  SCALE_READINESS_INTEGRITY_ERA30_UNIT_TESTS,
} from "@/lib/commercial/scale-readiness-integrity-era30-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("scale readiness integrity era30 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID).toBe(
      "era30-scale-readiness-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SCALE_READINESS_INTEGRITY_ERA30_OPS_SCRIPTS,
      ...SCALE_READINESS_INTEGRITY_ERA30_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-scale-readiness-integrity-validate.yml")),
    ).toBe(true);
    for (const rel of SCALE_READINESS_INTEGRITY_ERA30_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
