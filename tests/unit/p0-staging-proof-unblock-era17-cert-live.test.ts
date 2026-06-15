import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  P0_STAGING_PROOF_UNBLOCK_ERA17_CANONICAL_DOC_PATHS,
  P0_STAGING_PROOF_UNBLOCK_ERA17_CANONICAL_MARKERS,
  P0_STAGING_PROOF_UNBLOCK_ERA17_CI_SCRIPTS,
  P0_STAGING_PROOF_UNBLOCK_ERA17_ORCHESTRATOR_SCRIPT,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_REVIEW_SECTION,
  P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT,
  P0_STAGING_PROOF_UNBLOCK_ERA17_UNIT_TESTS,
} from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("p0 staging proof unblock era17 CI certification (live repo)", () => {
  it("locks era17 p0 staging proof unblock policy id", () => {
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID).toBe(
      "era17-p0-staging-proof-unblock-v1",
    );
  });

  it("defines era17 p0 staging proof unblock cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of P0_STAGING_PROOF_UNBLOCK_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:commercial-pilot-runbook:cert"]).toContain(
      "p0-staging-proof-unblock-era17-cert-live",
    );
    expect(scripts["smoke:p0-staging-proof-unblock"]).toContain(
      "smoke-p0-staging-proof-unblock-era17",
    );
  });

  it("documents era17 p0 staging proof unblock in canonical docs", () => {
    expect(existsSync(join(ROOT, P0_STAGING_PROOF_UNBLOCK_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    for (const rel of P0_STAGING_PROOF_UNBLOCK_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(P0_STAGING_PROOF_UNBLOCK_ERA17_REVIEW_SECTION);
    expect(runbook).toContain(P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT);
    for (const marker of P0_STAGING_PROOF_UNBLOCK_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID);
    for (const rel of P0_STAGING_PROOF_UNBLOCK_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
