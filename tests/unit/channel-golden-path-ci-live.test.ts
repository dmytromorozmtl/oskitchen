import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  CHANNEL_GOLDEN_PATH_CI_SCRIPTS,
  CHANNEL_GOLDEN_PATH_FIXTURES,
  CHANNEL_GOLDEN_PATH_HONEST_SCOPE,
  CHANNEL_GOLDEN_PATH_POLICY_ID,
  CHANNEL_GOLDEN_PATH_UNIT_TESTS,
  CHANNEL_GOLDEN_PATH_WEBHOOK_PROCESSORS,
} from "@/lib/integrations/channel-golden-path-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("channel golden path CI certification (live repo)", () => {
  it("locks era4 channel golden-path policy and honest scope", () => {
    expect(CHANNEL_GOLDEN_PATH_POLICY_ID).toBe("era4-channel-golden-path-v1");
    expect(CHANNEL_GOLDEN_PATH_HONEST_SCOPE.kitchenOrderAutoCreateFromWebhook).toBe(false);
    expect(CHANNEL_GOLDEN_PATH_HONEST_SCOPE.externalOrderAndStagingCertified).toBe(true);
  });

  it("defines channel golden-path CI scripts and unit bundle", () => {
    const scripts = readPackageScripts();
    for (const name of CHANNEL_GOLDEN_PATH_CI_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:channel-golden-path"]).toContain("channel-golden-path.test.ts");
    expect(scripts["test:ci:channel-golden-path:cert"]).toContain("channel-golden-path-ci-live.test.ts");
  });

  it("includes channel golden-path cert in governance bundles", () => {
    const scripts = readPackageScripts();
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:channel-golden-path:cert"),
    ).toBe(true);
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:channel-golden-path"),
    ).toBe(true);
    expect(scripts["test:ci:channel-golden-path:cert"]).toContain(
      "channel-golden-path-era12-cert-live",
    );
  });

  it("wires webhook processors, fixtures, and unit tests on disk", () => {
    for (const rel of Object.values(CHANNEL_GOLDEN_PATH_WEBHOOK_PROCESSORS)) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const rel of Object.values(CHANNEL_GOLDEN_PATH_FIXTURES)) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const rel of CHANNEL_GOLDEN_PATH_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, CHANNEL_GOLDEN_PATH_HONEST_SCOPE.stagingSmokeScript))).toBe(true);
  });

  it("documents era4 channel golden path in canonical CI tier matrix", () => {
    const matrix = readFileSync(join(ROOT, "docs/ci-e2e-tier-matrix.md"), "utf8");
    expect(matrix).toContain("era4-channel-golden-path-v1");
    expect(matrix).toContain("test:ci:channel-golden-path");
    expect(matrix).toMatch(/kitchenOrderAutoCreateFromWebhook.*false|does not certify.*kitchen Order/i);
  });

  it("aligns feature maturity matrix with honest partial-integration scope", () => {
    const maturity = readFileSync(join(ROOT, "docs/feature-maturity-matrix.md"), "utf8");
    expect(maturity).toContain("era4-channel-golden-path-v1");
    expect(maturity).toMatch(/externalOrder|channel import|golden path/i);
  });
});
