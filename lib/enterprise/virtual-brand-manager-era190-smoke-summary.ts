/**
 * Virtual Brand Manager summary — Round 2 wiring audit (Era 190).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VIRTUAL_BRAND_MANAGER_ERA190_CANONICAL_SUMMARY_ARTIFACT,
  VIRTUAL_BRAND_MANAGER_ERA190_POLICY_ID,
  VIRTUAL_BRAND_MANAGER_ERA190_PROVISION_TARGET_MINUTES,
  VIRTUAL_BRAND_MANAGER_ERA190_ROUTE,
  VIRTUAL_BRAND_MANAGER_ERA190_TEMPLATES,
} from "@/lib/enterprise/virtual-brand-manager-era190-policy";
import { auditVirtualBrandManagerSmokeWiring } from "@/lib/enterprise/virtual-brand-manager-smoke-summary";

export const VIRTUAL_BRAND_MANAGER_ERA190_SMOKE_SUMMARY_VERSION =
  VIRTUAL_BRAND_MANAGER_ERA190_POLICY_ID;

export type VirtualBrandManagerSmokeEra190Overall = "PASSED" | "FAILED" | "SKIPPED";

export type VirtualBrandManagerSmokeEra190ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type VirtualBrandManagerSmokeEra190Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type VirtualBrandManagerSmokeEra190Summary = {
  version: typeof VIRTUAL_BRAND_MANAGER_ERA190_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: VirtualBrandManagerSmokeEra190Overall;
  proofStatus: VirtualBrandManagerSmokeEra190ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  provisionTargetMinutes: number;
  templates: readonly string[];
  steps: VirtualBrandManagerSmokeEra190Step[];
  honestyNote: string;
};

export function auditVirtualBrandManagerSmokeEra190Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditVirtualBrandManagerSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, VIRTUAL_BRAND_MANAGER_ERA190_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveVirtualBrandManagerSmokeEra190ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): VirtualBrandManagerSmokeEra190ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildVirtualBrandManagerSmokeEra190Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): VirtualBrandManagerSmokeEra190Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveVirtualBrandManagerSmokeEra190ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: VirtualBrandManagerSmokeEra190Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: VirtualBrandManagerSmokeEra190Step[] = [
    {
      id: "wiring_audit",
      label: "Template → provision → starter menu → storefront → launch checklist",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 190 Virtual Brand Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era115)",
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
          ? "Canonical era115 smoke PASSED"
          : liveSmokeOverall
            ? `era115 artifact overall: ${liveSmokeOverall}`
            : "No era115 artifact — run npm run smoke:virtual-brand-manager-era115",
    },
  ];

  return {
    version: VIRTUAL_BRAND_MANAGER_ERA190_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: VIRTUAL_BRAND_MANAGER_ERA190_ROUTE,
    provisionTargetMinutes: VIRTUAL_BRAND_MANAGER_ERA190_PROVISION_TARGET_MINUTES,
    templates: VIRTUAL_BRAND_MANAGER_ERA190_TEMPLATES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with menu clone sources and storefront settings.",
  };
}

export function formatVirtualBrandManagerSmokeEra190ReportLines(
  summary: VirtualBrandManagerSmokeEra190Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era115): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Provision target: ${summary.provisionTargetMinutes} minutes`,
    `Templates: ${summary.templates.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
