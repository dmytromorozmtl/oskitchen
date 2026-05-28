import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CANONICAL_DOC_PATHS,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CANONICAL_MARKERS,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CI_SCRIPTS,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_ORCHESTRATOR_SCRIPT,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_REVIEW_SECTION,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_UNIT_TESTS,
} from "@/lib/security/webhook-replay-p1-expansion-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("webhook replay p1 expansion era17 CI certification (live repo)", () => {
  it("locks era17 webhook replay p1 expansion policy id", () => {
    expect(WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID).toBe(
      "era17-webhook-replay-p1-expansion-v1",
    );
  });

  it("defines era17 webhook replay p1 expansion scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:webhook-replay-p1-expansion"]).toContain(
      WEBHOOK_REPLAY_P1_EXPANSION_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:webhook-security-era16:cert"]).toContain(
      "webhook-replay-p1-expansion-era17-cert-live",
    );
  });

  it("documents era17 webhook replay p1 expansion in canonical docs", () => {
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_P1_EXPANSION_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    for (const rel of WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(
        WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID.toLowerCase(),
      );
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(WEBHOOK_REPLAY_P1_EXPANSION_ERA17_REVIEW_SECTION);
    for (const marker of WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID);
    for (const rel of WEBHOOK_REPLAY_P1_EXPANSION_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
