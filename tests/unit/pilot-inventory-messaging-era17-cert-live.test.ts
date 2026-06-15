import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_INVENTORY_MESSAGING_ERA17_CANONICAL_DOC_PATHS,
  PILOT_INVENTORY_MESSAGING_ERA17_CANONICAL_MARKERS,
  PILOT_INVENTORY_MESSAGING_ERA17_CI_SCRIPTS,
  PILOT_INVENTORY_MESSAGING_ERA17_DOC,
  PILOT_INVENTORY_MESSAGING_ERA17_ORCHESTRATOR_SCRIPT,
  PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID,
  PILOT_INVENTORY_MESSAGING_ERA17_REQUIRED_SECTIONS,
  PILOT_INVENTORY_MESSAGING_ERA17_REVIEW_SECTION,
  PILOT_INVENTORY_MESSAGING_ERA17_SUMMARY_MODULE,
  PILOT_INVENTORY_MESSAGING_ERA17_UNIT_TESTS,
} from "@/lib/inventory/pilot-inventory-messaging-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot inventory messaging era17 CI certification (live repo)", () => {
  it("locks era17 pilot inventory messaging policy id", () => {
    expect(PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID).toBe(
      "era17-pilot-inventory-messaging-v1",
    );
  });

  it("defines era17 pilot inventory messaging scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:pilot-inventory-messaging"]).toContain(
      PILOT_INVENTORY_MESSAGING_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of PILOT_INVENTORY_MESSAGING_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:inventory-depletion:cert"]).toContain(
      "pilot-inventory-messaging-era17-cert-live",
    );
  });

  it("wires summary module and sales training doc", () => {
    expect(existsSync(join(ROOT, PILOT_INVENTORY_MESSAGING_ERA17_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PILOT_INVENTORY_MESSAGING_ERA17_SUMMARY_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, PILOT_INVENTORY_MESSAGING_ERA17_ORCHESTRATOR_SCRIPT))).toBe(true);
  });

  it("documents era17 pilot inventory messaging in canonical docs", () => {
    const doc = readFileSync(join(ROOT, PILOT_INVENTORY_MESSAGING_ERA17_DOC), "utf8");
    for (const section of PILOT_INVENTORY_MESSAGING_ERA17_REQUIRED_SECTIONS) {
      expect(doc, section).toContain(section);
    }
    for (const rel of PILOT_INVENTORY_MESSAGING_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PILOT_INVENTORY_MESSAGING_ERA17_REVIEW_SECTION);
    for (const marker of PILOT_INVENTORY_MESSAGING_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID);
    for (const rel of PILOT_INVENTORY_MESSAGING_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
