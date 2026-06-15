import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_CANONICAL_DOC_PATHS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_CANONICAL_MARKERS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_CI_SCRIPTS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_IF_EXPRESSION,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_OPS_DOC,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_UNIT_TESTS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS,
} from "@/lib/ci/staging-workflows-first-run-era13-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("staging workflows first-run era13 CI certification (live repo)", () => {
  it("locks era13 staging workflows first-run ops policy id", () => {
    expect(STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID).toBe(
      "era13-staging-workflows-first-run-ops-v1",
    );
  });

  it("defines era13 staging workflows first-run scripts", () => {
    const scripts = readPackageScripts();
    for (const name of STAGING_WORKFLOWS_FIRST_RUN_ERA13_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:e2e-staging-secrets-era12:cert"]).toContain(
      "staging-workflows-first-run-era13-cert-live",
    );
  });

  it("gates optional staging jobs on E2E secrets (job omitted when missing)", () => {
    for (const { workflow, jobId } of STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS) {
      const text = readFileSync(join(ROOT, workflow), "utf8");
      expect(text, workflow).toContain(`if: \${{ ${STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_IF_EXPRESSION} }}`);
      expect(text, workflow).toContain(jobId);
    }
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).not.toContain("e2e-staging.yml");
    expect(ci).not.toContain("playwright-kds-staging.yml");
  });

  it("documents era13 staging first-run ops in canonical docs", () => {
    const opsDoc = readFileSync(join(ROOT, STAGING_WORKFLOWS_FIRST_RUN_ERA13_OPS_DOC), "utf8");
    expect(opsDoc).toContain(STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID);
    expect(opsDoc).toContain("JOB_OMITTED_SECRETS_MISSING");

    for (const rel of STAGING_WORKFLOWS_FIRST_RUN_ERA13_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID.toLowerCase());
    }
    for (const marker of STAGING_WORKFLOWS_FIRST_RUN_ERA13_CANONICAL_MARKERS) {
      expect(opsDoc.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID);
    for (const rel of STAGING_WORKFLOWS_FIRST_RUN_ERA13_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
