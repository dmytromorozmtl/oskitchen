import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import { KDS_STAGING_WORKFLOW_SECRETS_PASSWORD_ENV_EXPRESSION } from "@/lib/ci/kds-staging-workflow-secrets-era13-policy";
import {
  KDS_STAGING_SMOKE_ERA15_CANONICAL_DOC_PATHS,
  KDS_STAGING_SMOKE_ERA15_CANONICAL_MARKERS,
  KDS_STAGING_SMOKE_ERA15_CI_SCRIPTS,
  KDS_STAGING_SMOKE_ERA15_OPS_DOC,
  KDS_STAGING_SMOKE_ERA15_PLAYWRIGHT_WORKFLOW,
  KDS_STAGING_SMOKE_ERA15_POLICY_ID,
  KDS_STAGING_SMOKE_ERA15_SMOKE_NPM_SCRIPT,
  KDS_STAGING_SMOKE_ERA15_SMOKE_SCRIPT,
  KDS_STAGING_SMOKE_ERA15_UNIT_TESTS,
} from "@/lib/kitchen/kds-staging-smoke-era15-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("KDS staging smoke era15 CI certification (live repo)", () => {
  it("locks era15 KDS staging smoke recert policy id", () => {
    expect(KDS_STAGING_SMOKE_ERA15_POLICY_ID).toBe("era15-kds-staging-smoke-recert-v1");
  });

  it("defines era15 scripts and chains cert into staging-smoke bundle", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_STAGING_SMOKE_ERA15_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[KDS_STAGING_SMOKE_ERA15_SMOKE_NPM_SCRIPT]).toContain(
      KDS_STAGING_SMOKE_ERA15_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:kds-staging-smoke:cert"]).toContain(
      "kds-staging-smoke-era15-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:kds-staging-smoke:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:kds-staging-smoke")).toBe(true);
  });

  it("keeps Playwright KDS staging optional — not in default ci.yml quality job", () => {
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8").toLowerCase();
    expect(ci).not.toContain("playwright-kds-staging");
    expect(ci).not.toContain("kds-realtime-staging.spec");
    expect(existsSync(join(ROOT, KDS_STAGING_SMOKE_ERA15_PLAYWRIGHT_WORKFLOW))).toBe(true);
    const workflow = readFileSync(join(ROOT, KDS_STAGING_SMOKE_ERA15_PLAYWRIGHT_WORKFLOW), "utf8");
    expect(workflow).toContain(KDS_STAGING_WORKFLOW_SECRETS_PASSWORD_ENV_EXPRESSION);
  });

  it("documents era15 recert in canonical docs without rush-hour certification", () => {
    const ops = readFileSync(join(ROOT, KDS_STAGING_SMOKE_ERA15_OPS_DOC), "utf8");
    for (const marker of KDS_STAGING_SMOKE_ERA15_CANONICAL_MARKERS) {
      expect(ops.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of KDS_STAGING_SMOKE_ERA15_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(KDS_STAGING_SMOKE_ERA15_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(KDS_STAGING_SMOKE_ERA15_POLICY_ID);
    const matrix = readFileSync(join(ROOT, "docs/feature-maturity-matrix.md"), "utf8");
    expect(matrix).not.toMatch(/rush[- ]?hour certified/i);
    for (const rel of KDS_STAGING_SMOKE_ERA15_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, KDS_STAGING_SMOKE_ERA15_SMOKE_SCRIPT))).toBe(true);
  });
});
