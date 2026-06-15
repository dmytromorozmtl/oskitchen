import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAINTENANCE_MODE_INTEGRITY_ERA36_CI_SCRIPTS,
  MAINTENANCE_MODE_INTEGRITY_ERA36_OPS_SCRIPTS,
  MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID,
  MAINTENANCE_MODE_INTEGRITY_ERA36_UNIT_TESTS,
} from "@/lib/commercial/maintenance-mode-integrity-era36-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("maintenance mode integrity era36 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID).toBe(
      "era36-maintenance-mode-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MAINTENANCE_MODE_INTEGRITY_ERA36_OPS_SCRIPTS,
      ...MAINTENANCE_MODE_INTEGRITY_ERA36_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-maintenance-mode-integrity-validate.yml")),
    ).toBe(true);
    for (const path of MAINTENANCE_MODE_INTEGRITY_ERA36_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
