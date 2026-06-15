import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OPERATIONAL_SIGNOFF_ERA16_CANONICAL_DOC_PATHS,
  OPERATIONAL_SIGNOFF_ERA16_CANONICAL_MARKERS,
  OPERATIONAL_SIGNOFF_ERA16_CERT_SCRIPT,
  OPERATIONAL_SIGNOFF_ERA16_CI_SCRIPTS,
  OPERATIONAL_SIGNOFF_ERA16_FORBIDDEN_CLAIMS,
  OPERATIONAL_SIGNOFF_ERA16_ORCHESTRATOR_SCRIPT,
  OPERATIONAL_SIGNOFF_ERA16_POLICY_ID,
  OPERATIONAL_SIGNOFF_ERA16_REVIEW_SECTION,
  OPERATIONAL_SIGNOFF_ERA16_RUNBOOK_DOC,
  OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT,
  OPERATIONAL_SIGNOFF_ERA16_SUMMARY_MODULE,
  OPERATIONAL_SIGNOFF_ERA16_UNIT_TESTS,
} from "@/lib/operations/operational-signoff-era16-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("operational signoff era16 CI certification (live repo)", () => {
  it("locks era16 operational signoff policy id", () => {
    expect(OPERATIONAL_SIGNOFF_ERA16_POLICY_ID).toBe("era16-operational-signoff-v1");
  });

  it("defines era16 operational signoff scripts chained into kds staging smoke cert", () => {
    const scripts = readPackageScripts();
    for (const name of OPERATIONAL_SIGNOFF_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["smoke:operational-signoff-era16"]).toContain(
      OPERATIONAL_SIGNOFF_ERA16_ORCHESTRATOR_SCRIPT,
    );
    expect(scripts["cert:operational-signoff-era16"]).toContain(
      OPERATIONAL_SIGNOFF_ERA16_CERT_SCRIPT,
    );
    expect(scripts["test:ci:kds-staging-smoke:cert"]).toContain(
      "test:ci:operational-signoff-era16:cert",
    );
  });

  it("wires summary module, scripts, and artifact path", () => {
    expect(existsSync(join(ROOT, OPERATIONAL_SIGNOFF_ERA16_SUMMARY_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, OPERATIONAL_SIGNOFF_ERA16_ORCHESTRATOR_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, OPERATIONAL_SIGNOFF_ERA16_CERT_SCRIPT))).toBe(true);
  });

  it("documents era16 operational signoff in canonical docs", () => {
    for (const rel of OPERATIONAL_SIGNOFF_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(OPERATIONAL_SIGNOFF_ERA16_POLICY_ID);
      for (const marker of OPERATIONAL_SIGNOFF_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      if (rel === OPERATIONAL_SIGNOFF_ERA16_RUNBOOK_DOC) continue;
      for (const forbidden of OPERATIONAL_SIGNOFF_ERA16_FORBIDDEN_CLAIMS) {
        expect(text, `${rel} forbidden: ${forbidden}`).not.toContain(forbidden.toLowerCase());
      }
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(OPERATIONAL_SIGNOFF_ERA16_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(OPERATIONAL_SIGNOFF_ERA16_POLICY_ID);
    for (const rel of OPERATIONAL_SIGNOFF_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
