import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  POS_BROWSER_E2E_ACCEPT_FORK_SKIP_WITHOUT_SECRETS,
  POS_BROWSER_E2E_CANONICAL_DOC_MARKERS,
  POS_BROWSER_E2E_CANONICAL_DOC_PATHS,
  POS_BROWSER_E2E_FORBIDDEN_MATURITY_PHRASES,
  POS_BROWSER_E2E_MATRIX_DOC,
  POS_BROWSER_E2E_MATRIX_MARKERS,
  POS_BROWSER_E2E_OPTIONAL_SECRETS,
  POS_BROWSER_E2E_REQUIRED_SECRETS,
  POS_BROWSER_E2E_SECRETS_POLICY_ID,
} from "@/lib/ci/pos-browser-e2e-policy";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("POS E2E secrets policy certification (live repo)", () => {
  it("locks era5 explicit fork-skip acceptance for optional browser tier", () => {
    expect(POS_BROWSER_E2E_SECRETS_POLICY_ID).toBe("era5-pos-e2e-secrets-accept-v1");
    expect(POS_BROWSER_E2E_ACCEPT_FORK_SKIP_WITHOUT_SECRETS).toBe(true);
    expect(POS_BROWSER_E2E_REQUIRED_SECRETS).toEqual(["E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"]);
    expect(POS_BROWSER_E2E_OPTIONAL_SECRETS).toContain("E2E_CI_POS_USER_ID");
  });

  it("documents secrets and explicit skip policy in canonical docs", () => {
    for (const rel of POS_BROWSER_E2E_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of POS_BROWSER_E2E_CANONICAL_DOC_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      for (const phrase of POS_BROWSER_E2E_FORBIDDEN_MATURITY_PHRASES) {
        expect(text, `${rel} contains forbidden "${phrase}"`).not.toContain(phrase);
      }
    }
    const matrix = readFileSync(join(ROOT, POS_BROWSER_E2E_MATRIX_DOC), "utf8").toLowerCase();
    for (const marker of POS_BROWSER_E2E_MATRIX_MARKERS) {
      expect(matrix, `matrix missing ${marker}`).toContain(marker.toLowerCase());
    }
    for (const phrase of POS_BROWSER_E2E_FORBIDDEN_MATURITY_PHRASES) {
      expect(matrix, `matrix contains forbidden "${phrase}"`).not.toContain(phrase);
    }
  });

  it("gates Playwright POS E2E on repository secrets in pos-money-path workflow", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    expect(workflow).toContain("pos-money-path:");
    expect(workflow).toContain("secrets.E2E_LOGIN_EMAIL != ''");
    expect(workflow).toContain("secrets.E2E_LOGIN_PASSWORD != ''");
    expect(workflow).toContain("test:ci:pos-browser-e2e:policy");
    expect(workflow).toContain("pos-browser-e2e-summary");
  });

  it("includes secrets policy cert in pos-money-path wiring bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:pos-money-path:cert"]).toContain(
      "pos-e2e-secrets-policy-cert-live.test.ts",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:pos-money-path:cert")).toBe(true);
  });
});
