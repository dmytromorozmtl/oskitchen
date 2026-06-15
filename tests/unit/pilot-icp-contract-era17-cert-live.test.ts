import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_ICP_CONTRACT_ERA17_CANONICAL_DOC_PATHS,
  PILOT_ICP_CONTRACT_ERA17_CANONICAL_MARKERS,
  PILOT_ICP_CONTRACT_ERA17_CI_SCRIPTS,
  PILOT_ICP_CONTRACT_ERA17_DOC,
  PILOT_ICP_CONTRACT_ERA17_MODULE,
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  PILOT_ICP_CONTRACT_ERA17_REQUIRED_SECTIONS,
  PILOT_ICP_CONTRACT_ERA17_REVIEW_SECTION,
  PILOT_ICP_CONTRACT_ERA17_UNIT_TESTS,
} from "@/lib/commercial/pilot-icp-contract-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot icp contract era17 CI certification (live repo)", () => {
  it("locks era17 pilot ICP contract policy id", () => {
    expect(PILOT_ICP_CONTRACT_ERA17_POLICY_ID).toBe("era17-pilot-icp-contract-v1");
  });

  it("defines era17 pilot ICP contract cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of PILOT_ICP_CONTRACT_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:commercial-pilot-runbook:cert"]).toContain(
      "pilot-icp-contract-era17-cert-live",
    );
  });

  it("documents era17 pilot ICP contract in canonical docs", () => {
    expect(existsSync(join(ROOT, PILOT_ICP_CONTRACT_ERA17_MODULE))).toBe(true);
    const template = readFileSync(join(ROOT, PILOT_ICP_CONTRACT_ERA17_DOC), "utf8");
    for (const section of PILOT_ICP_CONTRACT_ERA17_REQUIRED_SECTIONS) {
      expect(template, section).toContain(section);
    }
    for (const rel of PILOT_ICP_CONTRACT_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PILOT_ICP_CONTRACT_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PILOT_ICP_CONTRACT_ERA17_REVIEW_SECTION);
    for (const marker of PILOT_ICP_CONTRACT_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PILOT_ICP_CONTRACT_ERA17_POLICY_ID);
    for (const rel of PILOT_ICP_CONTRACT_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
