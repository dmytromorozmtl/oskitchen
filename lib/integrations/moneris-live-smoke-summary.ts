/**
 * Moneris live smoke summary — wiring audit + payment gateway proof (Era 88).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MONERIS_LIVE_SMOKE_ERA88_POLICY_ID,
  MONERIS_LIVE_SMOKE_ERA88_WIRING_PATHS,
} from "@/lib/integrations/moneris-live-smoke-era88-policy";

export const MONERIS_LIVE_SMOKE_SUMMARY_VERSION = MONERIS_LIVE_SMOKE_ERA88_POLICY_ID;

export type MonerisLiveSmokeEra88Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MonerisLiveSmokeEra88ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_credentials"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MonerisLiveSmokeEra88Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MonerisLiveSmokeEra88Summary = {
  version: typeof MONERIS_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MonerisLiveSmokeEra88Overall;
  proofStatus: MonerisLiveSmokeEra88ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: MonerisLiveSmokeEra88Overall | null;
  missingEnvVars: string[];
  steps: MonerisLiveSmokeEra88Step[];
  honestyNote: string;
};

export function isPlaceholderMonerisCredential(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.endsWith(".local")
  );
}

export function auditMonerisLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of MONERIS_LIVE_SMOKE_ERA88_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/moneris/payment-gateway.service.ts") {
      if (!src.includes("processMonerisPayment")) {
        failures.push("payment-gateway.service.ts missing processMonerisPayment");
      }
    }
    if (rel === "services/integrations/moneris/moneris-api.ts") {
      if (!src.includes("verifyMonerisGatewayConnection")) {
        failures.push("moneris-api.ts missing verifyMonerisGatewayConnection");
      }
      if (!src.includes("createMonerisPurchase")) {
        failures.push("moneris-api.ts missing createMonerisPurchase");
      }
    }
    if (rel === "scripts/smoke-moneris-live.ts") {
      if (!src.includes("gateway_connection_wiring")) {
        failures.push("smoke-moneris-live.ts missing gateway_connection_wiring step");
      }
      if (!src.includes("payment_gateway_wiring")) {
        failures.push("smoke-moneris-live.ts missing payment_gateway_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveMonerisLiveSmokeEra88ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: MonerisLiveSmokeEra88Overall | null;
  liveProofStatus?: string;
}): MonerisLiveSmokeEra88ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_credentials") {
    return "proof_skipped_placeholder_credentials";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_credentials";
}

export function resolveMonerisLiveSmokeEra88Overall(
  proofStatus: MonerisLiveSmokeEra88ProofStatus,
): MonerisLiveSmokeEra88Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_credentials"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildMonerisLiveSmokeEra88Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: MonerisLiveSmokeEra88Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: MonerisLiveSmokeEra88Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): MonerisLiveSmokeEra88Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveMonerisLiveSmokeEra88ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveMonerisLiveSmokeEra88Overall(proofStatus);

  const steps: MonerisLiveSmokeEra88Step[] = [
    {
      id: "wiring_audit",
      label: "Moneris → gateway verify → payment processing wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 88 Moneris live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_gateway_payment",
      label: "Live gateway verify → payment gateway wiring",
      status:
        input.liveSmoke.overall === "PASSED"
          ? "PASSED"
          : input.liveSmoke.overall === "SKIPPED"
            ? "SKIPPED"
            : "FAILED",
      reason:
        input.liveSmoke.steps.find((s) => s.status === "FAILED")?.reason ??
        input.liveSmoke.steps.find((s) => s.status === "SKIPPED")?.reason,
    });
  }

  return {
    version: MONERIS_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Moneris OAuth/API credentials + gateway verify — purchase charge skipped without sandbox card token.",
  };
}

export function formatMonerisLiveSmokeEra88ReportLines(
  summary: MonerisLiveSmokeEra88Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke: ${summary.liveSmokeOverall ?? "not run"}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
