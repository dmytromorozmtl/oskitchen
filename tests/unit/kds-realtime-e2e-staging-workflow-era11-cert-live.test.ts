import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_REALTIME_E2E_STAGING_WORKFLOW_ARTIFACT_NAME,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_CANONICAL_DOC_PATHS,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_CANONICAL_MARKERS,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_CI_SCRIPTS,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_ENV_MARKERS,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_FILE,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_JOB_ID,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_PLAYWRIGHT_STEP_ID,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_POLICY_STEP_ID,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_REQUIRED_SECRETS,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_SCRIPT_MARKERS,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_UNIT_TESTS,
} from "@/lib/ci/kds-realtime-e2e-staging-workflow-era11-policy";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");
const STAGING_WORKFLOW = join(ROOT, KDS_REALTIME_E2E_STAGING_WORKFLOW_FILE);

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("kds realtime e2e staging workflow era11 CI certification (live repo)", () => {
  it("locks era11 staging workflow policy id", () => {
    expect(KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID).toBe(
      "era11-kds-realtime-e2e-staging-workflow-v1",
    );
  });

  it("defines workflow era11 cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_REALTIME_E2E_STAGING_WORKFLOW_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-realtime-e2e-staging-era11:cert"]).toContain(
      "kds-realtime-e2e-staging-workflow-era11-cert-live",
    );
  });

  it("wires optional staging workflow with policy summary and artifact upload", () => {
    expect(existsSync(STAGING_WORKFLOW)).toBe(true);
    const workflow = readFileSync(STAGING_WORKFLOW, "utf8");
    expect(workflow).toContain(`${KDS_REALTIME_E2E_STAGING_WORKFLOW_JOB_ID}:`);
    expect(workflow).toContain(`id: ${KDS_REALTIME_E2E_STAGING_WORKFLOW_PLAYWRIGHT_STEP_ID}`);
    expect(workflow).toContain(`id: ${KDS_REALTIME_E2E_STAGING_WORKFLOW_POLICY_STEP_ID}`);
    expect(workflow).toContain(KDS_REALTIME_E2E_STAGING_WORKFLOW_ARTIFACT_NAME);
    for (const secret of KDS_REALTIME_E2E_STAGING_WORKFLOW_REQUIRED_SECRETS) {
      expect(workflow).toContain(secret);
    }
    for (const marker of KDS_REALTIME_E2E_STAGING_WORKFLOW_ENV_MARKERS) {
      expect(workflow).toContain(marker);
    }
    for (const script of KDS_REALTIME_E2E_STAGING_WORKFLOW_SCRIPT_MARKERS) {
      expect(workflow).toContain(script);
    }
    expect(workflow).toContain("workflow_dispatch");
  });

  it("does not wire kds staging playwright into default ci.yml", () => {
    const ci = readFileSync(CI_WORKFLOW, "utf8");
    expect(ci).not.toContain("playwright-kds-staging.yml");
    expect(ci).not.toContain("test:ci:kds-realtime-e2e-staging:playwright");
    expect(ci).not.toContain("kds-realtime-e2e-staging-ci-policy");
  });

  it("documents staging workflow in canonical docs", () => {
    for (const rel of KDS_REALTIME_E2E_STAGING_WORKFLOW_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of KDS_REALTIME_E2E_STAGING_WORKFLOW_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID);
    for (const rel of KDS_REALTIME_E2E_STAGING_WORKFLOW_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
