import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CANONICAL_DOC_PATHS,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CANONICAL_MARKERS,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CI_SCRIPTS,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_ORCHESTRATOR_SCRIPT,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_REVIEW_SECTION,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_SUMMARY_ARTIFACT,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_UNIT_TESTS,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_WORKFLOW,
} from "@/lib/kitchen/kds-staging-playwright-proof-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("kds staging playwright proof era17 CI certification (live repo)", () => {
  it("locks era17 kds staging playwright proof policy id", () => {
    expect(KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID).toBe(
      "era17-kds-staging-playwright-proof-v1",
    );
  });

  it("defines era17 kds staging playwright proof scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:kds-staging-playwright"]).toContain(
      KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-staging-smoke:cert"]).toContain(
      "kds-staging-playwright-proof-era17-cert-live",
    );
  });

  it("documents era17 kds staging playwright proof in canonical docs", () => {
    expect(existsSync(join(ROOT, KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_WORKFLOW))).toBe(true);
    for (const rel of KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(
        KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID.toLowerCase(),
      );
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_REVIEW_SECTION);
    expect(runbook).toContain(KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_SUMMARY_ARTIFACT);
    for (const marker of KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID);
    for (const rel of KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
