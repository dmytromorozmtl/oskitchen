import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  GOVERNANCE_BUNDLES_CI_WORKFLOW,
  GOVERNANCE_BUNDLES_FULL_COMPOSITION,
  GOVERNANCE_BUNDLES_FULL_SCRIPT,
  GOVERNANCE_BUNDLES_PARTITIONS,
  GOVERNANCE_BUNDLES_PARTITION_CANONICAL_DOC_PATHS,
  GOVERNANCE_BUNDLES_PARTITION_CANONICAL_MARKERS,
  GOVERNANCE_BUNDLES_PARTITION_CI_JOB_ID,
  GOVERNANCE_BUNDLES_PARTITION_CI_SCRIPTS,
  GOVERNANCE_BUNDLES_PARTITION_POLICY_ID,
  GOVERNANCE_BUNDLES_PARTITION_UNIT_TESTS,
  GOVERNANCE_BUNDLES_QUALITY_STEP,
} from "@/lib/ci/governance-bundles-partition-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("governance bundles partition CI certification (live repo)", () => {
  it("locks era9 governance bundles partition policy id", () => {
    expect(GOVERNANCE_BUNDLES_PARTITION_POLICY_ID).toBe(
      "era9-governance-bundles-partition-v1",
    );
  });

  it("defines partition scripts and full bundle composition", () => {
    const scripts = readPackageScripts();
    for (const partition of GOVERNANCE_BUNDLES_PARTITIONS) {
      expect(scripts[partition.script], partition.script).toBeTruthy();
    }
    expect(scripts[GOVERNANCE_BUNDLES_FULL_SCRIPT]).toBe(GOVERNANCE_BUNDLES_FULL_COMPOSITION);
    expect(scripts["test:ci:governance-bundles-partition:cert"]).toBeTruthy();
  });

  it("wires parallel governance-bundles-partitions job without replacing quality step", () => {
    const workflowPath = join(ROOT, GOVERNANCE_BUNDLES_CI_WORKFLOW);
    expect(existsSync(workflowPath)).toBe(true);
    const workflow = readFileSync(workflowPath, "utf8");
    expect(workflow).toContain(`${GOVERNANCE_BUNDLES_PARTITION_CI_JOB_ID}:`);
    expect(workflow).toContain("test:ci:governance-bundles:partition-${{ matrix.partition }}");
    expect(workflow).toMatch(/partition:\s*\[platform,\s*money-path,\s*security-rbac,\s*product-kds\]/);
    expect(workflow).toContain(GOVERNANCE_BUNDLES_QUALITY_STEP);
    expect(workflow).toMatch(
      new RegExp(
        `${GOVERNANCE_BUNDLES_PARTITION_CI_JOB_ID}:[\\s\\S]*strategy:[\\s\\S]*matrix:`,
      ),
    );
  });

  it("includes partition cert in typecheck-slice cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:typecheck-slice:cert"]).toContain(
      "governance-bundles-partition-ci-live.test.ts",
    );
  });

  it("has policy module and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/ci/governance-bundles-partition-policy.ts"))).toBe(
      true,
    );
    for (const rel of GOVERNANCE_BUNDLES_PARTITION_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const name of GOVERNANCE_BUNDLES_PARTITION_CI_SCRIPTS) {
      expect(readPackageScripts()[name], name).toBeTruthy();
    }
  });

  it("documents governance bundle partitions in canonical docs", () => {
    for (const rel of GOVERNANCE_BUNDLES_PARTITION_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of GOVERNANCE_BUNDLES_PARTITION_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(GOVERNANCE_BUNDLES_PARTITION_POLICY_ID);
  });
});
