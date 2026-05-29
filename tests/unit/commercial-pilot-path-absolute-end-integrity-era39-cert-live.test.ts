import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_CI_SCRIPTS,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_OPS_SCRIPTS,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_UNIT_TESTS,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commercial pilot path absolute end integrity era39 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID).toBe(
      "era39-commercial-pilot-path-absolute-end-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_OPS_SCRIPTS,
      ...COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-commercial-pilot-path-absolute-end-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const path of COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
