import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PARTNER_WEBHOOK_ERA17_CANONICAL_DOC_PATHS,
  PARTNER_WEBHOOK_ERA17_CANONICAL_MARKERS,
  PARTNER_WEBHOOK_ERA17_CI_SCRIPTS,
  PARTNER_WEBHOOK_ERA17_ORCHESTRATOR_SCRIPT,
  PARTNER_WEBHOOK_ERA17_PACK_MODULE,
  PARTNER_WEBHOOK_ERA17_PARTNER_DOC,
  PARTNER_WEBHOOK_ERA17_POLICY_ID,
  PARTNER_WEBHOOK_ERA17_REVIEW_SECTION,
  PARTNER_WEBHOOK_ERA17_UNIT_TESTS,
} from "@/lib/developer/partner-webhook-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("partner webhook docs era17 CI certification (live repo)", () => {
  it("locks era17 partner webhook docs policy id", () => {
    expect(PARTNER_WEBHOOK_ERA17_POLICY_ID).toBe("era17-partner-webhook-docs-v1");
  });

  it("defines era17 partner webhook docs scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:partner-webhook-docs"]).toContain(
      PARTNER_WEBHOOK_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of PARTNER_WEBHOOK_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:webhook-security-era16:cert"]).toContain(
      "partner-webhook-docs-era17-cert-live",
    );
  });

  it("wires pack module and partner doc", () => {
    expect(existsSync(join(ROOT, PARTNER_WEBHOOK_ERA17_PARTNER_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PARTNER_WEBHOOK_ERA17_PACK_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, PARTNER_WEBHOOK_ERA17_ORCHESTRATOR_SCRIPT))).toBe(true);
  });

  it("documents era17 partner webhook docs in canonical docs", () => {
    for (const rel of PARTNER_WEBHOOK_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PARTNER_WEBHOOK_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PARTNER_WEBHOOK_ERA17_REVIEW_SECTION);
    for (const marker of PARTNER_WEBHOOK_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PARTNER_WEBHOOK_ERA17_POLICY_ID);
    for (const rel of PARTNER_WEBHOOK_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
