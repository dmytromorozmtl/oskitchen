import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_CI_SCRIPTS,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_OPS_SCRIPTS,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_PRODUCT_SURFACES,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_UNIT_TESTS,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-era24-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commercial pilot path absolute end era24 CI certification (live repo)", () => {
  it("locks era24 absolute end policy id", () => {
    expect(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID).toBe(
      "era24-commercial-pilot-path-absolute-end-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_OPS_SCRIPTS,
      ...COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 15 with ops wiring", () => {
    const step15 = readFileSync(join(ROOT, COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC), "utf8");
    expect(step15).toContain("era24-commercial-pilot-path-absolute-end-v1");
    expect(step15).toContain("ops:validate-commercial-pilot-path-absolute-end");
    expect(step15).toContain("#commercial-pilot-path-absolute-end");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-commercial-pilot-path-absolute-end-validate.yml")),
    ).toBe(true);
    for (const rel of COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
