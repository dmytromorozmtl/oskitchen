import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CANONICAL_DOC_PATHS,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CANONICAL_MARKERS,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CI_SCRIPTS,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_IN_DEFAULT_CI,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_NPM_SCRIPT,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_SCRIPT,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_SCRIPT_MARKERS,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_UNIT_TESTS,
} from "@/lib/integrations/channel-golden-path-smoke-era12-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("channel golden path smoke era12 CI certification (live repo)", () => {
  it("locks era12 staging smoke policy id", () => {
    expect(CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID).toBe(
      "era12-channel-golden-path-smoke-v1",
    );
    expect(CHANNEL_GOLDEN_PATH_ERA12_SMOKE_IN_DEFAULT_CI).toBe(false);
  });

  it("defines era12 smoke scripts and chains into channel golden-path cert", () => {
    const scripts = readPackageScripts();
    for (const name of CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[CHANNEL_GOLDEN_PATH_ERA12_SMOKE_NPM_SCRIPT]).toContain(
      CHANNEL_GOLDEN_PATH_ERA12_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:channel-golden-path:cert"]).toContain(
      "channel-golden-path-smoke-era12-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:channel-golden-path:cert")).toBe(
      true,
    );
  });

  it("wires smoke script with skip-live and certification runner", () => {
    expect(existsSync(join(ROOT, CHANNEL_GOLDEN_PATH_ERA12_SMOKE_SCRIPT))).toBe(true);
    const smoke = readFileSync(join(ROOT, CHANNEL_GOLDEN_PATH_ERA12_SMOKE_SCRIPT), "utf8");
    for (const marker of CHANNEL_GOLDEN_PATH_ERA12_SMOKE_SCRIPT_MARKERS) {
      expect(smoke, marker).toContain(marker);
    }
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).not.toContain("smoke:woo-shopify");
    expect(ci).not.toContain("smoke-woo-shopify-certification");
  });

  it("documents era12 staging smoke in canonical docs", () => {
    for (const rel of CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID);
    for (const rel of CHANNEL_GOLDEN_PATH_ERA12_SMOKE_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
