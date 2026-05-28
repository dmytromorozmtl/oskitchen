import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCE_WEBHOOK_DRILL_ERA17_CANONICAL_DOC_PATHS,
  COMMERCE_WEBHOOK_DRILL_ERA17_CANONICAL_MARKERS,
  COMMERCE_WEBHOOK_DRILL_ERA17_CI_SCRIPTS,
  COMMERCE_WEBHOOK_DRILL_ERA17_DOC,
  COMMERCE_WEBHOOK_DRILL_ERA17_ORCHESTRATOR_SCRIPT,
  COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID,
  COMMERCE_WEBHOOK_DRILL_ERA17_REVIEW_SECTION,
  COMMERCE_WEBHOOK_DRILL_ERA17_UNIT_TESTS,
} from "@/lib/security/commerce-webhook-drill-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commerce webhook drill era17 CI certification (live repo)", () => {
  it("locks era17 commerce webhook drill policy id", () => {
    expect(COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID).toBe("era17-commerce-webhook-drill-v1");
  });

  it("defines era17 commerce webhook drill scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:commerce-webhook-drill"]).toContain(
      COMMERCE_WEBHOOK_DRILL_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of COMMERCE_WEBHOOK_DRILL_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:webhook-security-era16:cert"]).toContain(
      "commerce-webhook-drill-era17-cert-live",
    );
  });

  it("documents era17 commerce webhook drill in canonical docs", () => {
    expect(existsSync(join(ROOT, COMMERCE_WEBHOOK_DRILL_ERA17_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMMERCE_WEBHOOK_DRILL_ERA17_ORCHESTRATOR_SCRIPT))).toBe(true);
    for (const rel of COMMERCE_WEBHOOK_DRILL_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(COMMERCE_WEBHOOK_DRILL_ERA17_REVIEW_SECTION);
    for (const marker of COMMERCE_WEBHOOK_DRILL_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID);
    for (const rel of COMMERCE_WEBHOOK_DRILL_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
