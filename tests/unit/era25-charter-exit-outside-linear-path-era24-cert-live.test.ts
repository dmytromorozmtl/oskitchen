import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_CI_SCRIPTS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_OPS_SCRIPTS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_POLICY_ID,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_PRODUCT_SURFACES,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_UNIT_TESTS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-era24-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 charter exit outside linear path era24 CI certification (live repo)", () => {
  it("locks era24 era25 exit process policy id", () => {
    expect(ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_POLICY_ID).toBe(
      "era24-era25-charter-exit-outside-linear-path-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_OPS_SCRIPTS,
      ...ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents era25 exit process with ops wiring", () => {
    const doc = readFileSync(join(ROOT, ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC), "utf8");
    expect(doc).toContain("era25-charter-exit-outside-linear-path-v1");
    expect(doc).toContain("run-era25-charter-exit-post-terminus-guard-orchestrator");
    expect(doc).toContain("era25CharterExitMilestone");
    expect(doc).toContain("#era25-charter-exit-outside-linear-path");
    expect(doc).toContain("Step 18+");
    expect(doc).not.toContain("next-step-18");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-era25-charter-exit-outside-linear-path-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
