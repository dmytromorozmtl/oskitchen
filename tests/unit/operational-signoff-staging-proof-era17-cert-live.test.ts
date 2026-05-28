import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CANONICAL_DOC_PATHS,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CANONICAL_MARKERS,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CI_SCRIPTS,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_ORCHESTRATOR_SCRIPT,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_REVIEW_SECTION,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_SUMMARY_ARTIFACT,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_UNIT_TESTS,
} from "@/lib/operations/operational-signoff-staging-proof-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("operational signoff staging proof era17 CI certification (live repo)", () => {
  it("locks era17 operational signoff staging proof policy id", () => {
    expect(OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID).toBe(
      "era17-operational-signoff-staging-proof-v1",
    );
  });

  it("defines era17 operational signoff staging proof scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:operational-signoff-staging"]).toContain(
      OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:operational-signoff-era16:cert"]).toContain(
      "operational-signoff-staging-proof-era17-cert-live",
    );
  });

  it("documents era17 operational signoff staging proof in canonical docs", () => {
    expect(existsSync(join(ROOT, OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    for (const rel of OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(
        OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID.toLowerCase(),
      );
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_REVIEW_SECTION);
    expect(runbook).toContain(OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_SUMMARY_ARTIFACT);
    for (const marker of OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID);
    for (const rel of OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
