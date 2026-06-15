/**
 * POS Customer Display summary — Round 2 wiring audit (Era 174).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_CUSTOMER_DISPLAY_ERA174_CANONICAL_SUMMARY_ARTIFACT,
  POS_CUSTOMER_DISPLAY_ERA174_CAPABILITIES,
  POS_CUSTOMER_DISPLAY_ERA174_CHANNEL,
  POS_CUSTOMER_DISPLAY_ERA174_POLICY_ID,
  POS_CUSTOMER_DISPLAY_ERA174_ROUTE,
} from "@/lib/pos/pos-customer-display-era174-policy";
import { auditPosCustomerDisplaySmokeWiring } from "@/lib/pos/pos-customer-display-smoke-summary";

export const POS_CUSTOMER_DISPLAY_ERA174_SMOKE_SUMMARY_VERSION =
  POS_CUSTOMER_DISPLAY_ERA174_POLICY_ID;

export type PosCustomerDisplaySmokeEra174Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosCustomerDisplaySmokeEra174ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosCustomerDisplaySmokeEra174Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosCustomerDisplaySmokeEra174Summary = {
  version: typeof POS_CUSTOMER_DISPLAY_ERA174_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosCustomerDisplaySmokeEra174Overall;
  proofStatus: PosCustomerDisplaySmokeEra174ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  channel: string;
  capabilities: readonly string[];
  steps: PosCustomerDisplaySmokeEra174Step[];
  honestyNote: string;
};

export function auditPosCustomerDisplaySmokeEra174Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPosCustomerDisplaySmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, POS_CUSTOMER_DISPLAY_ERA174_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePosCustomerDisplaySmokeEra174ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosCustomerDisplaySmokeEra174ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosCustomerDisplaySmokeEra174Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PosCustomerDisplaySmokeEra174Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePosCustomerDisplaySmokeEra174ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosCustomerDisplaySmokeEra174Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosCustomerDisplaySmokeEra174Step[] = [
    {
      id: "wiring_audit",
      label:
        "Terminal cart → BroadcastChannel → second-screen CustomerDisplay popup (F8 toggle)",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 174 POS Customer Display cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era99)",
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
          ? "Canonical era99 smoke PASSED"
          : liveSmokeOverall
            ? `era99 artifact overall: ${liveSmokeOverall}`
            : "No era99 artifact — run npm run smoke:pos-customer-display-era99",
    },
  ];

  return {
    version: POS_CUSTOMER_DISPLAY_ERA174_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: POS_CUSTOMER_DISPLAY_ERA174_ROUTE,
    channel: POS_CUSTOMER_DISPLAY_ERA174_CHANNEL,
    capabilities: POS_CUSTOMER_DISPLAY_ERA174_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live second-monitor proof requires dual-display workstation.",
  };
}

export function formatPosCustomerDisplaySmokeEra174ReportLines(
  summary: PosCustomerDisplaySmokeEra174Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era99): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Channel: ${summary.channel}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
