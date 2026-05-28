import { describe, expect, it } from "vitest";

import {
  MUTATION_REGISTRY_LINTER_ERA16_CANONICAL_DOC_PATHS,
  MUTATION_REGISTRY_LINTER_ERA16_CERT_SCRIPT,
  MUTATION_REGISTRY_LINTER_ERA16_CI_SCRIPTS,
  MUTATION_REGISTRY_LINTER_ERA16_FORBIDDEN_CLAIMS,
  MUTATION_REGISTRY_LINTER_ERA16_HONEST_SCOPE,
  MUTATION_REGISTRY_LINTER_ERA16_LINTER_MODULE,
  MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID,
  MUTATION_REGISTRY_LINTER_ERA16_REVIEW_SECTION,
  MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT,
  MUTATION_REGISTRY_LINTER_ERA16_UNIT_TESTS,
} from "@/lib/permissions/mutation-registry-linter-era16-policy";

describe("mutation registry linter era16 policy", () => {
  it("documents honest scope without over-claiming RBAC coverage", () => {
    expect(MUTATION_REGISTRY_LINTER_ERA16_HONEST_SCOPE.blocksNewUngovernedMutations).toBe(true);
    expect(MUTATION_REGISTRY_LINTER_ERA16_HONEST_SCOPE.replacesRbacWaveTests).toBe(false);
    expect(MUTATION_REGISTRY_LINTER_ERA16_FORBIDDEN_CLAIMS).toContain("full rbac coverage");
  });

  it("wires module, cert script, and summary artifact paths", () => {
    expect(MUTATION_REGISTRY_LINTER_ERA16_LINTER_MODULE).toBe(
      "lib/permissions/mutation-registry-linter.ts",
    );
    expect(MUTATION_REGISTRY_LINTER_ERA16_CERT_SCRIPT).toBe(
      "scripts/cert-mutation-registry-linter-era16.ts",
    );
    expect(MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT).toBe(
      "artifacts/mutation-registry-linter-summary.json",
    );
    expect(MUTATION_REGISTRY_LINTER_ERA16_CI_SCRIPTS).toContain(
      "test:ci:mutation-registry-linter-era16:cert",
    );
    expect(MUTATION_REGISTRY_LINTER_ERA16_UNIT_TESTS.length).toBeGreaterThanOrEqual(3);
    expect(MUTATION_REGISTRY_LINTER_ERA16_CANONICAL_DOC_PATHS).toContain(
      "docs/rbac-permission-architecture.md",
    );
    expect(MUTATION_REGISTRY_LINTER_ERA16_REVIEW_SECTION).toContain("mutation registry linter");
    expect(MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID).toBe("era16-mutation-registry-linter-v1");
  });
});
