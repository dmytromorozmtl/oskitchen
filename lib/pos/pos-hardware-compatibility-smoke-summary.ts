/**
 * POS Hardware Compatibility smoke summary — doc + catalog audit (Era 97).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_HARDWARE_COMPATIBILITY_ERA97_DOC,
  POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID,
  POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS,
  POS_HARDWARE_COMPATIBILITY_ERA97_WIRING_PATHS,
} from "@/lib/pos/pos-hardware-compatibility-era97-policy";

export const POS_HARDWARE_COMPATIBILITY_SMOKE_SUMMARY_VERSION =
  POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID;

export type PosHardwareCompatibilitySmokeEra97Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosHardwareCompatibilitySmokeEra97ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosHardwareCompatibilitySmokeEra97Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosHardwareCompatibilitySmokeEra97Summary = {
  version: typeof POS_HARDWARE_COMPATIBILITY_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosHardwareCompatibilitySmokeEra97Overall;
  proofStatus: PosHardwareCompatibilitySmokeEra97ProofStatus;
  wiringCertPassed: boolean;
  requiredVendors: readonly string[];
  steps: PosHardwareCompatibilitySmokeEra97Step[];
  honestyNote: string;
};

export function auditPosHardwareCompatibilitySmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of POS_HARDWARE_COMPATIBILITY_ERA97_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === POS_HARDWARE_COMPATIBILITY_ERA97_DOC) {
      for (const vendor of POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS) {
        if (!src.includes(vendor)) {
          failures.push(`hardware-compatibility.md missing vendor ${vendor}`);
        }
      }
      if (!src.includes("Barcode scanners")) {
        failures.push("hardware-compatibility.md missing barcode scanner section");
      }
      if (!src.includes("Certification tiers")) {
        failures.push("hardware-compatibility.md missing certification tiers");
      }
    }

    if (rel === "lib/pos/pos-hardware-certification.ts") {
      if (!src.includes("POS_CERTIFIED_HARDWARE_DEVICES")) {
        failures.push("pos-hardware-certification.ts missing device catalog");
      }
      if (!src.includes("POS_CERTIFIED_HARDWARE_VENDORS")) {
        failures.push("pos-hardware-certification.ts missing vendor list");
      }
      for (const vendor of POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS) {
        if (!src.includes(`"${vendor}"`)) {
          failures.push(`pos-hardware-certification.ts missing vendor ${vendor}`);
        }
      }
    }

    if (rel === "lib/pos/pos-hardware.ts") {
      if (!src.includes("POS_HARDWARE_CATEGORIES")) {
        failures.push("pos-hardware.ts missing POS_HARDWARE_CATEGORIES");
      }
    }

    if (rel === "app/dashboard/pos/settings/hardware/page.tsx") {
      if (!src.includes("POS_HARDWARE_CATEGORIES")) {
        failures.push("hardware settings page missing category matrix");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePosHardwareCompatibilitySmokeEra97ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosHardwareCompatibilitySmokeEra97ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosHardwareCompatibilitySmokeEra97Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PosHardwareCompatibilitySmokeEra97Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePosHardwareCompatibilitySmokeEra97ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosHardwareCompatibilitySmokeEra97Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosHardwareCompatibilitySmokeEra97Step[] = [
    {
      id: "wiring_audit",
      label:
        "hardware-compatibility.md ↔ pos-hardware-certification.ts ↔ in-app hardware matrix",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 97 POS Hardware Compatibility doc cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: POS_HARDWARE_COMPATIBILITY_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    requiredVendors: POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS,
    steps,
    honestyNote:
      "PASS certifies doc ↔ code catalog alignment — physical device proof requires field deployment.",
  };
}

export function formatPosHardwareCompatibilitySmokeEra97ReportLines(
  summary: PosHardwareCompatibilitySmokeEra97Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Required vendors: ${summary.requiredVendors.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
