import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  RBAC_WAVE4_ERA9_CANONICAL_DOC_PATHS,
  RBAC_WAVE4_ERA9_CANONICAL_MARKERS,
  RBAC_WAVE4_ERA9_CI_SCRIPTS,
  RBAC_WAVE4_ERA9_GUARDED_SURFACES,
  RBAC_WAVE4_ERA9_POLICY_ID,
  RBAC_WAVE4_ERA9_TEST_FILES,
  RBAC_WAVE4_ERA9_UNIT_TESTS,
} from "@/lib/security/rbac-wave4-era9-policy";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("rbac wave4 era9 CI certification (live repo)", () => {
  it("locks era9 rbac wave4 recert policy id", () => {
    expect(RBAC_WAVE4_ERA9_POLICY_ID).toBe("era9-rbac-wave4-recert-v1");
  });

  it("defines rbac-wave4 bundle, cert chain, and era9 cert tests on disk", () => {
    const scripts = readPackageScripts();
    for (const name of RBAC_WAVE4_ERA9_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:rbac-wave4:cert"]).toContain("rbac-wave4-era9-cert-live");
    for (const rel of RBAC_WAVE4_ERA9_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes all era9 wave4 negative tests in test:ci:rbac-wave4", () => {
    const bundle = readPackageScripts()["test:ci:rbac-wave4"] ?? "";
    for (const rel of RBAC_WAVE4_ERA9_TEST_FILES) {
      expect(bundle, `bundle missing ${rel}`).toContain(rel);
    }
  });

  it("chains test:ci:rbac-wave4 at end of test:security for security-db CI", () => {
    const security = readPackageScripts()["test:security"] ?? "";
    expect(security).toContain("npm run test:ci:rbac-wave4");
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    expect(workflow).toContain("security-db:");
    expect(workflow).toContain("npm run test:security");
  });

  it("keeps permission guards on all wave4 sensitive action surfaces", () => {
    for (const surface of RBAC_WAVE4_ERA9_GUARDED_SURFACES) {
      const path = join(ROOT, surface.actionPath);
      expect(existsSync(path), surface.actionPath).toBe(true);
      const source = readFileSync(path, "utf8");
      const matched = surface.guardMarkers.some((marker) => source.includes(marker));
      expect(matched, `${surface.actionPath} missing guard markers`).toBe(true);
    }
  });

  it("documents era9 rbac wave4 recert in canonical docs", () => {
    for (const rel of RBAC_WAVE4_ERA9_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of RBAC_WAVE4_ERA9_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(RBAC_WAVE4_ERA9_POLICY_ID);
  });
});
