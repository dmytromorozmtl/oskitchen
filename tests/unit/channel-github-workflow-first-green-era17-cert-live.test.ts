import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CANONICAL_DOC_PATHS,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CANONICAL_MARKERS,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CI_SCRIPTS,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_ORCHESTRATOR_SCRIPT,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_REVIEW_SECTION,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_UNIT_TESTS,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW,
} from "@/lib/integrations/channel-github-workflow-first-green-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("channel github workflow first green era17 CI certification (live repo)", () => {
  it("locks era17 channel GitHub workflow policy id", () => {
    expect(CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID).toBe(
      "era17-channel-github-workflow-first-green-v1",
    );
  });

  it("defines era17 channel GitHub workflow scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:channel-github-workflow-first-green"]).toContain(
      CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:channel-golden-path:cert"]).toContain(
      "channel-github-workflow-first-green-era17-cert-live",
    );
  });

  it("documents era17 channel GitHub workflow in canonical docs", () => {
    expect(existsSync(join(ROOT, CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW))).toBe(true);
    for (const rel of CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(
        CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID.toLowerCase(),
      );
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_REVIEW_SECTION);
    for (const marker of CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID);
    for (const rel of CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
