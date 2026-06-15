import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_HARDWARE_COMPATIBILITY_ERA97_DOC,
  POS_HARDWARE_COMPATIBILITY_ERA97_HARDWARE_ROUTE,
  POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID,
  POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS,
  POS_HARDWARE_COMPATIBILITY_ERA97_SUMMARY_ARTIFACT,
  POS_HARDWARE_COMPATIBILITY_ERA97_WIRING_PATHS,
} from "@/lib/pos/pos-hardware-compatibility-era97-policy";
import {
  auditPosHardwareCompatibilitySmokeWiring,
  buildPosHardwareCompatibilitySmokeEra97Summary,
  resolvePosHardwareCompatibilitySmokeEra97ProofStatus,
} from "@/lib/pos/pos-hardware-compatibility-smoke-summary";
import {
  POS_CERTIFIED_HARDWARE_VENDORS,
  POS_HARDWARE_COMPATIBILITY_DOC,
} from "@/lib/pos/pos-hardware-certification";

const ROOT = process.cwd();

describe("pos hardware compatibility era97", () => {
  it("locks era97 policy and artifact path", () => {
    expect(POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID).toBe(
      "era97-pos-hardware-compatibility-v1",
    );
    expect(POS_HARDWARE_COMPATIBILITY_ERA97_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-hardware-compatibility-smoke-summary.json",
    );
    expect(POS_HARDWARE_COMPATIBILITY_ERA97_DOC).toBe(POS_HARDWARE_COMPATIBILITY_DOC);
    expect(POS_HARDWARE_COMPATIBILITY_ERA97_HARDWARE_ROUTE).toBe(
      "/dashboard/pos/settings/hardware",
    );
  });

  it("aligns era97 required vendors with certification catalog", () => {
    for (const vendor of POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS) {
      expect(POS_CERTIFIED_HARDWARE_VENDORS).toContain(vendor);
    }
  });

  it("audits doc ↔ catalog ↔ in-app matrix wiring", () => {
    const audit = auditPosHardwareCompatibilitySmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_HARDWARE_COMPATIBILITY_ERA97_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("documents Epson, PAX, Star Micronics, and barcode scanners", () => {
    const doc = readFileSync(join(ROOT, POS_HARDWARE_COMPATIBILITY_ERA97_DOC), "utf8");
    for (const vendor of POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS) {
      expect(doc).toContain(vendor);
    }
    expect(doc).toContain("Barcode scanners");
    expect(doc).toContain("Certification tiers");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosHardwareCompatibilitySmokeEra97ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosHardwareCompatibilitySmokeEra97ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosHardwareCompatibilitySmokeEra97Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.requiredVendors).toEqual(["Epson", "PAX", "Star Micronics"]);
  });
});
