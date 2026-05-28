import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SERIES_A_PARTNER_EXPANSION_ERA21_CI_SCRIPTS,
  SERIES_A_PARTNER_EXPANSION_ERA21_OPS_SCRIPTS,
  SERIES_A_PARTNER_EXPANSION_ERA21_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_ERA21_PRODUCT_SURFACES,
  SERIES_A_PARTNER_EXPANSION_ERA21_UNIT_TESTS,
} from "@/lib/commercial/series-a-partner-expansion-era21-policy";
import { SERIES_A_PARTNER_EXPANSION_STEP7_DOC } from "@/lib/commercial/series-a-partner-expansion-phases-era21";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("series a partner expansion era21 CI certification (live repo)", () => {
  it("locks era21 series A policy id", () => {
    expect(SERIES_A_PARTNER_EXPANSION_ERA21_POLICY_ID).toBe("era21-series-a-partner-expansion-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SERIES_A_PARTNER_EXPANSION_ERA21_OPS_SCRIPTS,
      ...SERIES_A_PARTNER_EXPANSION_ERA21_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 7 execution", () => {
    const step7 = readFileSync(join(ROOT, SERIES_A_PARTNER_EXPANSION_STEP7_DOC), "utf8");
    expect(step7).toContain("smoke:woo-shopify-live");
    expect(step7).toContain("era21-series-a-partner-expansion-v1");
    expect(step7).toContain("SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED");
  });

  it("wires product surfaces", () => {
    for (const rel of SERIES_A_PARTNER_EXPANSION_ERA21_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-series-a-partner-expansion-validate.yml")),
    ).toBe(true);
    for (const rel of SERIES_A_PARTNER_EXPANSION_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
