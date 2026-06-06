import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DESIGN_SYSTEM_DOC_ERA135_CANONICAL_POLICY_ID,
  DESIGN_SYSTEM_DOC_ERA135_DOC_PATH,
  DESIGN_SYSTEM_DOC_ERA135_POLICY_ID,
  DESIGN_SYSTEM_DOC_ERA135_POLICY_MODULES,
  DESIGN_SYSTEM_DOC_ERA135_SECTIONS,
  DESIGN_SYSTEM_DOC_ERA135_SERVICE,
  DESIGN_SYSTEM_DOC_ERA135_SUMMARY_ARTIFACT,
  DESIGN_SYSTEM_DOC_ERA135_WIRING_PATHS,
} from "@/lib/design/design-system-doc-era135-policy";
import {
  auditDesignSystemDocSmokeWiring,
  buildDesignSystemDocSmokeEra135Summary,
  resolveDesignSystemDocSmokeEra135ProofStatus,
} from "@/lib/design/design-system-doc-smoke-summary";
import { DESIGN_SYSTEM_DOC_POLICY_ID } from "@/lib/design/design-system-doc-policy";
import { loadDesignSystemDocSnapshot } from "@/services/design/design-system-doc-service";

const ROOT = process.cwd();

describe("design system doc era135", () => {
  it("locks era135 policy and artifact path", () => {
    expect(DESIGN_SYSTEM_DOC_ERA135_POLICY_ID).toBe("era135-design-system-doc-v1");
    expect(DESIGN_SYSTEM_DOC_ERA135_SUMMARY_ARTIFACT).toBe(
      "artifacts/design-system-doc-smoke-summary.json",
    );
    expect(DESIGN_SYSTEM_DOC_ERA135_DOC_PATH).toBe("docs/design-system.md");
    expect(DESIGN_SYSTEM_DOC_ERA135_SECTIONS.length).toBeGreaterThanOrEqual(10);
    expect(DESIGN_SYSTEM_DOC_ERA135_POLICY_MODULES.length).toBeGreaterThanOrEqual(8);
  });

  it("aligns era135 with canonical design system doc policy", () => {
    expect(DESIGN_SYSTEM_DOC_ERA135_CANONICAL_POLICY_ID).toBe(DESIGN_SYSTEM_DOC_POLICY_ID);
  });

  it("audits in-repo Design System doc wiring", () => {
    const audit = auditDesignSystemDocSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of DESIGN_SYSTEM_DOC_ERA135_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes canonical doc section and policy registry wiring", () => {
    const doc = readFileSync(join(ROOT, DESIGN_SYSTEM_DOC_ERA135_DOC_PATH), "utf8");
    expect(doc).toContain("OS Kitchen Design System");
    expect(doc).toContain("## Token registry");
    expect(doc).toContain("## Audit policy index");

    const service = readFileSync(join(ROOT, DESIGN_SYSTEM_DOC_ERA135_SERVICE), "utf8");
    expect(service).toContain("loadDesignSystemDocSnapshot");

    const snapshot = loadDesignSystemDocSnapshot(ROOT);
    expect(snapshot.healthScore).toBe(100);
    expect(snapshot.passed).toBe(true);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveDesignSystemDocSmokeEra135ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveDesignSystemDocSmokeEra135ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildDesignSystemDocSmokeEra135Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sectionCount).toBeGreaterThanOrEqual(10);
  });
});
