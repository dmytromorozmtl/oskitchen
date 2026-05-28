import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_CANONICAL_DOC_PATHS,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_CANONICAL_MARKERS,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_CI_SCRIPTS,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_COMPONENT,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_DOC,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_REVIEW_SECTION,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_UNIT_TESTS,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_WIRED_PAGES,
} from "@/lib/integrations/channel-pilot-setup-wizard-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("channel pilot setup wizard era17 CI certification (live repo)", () => {
  it("locks era17 channel pilot setup wizard policy id", () => {
    expect(CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID).toBe(
      "era17-channel-pilot-setup-wizard-v1",
    );
  });

  it("defines era17 channel pilot setup wizard cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of CHANNEL_PILOT_SETUP_WIZARD_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:channel-pilot-playbook-era17:cert"]).toContain(
      "channel-pilot-setup-wizard-era17-cert-live",
    );
  });

  it("documents era17 channel pilot setup wizard in canonical docs", () => {
    expect(existsSync(join(ROOT, CHANNEL_PILOT_SETUP_WIZARD_ERA17_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, CHANNEL_PILOT_SETUP_WIZARD_ERA17_DOC), "utf8");
    expect(doc).toContain(CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID);
    for (const rel of CHANNEL_PILOT_SETUP_WIZARD_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(CHANNEL_PILOT_SETUP_WIZARD_ERA17_REVIEW_SECTION);
    for (const marker of CHANNEL_PILOT_SETUP_WIZARD_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID);
    for (const rel of CHANNEL_PILOT_SETUP_WIZARD_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const page of CHANNEL_PILOT_SETUP_WIZARD_ERA17_WIRED_PAGES) {
      const text = readFileSync(join(ROOT, page), "utf8");
      expect(text).toContain("ChannelPilotSetupWizard");
    }
    expect(existsSync(join(ROOT, CHANNEL_PILOT_SETUP_WIZARD_ERA17_COMPONENT))).toBe(true);
  });
});
