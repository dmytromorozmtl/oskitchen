import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CLAIMS_REGISTRY_CANONICAL_DOC_PATHS,
  CLAIMS_REGISTRY_CANONICAL_MARKERS,
  CLAIMS_REGISTRY_CI_SCRIPTS,
  CLAIMS_REGISTRY_PATH,
  CLAIMS_REGISTRY_POLICY_ID,
  CLAIMS_REGISTRY_UNIT_TESTS,
  type ClaimsRegistryRow,
  validateClaimsRegistryRows,
} from "@/lib/governance/claims-registry-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("claims registry CI certification (live repo)", () => {
  it("locks era8 claims registry policy id", () => {
    expect(CLAIMS_REGISTRY_POLICY_ID).toBe("era8-claims-registry-v1");
  });

  it("defines claims registry CI scripts in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const name of CLAIMS_REGISTRY_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:claims-registry:cert");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:claims-registry");
  });

  it("has policy module, registry, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/governance/claims-registry-policy.ts"))).toBe(true);
    expect(existsSync(join(ROOT, CLAIMS_REGISTRY_PATH))).toBe(true);
    for (const rel of CLAIMS_REGISTRY_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("live registry has no forbidden needs-evidence rows", () => {
    const rows = JSON.parse(
      readFileSync(join(ROOT, CLAIMS_REGISTRY_PATH), "utf8"),
    ) as ClaimsRegistryRow[];
    const errors = validateClaimsRegistryRows(rows);
    expect(errors, errors.join("\n")).toEqual([]);
    expect(rows.some((r) => r.status === "needs-evidence")).toBe(false);
  });

  it("documents claims registry policy in canonical docs", () => {
    for (const rel of CLAIMS_REGISTRY_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8");
      for (const marker of CLAIMS_REGISTRY_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker);
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CLAIMS_REGISTRY_POLICY_ID);
  });
});
