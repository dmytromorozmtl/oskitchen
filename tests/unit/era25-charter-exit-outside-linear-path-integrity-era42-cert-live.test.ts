import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_CI_SCRIPTS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_OPS_SCRIPTS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_UNIT_TESTS,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 charter exit outside linear path integrity era42 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID).toBe(
      "era42-era25-charter-exit-outside-linear-path-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_OPS_SCRIPTS,
      ...ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-era25-charter-exit-outside-linear-path-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const path of ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
