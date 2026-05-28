import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAINTENANCE_MODE_ERA24_CI_SCRIPTS,
  MAINTENANCE_MODE_ERA24_OPS_SCRIPTS,
  MAINTENANCE_MODE_ERA24_POLICY_ID,
  MAINTENANCE_MODE_ERA24_PRODUCT_SURFACES,
  MAINTENANCE_MODE_ERA24_UNIT_TESTS,
} from "@/lib/commercial/maintenance-mode-era24-policy";
import { MAINTENANCE_MODE_STEP12_DOC } from "@/lib/commercial/maintenance-mode-phases-era24";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("maintenance mode era24 CI certification (live repo)", () => {
  it("locks era24 maintenance mode policy id", () => {
    expect(MAINTENANCE_MODE_ERA24_POLICY_ID).toBe("era24-maintenance-mode-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [...MAINTENANCE_MODE_ERA24_OPS_SCRIPTS, ...MAINTENANCE_MODE_ERA24_CI_SCRIPTS]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 12 execution", () => {
    const step12 = readFileSync(join(ROOT, MAINTENANCE_MODE_STEP12_DOC), "utf8");
    expect(step12).toContain("era24-maintenance-mode-v1");
    expect(step12).toContain("#maintenance-mode");
    expect(step12).toContain("ops:validate-maintenance-mode");
  });

  it("wires product surfaces", () => {
    for (const rel of MAINTENANCE_MODE_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, ".github/workflows/ops-maintenance-mode-validate.yml"))).toBe(true);
    for (const rel of MAINTENANCE_MODE_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
