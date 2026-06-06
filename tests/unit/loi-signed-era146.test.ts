import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LOI_SIGNED_ERA146_CANONICAL_DOC,
  LOI_SIGNED_ERA146_CANONICAL_POLICY_ID,
  LOI_SIGNED_ERA146_CAPABILITIES,
  LOI_SIGNED_ERA146_LOI_SKU,
  LOI_SIGNED_ERA146_POLICY_ID,
  LOI_SIGNED_ERA146_SUMMARY_ARTIFACT,
  LOI_SIGNED_ERA146_WIRING_PATHS,
} from "@/lib/commercial/loi-signed-era146-policy";
import { LOI_SIGNED_ERA73_POLICY_ID } from "@/lib/commercial/loi-signed-era73-policy";
import {
  auditLoiSignedDocContent,
  auditLoiSignedEra146Wiring,
  buildLoiSignedEra146Summary,
  resolveLoiSignedEra146ProofStatus,
} from "@/lib/commercial/loi-signed-era146-smoke-summary";

const ROOT = process.cwd();

describe("loi signed era146", () => {
  it("locks era146 policy and artifact path", () => {
    expect(LOI_SIGNED_ERA146_POLICY_ID).toBe("era146-first-loi-signed-v1");
    expect(LOI_SIGNED_ERA146_SUMMARY_ARTIFACT).toBe(
      "artifacts/loi-signed-era146-smoke-summary.json",
    );
    expect(LOI_SIGNED_ERA146_CANONICAL_DOC).toBe("docs/loi-signed.md");
    expect(LOI_SIGNED_ERA146_LOI_SKU).toBe("LOI-DP-001");
    expect(LOI_SIGNED_ERA146_WIRING_PATHS).toHaveLength(7);
    expect(LOI_SIGNED_ERA146_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era146 with canonical LOI signed policy", () => {
    expect(LOI_SIGNED_ERA146_CANONICAL_POLICY_ID).toBe(LOI_SIGNED_ERA73_POLICY_ID);
  });

  it("audits in-repo first design partner LOI signed wiring", () => {
    const audit = auditLoiSignedEra146Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of LOI_SIGNED_ERA146_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("passes signed LOI doc audit with Riverbend countersignature", () => {
    const audit = auditLoiSignedDocContent(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    const source = readFileSync(join(ROOT, LOI_SIGNED_ERA146_CANONICAL_DOC), "utf8");
    expect(source).toContain("Riverbend Commissary LLC");
    expect(source).toContain("2026-06-05");
    expect(source).toContain("LOI-DP-001");
    expect(source).toContain("riverbend-commissary");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveLoiSignedEra146ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveLoiSignedEra146ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildLoiSignedEra146Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.loiDocAuditPassed).toBe(true);
    expect(summary.capabilities).toContain("signed_loi_record");
  });
});
