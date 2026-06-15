import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  E2E_STAGING_SECRETS_CANONICAL_MARKERS,
  E2E_STAGING_SECRETS_CANONICAL_PASSWORD_SECRET,
  E2E_STAGING_SECRETS_CI_SCRIPTS,
  E2E_STAGING_SECRETS_ERA12_POLICY_ID,
  E2E_STAGING_SECRETS_LEGACY_PASSWORD_SECRET,
  E2E_STAGING_SECRETS_PASSWORD_ENV_EXPRESSION,
  E2E_STAGING_SECRETS_PLAYWRIGHT_CONFIG_MARKERS,
  E2E_STAGING_SECRETS_UNIT_TESTS,
  E2E_STAGING_SECRETS_WORKFLOWS,
  E2E_STAGING_SECRETS_CANONICAL_DOC_PATHS,
} from "@/lib/ci/e2e-staging-secrets-era12-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("e2e staging secrets era12 CI certification (live repo)", () => {
  it("locks era12 staging secrets alignment policy id", () => {
    expect(E2E_STAGING_SECRETS_ERA12_POLICY_ID).toBe("era12-e2e-staging-secrets-align-v1");
  });

  it("defines era12 staging secrets scripts", () => {
    const scripts = readPackageScripts();
    for (const name of E2E_STAGING_SECRETS_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(governanceBundlesIncludesCert(scripts, "test:ci:e2e-staging-secrets-era12:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:e2e-staging-secrets-era12")).toBe(true);
  });

  it("maps staging workflow password secret to E2E_LOGIN_PASSWORD env", () => {
    for (const rel of E2E_STAGING_SECRETS_WORKFLOWS) {
      const workflow = readFileSync(join(ROOT, rel), "utf8");
      expect(workflow).toContain("secrets.E2E_LOGIN_PASSWORD");
      expect(workflow).toContain("secrets.E2E_PASSWORD");
      expect(workflow).toContain(E2E_STAGING_SECRETS_PASSWORD_ENV_EXPRESSION);
      expect(workflow).toContain(`${E2E_STAGING_SECRETS_CANONICAL_PASSWORD_SECRET}:`);
      expect(workflow).not.toMatch(/env:\s*\n[\s\S]*E2E_PASSWORD:\s*\$\{\{\s*secrets\.E2E_PASSWORD\s*\}\}/);
    }
  });

  it("aligns playwright config with canonical login env names", () => {
    const config = readFileSync(join(ROOT, "playwright.config.ts"), "utf8");
    for (const marker of E2E_STAGING_SECRETS_PLAYWRIGHT_CONFIG_MARKERS) {
      expect(config).toContain(marker);
    }
    const authSetup = readFileSync(join(ROOT, "e2e/auth.setup.ts"), "utf8");
    expect(authSetup).toContain(E2E_STAGING_SECRETS_CANONICAL_PASSWORD_SECRET);
  });

  it("documents era12 staging secrets alignment in canonical docs", () => {
    for (const rel of E2E_STAGING_SECRETS_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of E2E_STAGING_SECRETS_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      expect(text).toContain(E2E_STAGING_SECRETS_LEGACY_PASSWORD_SECRET.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(E2E_STAGING_SECRETS_ERA12_POLICY_ID);
    for (const rel of E2E_STAGING_SECRETS_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
