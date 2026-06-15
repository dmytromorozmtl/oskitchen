import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CANONICAL_DOC_PATHS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CANONICAL_MARKERS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CI_SCRIPTS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_ORCHESTRATOR_SCRIPT,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_REVIEW_SECTION,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_UNIT_TESTS,
} from "@/lib/ci/staging-workflows-first-green-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("staging workflows first green era17 CI certification (live repo)", () => {
  it("locks era17 staging workflows first green policy id", () => {
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID).toBe(
      "era17-staging-workflows-first-green-v1",
    );
  });

  it("defines era17 staging workflows first green scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:staging-workflows-first-green"]).toContain(
      STAGING_WORKFLOWS_FIRST_GREEN_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:e2e-staging-secrets-era12:cert"]).toContain(
      "staging-workflows-first-green-era17-cert-live",
    );
  });

  it("documents era17 first green proof in canonical docs", () => {
    const opsDoc = readFileSync(join(ROOT, "docs/GITHUB_E2E_STAGING_SECRETS.md"), "utf8");
    expect(opsDoc).toContain(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID);
    for (const marker of STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CANONICAL_MARKERS) {
      expect(opsDoc.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID.toLowerCase());
    }
    expect(opsDoc).toContain(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID);
    for (const rel of STAGING_WORKFLOWS_FIRST_GREEN_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
