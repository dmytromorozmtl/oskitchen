import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID,
  KDS_STAGING_WORKFLOW_SECRETS_ERA13_WORKFLOW,
  KDS_STAGING_WORKFLOW_SECRETS_CANONICAL_DOC_PATHS,
  KDS_STAGING_WORKFLOW_SECRETS_CANONICAL_MARKERS,
  KDS_STAGING_WORKFLOW_SECRETS_CI_SCRIPTS,
  KDS_STAGING_WORKFLOW_SECRETS_PASSWORD_ENV_EXPRESSION,
  KDS_STAGING_WORKFLOW_SECRETS_UNIT_TESTS,
} from "@/lib/ci/kds-staging-workflow-secrets-era13-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("kds staging workflow secrets era13 CI certification (live repo)", () => {
  it("locks era13 kds staging workflow secrets policy id", () => {
    expect(KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID).toBe(
      "era13-kds-staging-workflow-secrets-align-v1",
    );
  });

  it("defines era13 kds staging workflow secrets scripts", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_STAGING_WORKFLOW_SECRETS_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-realtime-e2e-staging-era11:cert"]).toContain(
      "kds-staging-workflow-secrets-era13-cert-live",
    );
  });

  it("maps kds staging workflow password secret to E2E_LOGIN_PASSWORD env", () => {
    const workflow = readFileSync(join(ROOT, KDS_STAGING_WORKFLOW_SECRETS_ERA13_WORKFLOW), "utf8");
    expect(workflow).toContain("secrets.E2E_LOGIN_PASSWORD");
    expect(workflow).toContain("secrets.E2E_PASSWORD");
    expect(workflow).toContain(KDS_STAGING_WORKFLOW_SECRETS_PASSWORD_ENV_EXPRESSION);
    expect(workflow).not.toMatch(
      /E2E_LOGIN_PASSWORD:\s*\$\{\{\s*secrets\.E2E_LOGIN_PASSWORD\s*\}\}(?!\s*\|\|)/,
    );
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).not.toContain("playwright-kds-staging.yml");
  });

  it("documents era13 kds staging workflow secrets in canonical docs", () => {
    for (const rel of KDS_STAGING_WORKFLOW_SECRETS_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID);
    for (const rel of KDS_STAGING_WORKFLOW_SECRETS_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
