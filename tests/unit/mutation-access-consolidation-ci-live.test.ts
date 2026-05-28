import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MUTATION_ACCESS_CI_SCRIPTS,
  MUTATION_ACCESS_POLICY_ID,
  MUTATION_ACCESS_UNIT_TESTS,
} from "@/lib/permissions/mutation-access-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("mutation access consolidation CI certification (live repo)", () => {
  it("locks era4 mutation access consolidation policy id", () => {
    expect(MUTATION_ACCESS_POLICY_ID).toBe("era4-mutation-access-consolidation-v1");
  });

  it("defines consolidation CI scripts", () => {
    const scripts = readPackageScripts();
    for (const name of MUTATION_ACCESS_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:mutation-access-consolidation"]).toContain(
      "domain-mutation-registry",
    );
  });

  it("includes consolidation cert in governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain(
      "test:ci:mutation-access-consolidation:cert",
    );
    expect(scripts["test:ci:governance-bundles"]).toContain(
      "test:ci:mutation-access-consolidation",
    );
  });

  it("has registry, shared denial logger, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/permissions/domain-mutation-registry.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "lib/permissions/log-domain-mutation-denied.ts"))).toBe(true);
    for (const rel of MUTATION_ACCESS_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("documents unified narrative in rbac architecture doc", () => {
    const doc = readFileSync(join(ROOT, "docs/rbac-permission-architecture.md"), "utf8");
    expect(doc).toContain("era4-mutation-access-consolidation-v1");
    expect(doc).toContain("domain-mutation-registry");
    expect(doc).toContain("logDomainMutationDenied");
  });
});
