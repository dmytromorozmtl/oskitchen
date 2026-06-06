/**
 * Stripe LIVE integration summary — wiring audit (Era 163).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  STRIPE_LIVE_SMOKE_ERA163_CANONICAL_SUMMARY_ARTIFACT,
  STRIPE_LIVE_SMOKE_ERA163_CAPABILITIES,
  STRIPE_LIVE_SMOKE_ERA163_POLICY_ID,
} from "@/lib/integrations/stripe-live-smoke-era163-policy";
import { auditStripeLiveSmokeWiring } from "@/lib/integrations/stripe-live-smoke-summary";

export const STRIPE_LIVE_SMOKE_ERA163_SMOKE_SUMMARY_VERSION = STRIPE_LIVE_SMOKE_ERA163_POLICY_ID;

export type StripeLiveSmokeEra163Overall = "PASSED" | "FAILED" | "SKIPPED";

export type StripeLiveSmokeEra163ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type StripeLiveSmokeEra163Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type StripeLiveSmokeEra163Summary = {
  version: typeof STRIPE_LIVE_SMOKE_ERA163_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: StripeLiveSmokeEra163Overall;
  proofStatus: StripeLiveSmokeEra163ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: StripeLiveSmokeEra163Step[];
  honestyNote: string;
};

export function auditStripeLiveSmokeEra163Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditStripeLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, STRIPE_LIVE_SMOKE_ERA163_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveStripeLiveSmokeEra163ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): StripeLiveSmokeEra163ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildStripeLiveSmokeEra163Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): StripeLiveSmokeEra163Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveStripeLiveSmokeEra163ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: StripeLiveSmokeEra163Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: StripeLiveSmokeEra163Step[] = [
    {
      id: "wiring_audit",
      label: "Stripe PaymentIntent → webhook → payout reconciliation wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 163 Stripe LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era86)",
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
          ? "Live secret key path PASSED"
          : liveSmokeOverall
            ? `era86 artifact overall: ${liveSmokeOverall} — run npm run smoke:stripe-live with real key`
            : "No era86 artifact — run npm run smoke:stripe-live-era86",
    },
  ];

  return {
    version: STRIPE_LIVE_SMOKE_ERA163_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: STRIPE_LIVE_SMOKE_ERA163_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Stripe PaymentIntent → webhook → payout reconciliation wiring — live proof requires secret key + STRIPE_WEBHOOK_SECRET.",
  };
}

export function formatStripeLiveSmokeEra163ReportLines(
  summary: StripeLiveSmokeEra163Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era86): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
