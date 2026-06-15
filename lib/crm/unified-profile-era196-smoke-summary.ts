/**
 * Unified Customer Profile summary — Round 2 wiring audit (Era 196).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  UNIFIED_PROFILE_ERA196_CANONICAL_SUMMARY_ARTIFACT,
  UNIFIED_PROFILE_ERA196_POLICY_ID,
  UNIFIED_PROFILE_ERA196_PROFILE_SECTIONS,
  UNIFIED_PROFILE_ERA196_ROUTE,
} from "@/lib/crm/unified-profile-era196-policy";
import { auditUnifiedProfileSmokeWiring } from "@/lib/crm/unified-profile-smoke-summary";

export const UNIFIED_PROFILE_ERA196_SMOKE_SUMMARY_VERSION = UNIFIED_PROFILE_ERA196_POLICY_ID;

export type UnifiedProfileSmokeEra196Overall = "PASSED" | "FAILED" | "SKIPPED";

export type UnifiedProfileSmokeEra196ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type UnifiedProfileSmokeEra196Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type UnifiedProfileSmokeEra196Summary = {
  version: typeof UNIFIED_PROFILE_ERA196_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: UnifiedProfileSmokeEra196Overall;
  proofStatus: UnifiedProfileSmokeEra196ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  sections: readonly string[];
  steps: UnifiedProfileSmokeEra196Step[];
  honestyNote: string;
};

export function auditUnifiedProfileSmokeEra196Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditUnifiedProfileSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, UNIFIED_PROFILE_ERA196_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveUnifiedProfileSmokeEra196ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): UnifiedProfileSmokeEra196ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildUnifiedProfileSmokeEra196Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): UnifiedProfileSmokeEra196Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveUnifiedProfileSmokeEra196ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: UnifiedProfileSmokeEra196Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: UnifiedProfileSmokeEra196Step[] = [
    {
      id: "wiring_audit",
      label: "Orders → preferences → history → loyalty unified customer view",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 196 Unified Customer Profile cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era121)",
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
          ? "Canonical era121 smoke PASSED"
          : liveSmokeOverall
            ? `era121 artifact overall: ${liveSmokeOverall}`
            : "No era121 artifact — run npm run smoke:unified-profile-era121",
    },
  ];

  return {
    version: UNIFIED_PROFILE_ERA196_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: UNIFIED_PROFILE_ERA196_ROUTE,
    sections: UNIFIED_PROFILE_ERA196_PROFILE_SECTIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires tenant customers with orders, loyalty accounts, and timeline events.",
  };
}

export function formatUnifiedProfileSmokeEra196ReportLines(
  summary: UnifiedProfileSmokeEra196Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era121): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Sections: ${summary.sections.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
