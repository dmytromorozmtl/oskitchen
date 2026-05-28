import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MUTATION_REGISTRY_LINTER_ERA16_CANONICAL_DOC_PATHS,
  MUTATION_REGISTRY_LINTER_ERA16_CANONICAL_MARKERS,
  MUTATION_REGISTRY_LINTER_ERA16_CERT_SCRIPT,
  MUTATION_REGISTRY_LINTER_ERA16_CI_SCRIPTS,
  MUTATION_REGISTRY_LINTER_ERA16_FORBIDDEN_CLAIMS,
  MUTATION_REGISTRY_LINTER_ERA16_LINTER_MODULE,
  MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID,
  MUTATION_REGISTRY_LINTER_ERA16_REVIEW_SECTION,
  MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT,
  MUTATION_REGISTRY_LINTER_ERA16_UNIT_TESTS,
} from "@/lib/permissions/mutation-registry-linter-era16-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("mutation registry linter era16 CI certification (live repo)", () => {
  it("locks era16 mutation registry linter policy id", () => {
    expect(MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID).toBe("era16-mutation-registry-linter-v1");
  });

  it("defines era16 mutation registry linter scripts chained into test:security", () => {
    const scripts = readPackageScripts();
    for (const name of MUTATION_REGISTRY_LINTER_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["cert:mutation-registry-linter-era16"]).toContain(
      MUTATION_REGISTRY_LINTER_ERA16_CERT_SCRIPT,
    );
    expect(scripts["test:security"]).toContain("test:ci:mutation-registry-linter-era16:cert");
  });

  it("wires linter module, cert script, and summary artifact", () => {
    expect(existsSync(join(ROOT, MUTATION_REGISTRY_LINTER_ERA16_LINTER_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, MUTATION_REGISTRY_LINTER_ERA16_CERT_SCRIPT))).toBe(true);
    const certScript = readFileSync(join(ROOT, MUTATION_REGISTRY_LINTER_ERA16_CERT_SCRIPT), "utf8");
    expect(certScript).toContain("MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT");
    expect(certScript).toContain(MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT);
  });

  it("documents era16 mutation registry linter in canonical docs without forbidden claims", () => {
    for (const rel of MUTATION_REGISTRY_LINTER_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of MUTATION_REGISTRY_LINTER_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      for (const forbidden of MUTATION_REGISTRY_LINTER_ERA16_FORBIDDEN_CLAIMS) {
        expect(text).not.toContain(forbidden.toLowerCase());
      }
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(MUTATION_REGISTRY_LINTER_ERA16_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID);
    for (const rel of MUTATION_REGISTRY_LINTER_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
