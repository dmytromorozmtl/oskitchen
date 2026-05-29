import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_CI_SCRIPTS,
  ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_OPS_SCRIPTS,
  ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID,
  ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_UNIT_TESTS,
} from "@/lib/commercial/engineering-path-terminus-integrity-era37-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("engineering path terminus integrity era37 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID).toBe(
      "era37-engineering-path-terminus-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_OPS_SCRIPTS,
      ...ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-engineering-path-terminus-integrity-validate.yml")),
    ).toBe(true);
    for (const path of ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
