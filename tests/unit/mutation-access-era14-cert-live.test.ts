import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  MUTATION_ACCESS_ERA14_CANONICAL_DOC_PATHS,
  MUTATION_ACCESS_ERA14_CANONICAL_MARKERS,
  MUTATION_ACCESS_ERA14_CI_SCRIPTS,
  MUTATION_ACCESS_ERA14_OPS_DOC,
  MUTATION_ACCESS_ERA14_POLICY_ID,
  MUTATION_ACCESS_ERA14_SMOKE_NPM_SCRIPT,
  MUTATION_ACCESS_ERA14_SMOKE_SCRIPT,
  MUTATION_ACCESS_ERA14_UNIT_TESTS,
} from "@/lib/permissions/mutation-access-era14-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("mutation access era14 CI certification (live repo)", () => {
  it("locks era14 mutation access consolidation recert policy id", () => {
    expect(MUTATION_ACCESS_ERA14_POLICY_ID).toBe(
      "era14-mutation-access-consolidation-recert-v1",
    );
  });

  it("defines era14 mutation access scripts and chains cert into consolidation bundle", () => {
    const scripts = readPackageScripts();
    for (const name of MUTATION_ACCESS_ERA14_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[MUTATION_ACCESS_ERA14_SMOKE_NPM_SCRIPT]).toContain(
      MUTATION_ACCESS_ERA14_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:mutation-access-consolidation:cert"]).toContain(
      "mutation-access-era14-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:mutation-access-consolidation:cert"),
    ).toBe(true);
  });

  it("documents era14 recert in canonical docs", () => {
    const ops = readFileSync(join(ROOT, MUTATION_ACCESS_ERA14_OPS_DOC), "utf8");
    for (const marker of MUTATION_ACCESS_ERA14_CANONICAL_MARKERS) {
      expect(ops.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of MUTATION_ACCESS_ERA14_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(MUTATION_ACCESS_ERA14_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(MUTATION_ACCESS_ERA14_POLICY_ID);
    for (const rel of MUTATION_ACCESS_ERA14_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, MUTATION_ACCESS_ERA14_SMOKE_SCRIPT))).toBe(true);
  });
});
