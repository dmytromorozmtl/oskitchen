import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  MUTATION_ACCESS_ERA11_CANONICAL_DOC_PATHS,
  MUTATION_ACCESS_ERA11_CANONICAL_MARKERS,
  MUTATION_ACCESS_ERA11_CI_SCRIPTS,
  MUTATION_ACCESS_ERA11_INLINE_WAVE4_GATES,
  MUTATION_ACCESS_ERA11_POLICY_ID,
  MUTATION_ACCESS_ERA11_UNIT_TESTS,
} from "@/lib/permissions/mutation-access-era11-policy";
import { RBAC_WAVE4_ERA9_TEST_FILES } from "@/lib/security/rbac-wave4-era9-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("mutation access era11 CI certification (live repo)", () => {
  it("locks era11 mutation access recert policy id", () => {
    expect(MUTATION_ACCESS_ERA11_POLICY_ID).toBe("era11-mutation-access-recert-v1");
  });

  it("defines era11 recert scripts and chains cert into consolidation bundle", () => {
    const scripts = readPackageScripts();
    for (const name of MUTATION_ACCESS_ERA11_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:mutation-access-consolidation:cert"]).toContain(
      "mutation-access-era11-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:mutation-access-consolidation:cert"),
    ).toBe(true);
  });

  it("keeps production calendar rbac tests in wave4 security bundle", () => {
    const bundle = readPackageScripts()["test:ci:rbac-wave4"] ?? "";
    expect(bundle).toContain("production-calendar-actions-rbac.test.ts");
    expect(bundle).toContain("production-calendar-form-deny.test.ts");
    expect(RBAC_WAVE4_ERA9_TEST_FILES).toContain("tests/unit/production-calendar-actions-rbac.test.ts");
  });

  it("keeps permission guards on era11 inline wave4 action surfaces", () => {
    for (const gate of MUTATION_ACCESS_ERA11_INLINE_WAVE4_GATES) {
      const source = readFileSync(join(ROOT, gate.actionPath), "utf8");
      expect(source).toContain(gate.gateFunction);
      expect(source).toContain("requireMutationPermission");
      for (const operation of gate.operations) {
        expect(source).toContain(operation);
      }
    }
  });

  it("documents era11 recert in canonical docs", () => {
    for (const rel of MUTATION_ACCESS_ERA11_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of MUTATION_ACCESS_ERA11_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(MUTATION_ACCESS_ERA11_POLICY_ID);
    for (const rel of MUTATION_ACCESS_ERA11_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
