import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_EVIDENCE_ERA16_CANONICAL_DOC_PATHS,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_CANONICAL_MARKERS,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_CERT_SCRIPT,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_CI_SCRIPTS,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_FORBIDDEN_CLAIMS,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_MODULE,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_REVIEW_SECTION,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_DOC,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_SECTIONS,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_UNIT_TESTS,
} from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commercial pilot evidence pack era16 CI certification (live repo)", () => {
  it("locks era16 commercial pilot evidence policy id", () => {
    expect(COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID).toBe(
      "era16-commercial-pilot-evidence-pack-v1",
    );
  });

  it("defines era16 commercial pilot evidence scripts chained into runbook cert", () => {
    const scripts = readPackageScripts();
    for (const name of COMMERCIAL_PILOT_EVIDENCE_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["cert:commercial-pilot-evidence-era16"]).toContain(
      COMMERCIAL_PILOT_EVIDENCE_ERA16_CERT_SCRIPT,
    );
    expect(scripts["test:ci:commercial-pilot-runbook:cert"]).toContain(
      "test:ci:commercial-pilot-evidence-era16:cert",
    );
  });

  it("wires evidence module, cert script, and summary artifact", () => {
    expect(existsSync(join(ROOT, COMMERCIAL_PILOT_EVIDENCE_ERA16_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, COMMERCIAL_PILOT_EVIDENCE_ERA16_CERT_SCRIPT))).toBe(true);
    const certScript = readFileSync(
      join(ROOT, COMMERCIAL_PILOT_EVIDENCE_ERA16_CERT_SCRIPT),
      "utf8",
    );
    expect(certScript).toContain("COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT");
    expect(certScript).toContain(COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT);
  });

  it("runbook contains era16 evidence pack sections without forbidden claims", () => {
    const runbook = readFileSync(join(ROOT, COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_DOC), "utf8");
    for (const section of COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_SECTIONS) {
      expect(runbook, `missing ${section}`).toContain(`## ${section}`);
    }
    const lower = runbook.toLowerCase();
    for (const marker of COMMERCIAL_PILOT_EVIDENCE_ERA16_CANONICAL_MARKERS) {
      expect(lower, `missing ${marker}`).toContain(marker.toLowerCase());
    }
    expect(runbook).toContain(COMMERCIAL_PILOT_EVIDENCE_ERA16_REVIEW_SECTION);
  });

  it("documents era16 evidence pack in canonical docs without forbidden claims", () => {
    for (const rel of COMMERCIAL_PILOT_EVIDENCE_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID);
      if (rel === COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_DOC) continue;
      for (const forbidden of COMMERCIAL_PILOT_EVIDENCE_ERA16_FORBIDDEN_CLAIMS) {
        expect(text, `${rel} contains forbidden: ${forbidden}`).not.toContain(
          forbidden.toLowerCase(),
        );
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID);
    for (const rel of COMMERCIAL_PILOT_EVIDENCE_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
