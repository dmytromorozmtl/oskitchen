import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_HARDWARE_COMPATIBILITY_ERA172_CANONICAL_POLICY_ID,
  POS_HARDWARE_COMPATIBILITY_ERA172_CAPABILITIES,
  POS_HARDWARE_COMPATIBILITY_ERA172_DOC,
  POS_HARDWARE_COMPATIBILITY_ERA172_HARDWARE_ROUTE,
  POS_HARDWARE_COMPATIBILITY_ERA172_POLICY_ID,
  POS_HARDWARE_COMPATIBILITY_ERA172_REQUIRED_VENDORS,
  POS_HARDWARE_COMPATIBILITY_ERA172_SUMMARY_ARTIFACT,
  POS_HARDWARE_COMPATIBILITY_ERA172_WIRING_PATHS,
} from "@/lib/pos/pos-hardware-compatibility-era172-policy";
import {
  auditPosHardwareCompatibilitySmokeEra172Wiring,
  buildPosHardwareCompatibilitySmokeEra172Summary,
  resolvePosHardwareCompatibilitySmokeEra172ProofStatus,
} from "@/lib/pos/pos-hardware-compatibility-era172-smoke-summary";
import { POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID } from "@/lib/pos/pos-hardware-compatibility-era97-policy";
import {
  POS_CERTIFIED_HARDWARE_VENDORS,
  POS_HARDWARE_COMPATIBILITY_DOC,
} from "@/lib/pos/pos-hardware-certification";

const ROOT = process.cwd();

describe("pos hardware compatibility era172", () => {
  it("locks era172 policy and artifact path", () => {
    expect(POS_HARDWARE_COMPATIBILITY_ERA172_POLICY_ID).toBe(
      "era172-pos-hardware-compatibility-v1",
    );
    expect(POS_HARDWARE_COMPATIBILITY_ERA172_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-hardware-compatibility-era172-smoke-summary.json",
    );
    expect(POS_HARDWARE_COMPATIBILITY_ERA172_DOC).toBe(POS_HARDWARE_COMPATIBILITY_DOC);
    expect(POS_HARDWARE_COMPATIBILITY_ERA172_HARDWARE_ROUTE).toBe(
      "/dashboard/pos/settings/hardware",
    );
    expect(POS_HARDWARE_COMPATIBILITY_ERA172_WIRING_PATHS).toHaveLength(5);
    expect(POS_HARDWARE_COMPATIBILITY_ERA172_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era172 with canonical POS Hardware Compatibility policy", () => {
    expect(POS_HARDWARE_COMPATIBILITY_ERA172_CANONICAL_POLICY_ID).toBe(
      POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID,
    );
    for (const vendor of POS_HARDWARE_COMPATIBILITY_ERA172_REQUIRED_VENDORS) {
      expect(POS_CERTIFIED_HARDWARE_VENDORS).toContain(vendor);
    }
  });

  it("audits doc ↔ catalog ↔ in-app matrix Round 2 wiring", () => {
    const audit = auditPosHardwareCompatibilitySmokeEra172Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_HARDWARE_COMPATIBILITY_ERA172_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("documents Epson, PAX, Star Micronics, and barcode scanners", () => {
    const doc = readFileSync(join(ROOT, POS_HARDWARE_COMPATIBILITY_ERA172_DOC), "utf8");
    for (const vendor of POS_HARDWARE_COMPATIBILITY_ERA172_REQUIRED_VENDORS) {
      expect(doc).toContain(vendor);
    }
    expect(doc).toContain("Barcode scanners");
    expect(doc).toContain("Certification tiers");

    const catalog = readFileSync(join(ROOT, "lib/pos/pos-hardware-certification.ts"), "utf8");
    expect(catalog).toContain("POS_CERTIFIED_HARDWARE_DEVICES");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosHardwareCompatibilitySmokeEra172ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosHardwareCompatibilitySmokeEra172ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosHardwareCompatibilitySmokeEra172Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.requiredVendors).toEqual(["Epson", "PAX", "Star Micronics"]);
    expect(summary.capabilities).toContain("barcode_scanners");
    expect(summary.capabilities).toContain("epson_receipt_printers");
  });
});
