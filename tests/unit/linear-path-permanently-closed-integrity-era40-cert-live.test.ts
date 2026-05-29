import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_CI_SCRIPTS,
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_OPS_SCRIPTS,
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_UNIT_TESTS,
} from "@/lib/commercial/linear-path-permanently-closed-integrity-era40-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("linear path permanently closed integrity era40 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID).toBe(
      "era40-linear-path-permanently-closed-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_OPS_SCRIPTS,
      ...LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-linear-path-permanently-closed-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const path of LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
