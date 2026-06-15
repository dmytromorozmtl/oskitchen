import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  STOREFRONT_STRIPE_E2E_ACCEPT_FORK_SKIP_WITHOUT_SECRETS,
  STOREFRONT_STRIPE_E2E_CANONICAL_DOC_MARKERS,
  STOREFRONT_STRIPE_E2E_CANONICAL_DOC_PATHS,
  STOREFRONT_STRIPE_E2E_FORBIDDEN_MATURITY_PHRASES,
  STOREFRONT_STRIPE_E2E_MATRIX_DOC,
  STOREFRONT_STRIPE_E2E_MATRIX_MARKERS,
  STOREFRONT_STRIPE_E2E_REQUIRED_SECRETS,
  STOREFRONT_STRIPE_E2E_SECRETS_POLICY_ID,
} from "@/lib/ci/storefront-stripe-e2e-policy";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("storefront Stripe E2E secrets policy certification (live repo)", () => {
  it("locks era7 explicit fork-skip acceptance for optional Stripe tier", () => {
    expect(STOREFRONT_STRIPE_E2E_SECRETS_POLICY_ID).toBe(
      "era7-storefront-stripe-secrets-accept-v1",
    );
    expect(STOREFRONT_STRIPE_E2E_ACCEPT_FORK_SKIP_WITHOUT_SECRETS).toBe(true);
    expect(STOREFRONT_STRIPE_E2E_REQUIRED_SECRETS).toEqual(["STRIPE_SECRET_KEY"]);
  });

  it("documents secrets and explicit skip policy in canonical docs", () => {
    for (const rel of STOREFRONT_STRIPE_E2E_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of STOREFRONT_STRIPE_E2E_CANONICAL_DOC_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      for (const phrase of STOREFRONT_STRIPE_E2E_FORBIDDEN_MATURITY_PHRASES) {
        expect(text, `${rel} contains forbidden "${phrase}"`).not.toContain(phrase);
      }
    }
    const matrix = readFileSync(join(ROOT, STOREFRONT_STRIPE_E2E_MATRIX_DOC), "utf8").toLowerCase();
    for (const marker of STOREFRONT_STRIPE_E2E_MATRIX_MARKERS) {
      expect(matrix, `matrix missing ${marker}`).toContain(marker.toLowerCase());
    }
    for (const phrase of STOREFRONT_STRIPE_E2E_FORBIDDEN_MATURITY_PHRASES) {
      expect(matrix, `matrix contains forbidden "${phrase}"`).not.toContain(phrase);
    }
  });

  it("gates optional Stripe E2E on repository secrets in storefront-money-path workflow", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    expect(workflow).toContain("storefront-money-path:");
    expect(workflow).toContain("secrets.STRIPE_SECRET_KEY != ''");
    expect(workflow).toContain("test:ci:storefront-stripe-e2e:policy");
    expect(workflow).toContain("storefront-stripe-e2e-summary");
  });

  it("includes secrets policy cert in storefront-money-path wiring bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:storefront-money-path:cert"]).toContain(
      "storefront-stripe-e2e-secrets-policy-cert-live.test.ts",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:storefront-money-path:cert")).toBe(
      true,
    );
  });
});
