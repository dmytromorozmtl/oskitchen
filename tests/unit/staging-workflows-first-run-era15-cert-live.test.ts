import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_CANONICAL_DOC_PATHS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_CANONICAL_MARKERS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_CI_SCRIPTS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_JOB_IF_EXPRESSION,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_OPS_DOC,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_SMOKE_NPM_SCRIPT,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_SMOKE_SCRIPT,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_UNIT_TESTS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_WORKFLOWS,
} from "@/lib/ci/staging-workflows-first-run-era15-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("staging workflows first-run era15 CI certification (live repo)", () => {
  it("locks era15 staging workflows first-run recert policy id", () => {
    expect(STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID).toBe(
      "era15-staging-workflows-first-run-recert-v1",
    );
  });

  it("defines era15 scripts and chains cert into e2e staging secrets bundle", () => {
    const scripts = readPackageScripts();
    for (const name of STAGING_WORKFLOWS_FIRST_RUN_ERA15_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[STAGING_WORKFLOWS_FIRST_RUN_ERA15_SMOKE_NPM_SCRIPT]).toContain(
      STAGING_WORKFLOWS_FIRST_RUN_ERA15_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:e2e-staging-secrets-era12:cert"]).toContain(
      "staging-workflows-first-run-era15-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:e2e-staging-secrets-era12:cert"),
    ).toBe(true);
  });

  it("gates optional staging jobs on E2E secrets (job omitted when missing)", () => {
    for (const { workflow, jobId } of STAGING_WORKFLOWS_FIRST_RUN_ERA15_WORKFLOWS) {
      const text = readFileSync(join(ROOT, workflow), "utf8");
      expect(text, workflow).toContain(
        `if: \${{ ${STAGING_WORKFLOWS_FIRST_RUN_ERA15_JOB_IF_EXPRESSION} }}`,
      );
      expect(text, workflow).toContain(jobId);
    }
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).not.toContain("e2e-staging.yml");
    expect(ci).not.toContain("playwright-kds-staging.yml");
    expect(ci).not.toContain("closed-beta-gate.yml");
  });

  it("documents era15 staging first-run recert in canonical docs", () => {
    const opsDoc = readFileSync(join(ROOT, STAGING_WORKFLOWS_FIRST_RUN_ERA15_OPS_DOC), "utf8");
    for (const marker of STAGING_WORKFLOWS_FIRST_RUN_ERA15_CANONICAL_MARKERS) {
      expect(opsDoc.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of STAGING_WORKFLOWS_FIRST_RUN_ERA15_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID);
    for (const rel of STAGING_WORKFLOWS_FIRST_RUN_ERA15_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, STAGING_WORKFLOWS_FIRST_RUN_ERA15_SMOKE_SCRIPT))).toBe(true);
  });
});
