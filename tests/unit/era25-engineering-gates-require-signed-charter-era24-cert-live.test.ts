import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_CI_SCRIPTS,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_OPS_SCRIPTS,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_POLICY_ID,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_PRODUCT_SURFACES,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_UNIT_TESTS,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-era24-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 engineering gates require signed charter era24 CI certification (live repo)", () => {
  it("locks era24 gates policy id", () => {
    expect(ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_POLICY_ID).toBe(
      "era24-era25-engineering-gates-require-signed-charter-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_OPS_SCRIPTS,
      ...ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents gates with ops wiring", () => {
    const doc = readFileSync(join(ROOT, ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC), "utf8");
    expect(doc).toContain("era25-engineering-gates");
    expect(doc).toContain("run-era25-engineering-gates-post-readiness-orchestrator");
    expect(doc).toContain("era25EngineeringGatesMilestone");
    expect(doc).toContain("#era25-engineering-gates-require-signed-charter");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-era25-engineering-gates-require-signed-charter-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const rel of ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
