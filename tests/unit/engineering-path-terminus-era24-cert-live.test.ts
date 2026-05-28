import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENGINEERING_PATH_TERMINUS_ERA24_CI_SCRIPTS,
  ENGINEERING_PATH_TERMINUS_ERA24_OPS_SCRIPTS,
  ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
  ENGINEERING_PATH_TERMINUS_ERA24_PRODUCT_SURFACES,
  ENGINEERING_PATH_TERMINUS_ERA24_UNIT_TESTS,
  ENGINEERING_PATH_TERMINUS_STEP13_DOC,
} from "@/lib/commercial/engineering-path-terminus-era24-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("engineering path terminus era24 CI certification (live repo)", () => {
  it("locks era24 engineering path terminus policy id", () => {
    expect(ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID).toBe("era24-engineering-path-terminus-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ENGINEERING_PATH_TERMINUS_ERA24_OPS_SCRIPTS,
      ...ENGINEERING_PATH_TERMINUS_ERA24_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 13 execution with master orchestration", () => {
    const step13 = readFileSync(join(ROOT, ENGINEERING_PATH_TERMINUS_STEP13_DOC), "utf8");
    expect(step13).toContain("era24-engineering-path-terminus-v1");
    expect(step13).toContain("ops:validate-commercial-pilot-path");
    expect(step13).toContain("#engineering-path-terminus");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of ENGINEERING_PATH_TERMINUS_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-commercial-pilot-path-validate.yml")),
    ).toBe(true);
    for (const rel of ENGINEERING_PATH_TERMINUS_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
