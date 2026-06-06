/**
 * Vendor Portal 2.0 summary — Round 2 wiring audit (Era 192).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VENDOR_PORTAL_ERA192_CANONICAL_SUMMARY_ARTIFACT,
  VENDOR_PORTAL_ERA192_MODULES,
  VENDOR_PORTAL_ERA192_POLICY_ID,
  VENDOR_PORTAL_ERA192_ROUTE,
} from "@/lib/marketplace/vendor-portal-era192-policy";
import { auditVendorPortalSmokeWiring } from "@/lib/marketplace/vendor-portal-smoke-summary";

export const VENDOR_PORTAL_ERA192_SMOKE_SUMMARY_VERSION = VENDOR_PORTAL_ERA192_POLICY_ID;

export type VendorPortalSmokeEra192Overall = "PASSED" | "FAILED" | "SKIPPED";

export type VendorPortalSmokeEra192ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type VendorPortalSmokeEra192Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type VendorPortalSmokeEra192Summary = {
  version: typeof VENDOR_PORTAL_ERA192_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: VendorPortalSmokeEra192Overall;
  proofStatus: VendorPortalSmokeEra192ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  modules: readonly string[];
  steps: VendorPortalSmokeEra192Step[];
  honestyNote: string;
};

export function auditVendorPortalSmokeEra192Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditVendorPortalSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, VENDOR_PORTAL_ERA192_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveVendorPortalSmokeEra192ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): VendorPortalSmokeEra192ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildVendorPortalSmokeEra192Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): VendorPortalSmokeEra192Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveVendorPortalSmokeEra192ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: VendorPortalSmokeEra192Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: VendorPortalSmokeEra192Step[] = [
    {
      id: "wiring_audit",
      label: "Orders + invoices + analytics → three modules → vendor hub",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 192 Vendor Portal 2.0 cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era117)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Canonical era117 smoke PASSED"
          : liveSmokeOverall
            ? `era117 artifact overall: ${liveSmokeOverall}`
            : "No era117 artifact — run npm run smoke:vendor-portal-era117",
    },
  ];

  return {
    version: VENDOR_PORTAL_ERA192_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: VENDOR_PORTAL_ERA192_ROUTE,
    modules: VENDOR_PORTAL_ERA192_MODULES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires approved vendor account with marketplace orders and transactions.",
  };
}

export function formatVendorPortalSmokeEra192ReportLines(
  summary: VendorPortalSmokeEra192Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era117): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Modules: ${summary.modules.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
