import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  CHANNEL_LIVE_SMOKE_ERA16_CANONICAL_DOC_PATHS,
  CHANNEL_LIVE_SMOKE_ERA16_CANONICAL_MARKERS,
  CHANNEL_LIVE_SMOKE_ERA16_CI_SCRIPTS,
  CHANNEL_LIVE_SMOKE_ERA16_FORBIDDEN_CLAIMS,
  CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT,
  CHANNEL_LIVE_SMOKE_ERA16_ORCHESTRATOR_SCRIPT,
  CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID,
  CHANNEL_LIVE_SMOKE_ERA16_REVIEW_SECTION,
  CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT,
  CHANNEL_LIVE_SMOKE_ERA16_UNIT_TESTS,
  CHANNEL_LIVE_SMOKE_ERA16_WORKFLOW,
} from "@/lib/integrations/channel-live-smoke-era16-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("channel live smoke era16 CI certification (live repo)", () => {
  it("locks era16 channel live smoke policy id", () => {
    expect(CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID).toBe("era16-channel-live-smoke-v1");
  });

  it("defines era16 smoke scripts chained into channel golden-path cert", () => {
    const scripts = readPackageScripts();
    for (const name of CHANNEL_LIVE_SMOKE_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT]).toContain(
      CHANNEL_LIVE_SMOKE_ERA16_ORCHESTRATOR_SCRIPT,
    );
    expect(scripts["test:ci:channel-golden-path:cert"]).toContain(
      "channel-live-smoke-era16-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:channel-golden-path:cert")).toBe(
      true,
    );
  });

  it("wires orchestrator, workflow, and summary artifact without default CI", () => {
    expect(existsSync(join(ROOT, CHANNEL_LIVE_SMOKE_ERA16_ORCHESTRATOR_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, CHANNEL_LIVE_SMOKE_ERA16_WORKFLOW))).toBe(true);
    const orchestrator = readFileSync(
      join(ROOT, CHANNEL_LIVE_SMOKE_ERA16_ORCHESTRATOR_SCRIPT),
      "utf8",
    );
    expect(orchestrator).toContain("SKIPPED WITH REASON");
    expect(orchestrator).toContain("CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT");
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).not.toContain("smoke:woo-shopify-live");
    expect(ci).not.toContain("woo-shopify-staging-smoke");
  });

  it("documents era16 live smoke in canonical docs without forbidden claims", () => {
    for (const rel of CHANNEL_LIVE_SMOKE_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of CHANNEL_LIVE_SMOKE_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      for (const forbidden of CHANNEL_LIVE_SMOKE_ERA16_FORBIDDEN_CLAIMS) {
        expect(text).not.toContain(forbidden.toLowerCase());
      }
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(CHANNEL_LIVE_SMOKE_ERA16_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID);
    for (const rel of CHANNEL_LIVE_SMOKE_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
