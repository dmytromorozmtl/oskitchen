import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  CHANNEL_GOLDEN_PATH_ERA14_CANONICAL_DOC_PATHS,
  CHANNEL_GOLDEN_PATH_ERA14_CANONICAL_MARKERS,
  CHANNEL_GOLDEN_PATH_ERA14_CI_SCRIPTS,
  CHANNEL_GOLDEN_PATH_ERA14_OPS_DOC,
  CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA14_SMOKE_NPM_SCRIPT,
  CHANNEL_GOLDEN_PATH_ERA14_SMOKE_SCRIPT,
  CHANNEL_GOLDEN_PATH_ERA14_UNIT_TESTS,
} from "@/lib/integrations/channel-golden-path-era14-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("channel golden path era14 CI certification (live repo)", () => {
  it("locks era14 channel golden path recert policy id", () => {
    expect(CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID).toBe(
      "era14-channel-golden-path-recert-v1",
    );
  });

  it("defines era14 scripts and chains cert into channel golden path bundle", () => {
    const scripts = readPackageScripts();
    for (const name of CHANNEL_GOLDEN_PATH_ERA14_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[CHANNEL_GOLDEN_PATH_ERA14_SMOKE_NPM_SCRIPT]).toContain(
      CHANNEL_GOLDEN_PATH_ERA14_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:channel-golden-path:cert"]).toContain(
      "channel-golden-path-era14-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:channel-golden-path:cert"),
    ).toBe(true);
  });

  it("does not wire live woo/shopify smoke into default ci.yml quality job", () => {
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8").toLowerCase();
    expect(ci).not.toContain("smoke:woo-shopify");
    expect(ci).not.toContain("smoke-channel-golden-path");
  });

  it("documents era14 recert in canonical docs", () => {
    const ops = readFileSync(join(ROOT, CHANNEL_GOLDEN_PATH_ERA14_OPS_DOC), "utf8");
    for (const marker of CHANNEL_GOLDEN_PATH_ERA14_CANONICAL_MARKERS) {
      expect(ops.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of CHANNEL_GOLDEN_PATH_ERA14_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID);
    for (const rel of CHANNEL_GOLDEN_PATH_ERA14_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, CHANNEL_GOLDEN_PATH_ERA14_SMOKE_SCRIPT))).toBe(true);
  });
});
