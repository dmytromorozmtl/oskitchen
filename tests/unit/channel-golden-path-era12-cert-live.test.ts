import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  CHANNEL_GOLDEN_PATH_ERA12_CANONICAL_DOC_PATHS,
  CHANNEL_GOLDEN_PATH_ERA12_CANONICAL_MARKERS,
  CHANNEL_GOLDEN_PATH_ERA12_CI_SCRIPTS,
  CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_UNIT_TESTS,
} from "@/lib/integrations/channel-golden-path-era12-policy";
import { CHANNEL_GOLDEN_PATH_HONEST_SCOPE } from "@/lib/integrations/channel-golden-path-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("channel golden path era12 CI certification (live repo)", () => {
  it("locks era12 channel golden path recert policy id", () => {
    expect(CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID).toBe(
      "era12-channel-golden-path-recert-v1",
    );
    expect(CHANNEL_GOLDEN_PATH_HONEST_SCOPE.kitchenOrderAutoCreateFromWebhook).toBe(
      false,
    );
  });

  it("defines era12 recert scripts and chains cert into channel golden path bundle", () => {
    const scripts = readPackageScripts();
    for (const name of CHANNEL_GOLDEN_PATH_ERA12_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:channel-golden-path:cert"]).toContain(
      "channel-golden-path-era12-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:channel-golden-path:cert"),
    ).toBe(true);
  });

  it("documents era12 recert in canonical docs", () => {
    for (const rel of CHANNEL_GOLDEN_PATH_ERA12_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of CHANNEL_GOLDEN_PATH_ERA12_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID);
    for (const rel of CHANNEL_GOLDEN_PATH_ERA12_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
