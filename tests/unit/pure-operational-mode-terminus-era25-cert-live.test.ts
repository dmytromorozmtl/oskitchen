import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CI_SCRIPTS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_OPS_SCRIPTS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POLICY_ID,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PRODUCT_SURFACES,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_UNIT_TESTS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC,
} from "@/lib/commercial/pure-operational-mode-terminus-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pure operational mode terminus era25 CI certification (live repo)", () => {
  it("locks era25 terminus policy id", () => {
    expect(PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POLICY_ID).toBe(
      "era25-pure-operational-mode-terminus-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PURE_OPERATIONAL_MODE_TERMINUS_ERA25_OPS_SCRIPTS,
      ...PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents terminus slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC), "utf8");
    expect(doc).toContain("pure-operational-mode-terminus");
    expect(doc).toContain(
      "run-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25",
    );
    expect(doc).toContain("pureOperationalModeTerminusEra25Milestone");
    expect(doc).toContain("#era25-pure-operational-mode-terminus");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-pure-operational-mode-terminus-era25-validate.yml"),
      ),
    ).toBe(true);
  });

  it("lists unit tests from policy", () => {
    for (const rel of PURE_OPERATIONAL_MODE_TERMINUS_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
