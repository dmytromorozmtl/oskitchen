/**
 * Stripe live smoke summary — wiring audit + payments proof (Era 86).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  STRIPE_LIVE_SMOKE_ERA86_POLICY_ID,
  STRIPE_LIVE_SMOKE_ERA86_WIRING_PATHS,
} from "@/lib/integrations/stripe-live-smoke-era86-policy";

export const STRIPE_LIVE_SMOKE_SUMMARY_VERSION = STRIPE_LIVE_SMOKE_ERA86_POLICY_ID;

export type StripeLiveSmokeEra86Overall = "PASSED" | "FAILED" | "SKIPPED";

export type StripeLiveSmokeEra86ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_secret_key"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type StripeLiveSmokeEra86Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type StripeLiveSmokeEra86Summary = {
  version: typeof STRIPE_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: StripeLiveSmokeEra86Overall;
  proofStatus: StripeLiveSmokeEra86ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: StripeLiveSmokeEra86Overall | null;
  missingEnvVars: string[];
  steps: StripeLiveSmokeEra86Step[];
  honestyNote: string;
};

export function isPlaceholderStripeSecretKey(secretKey: string): boolean {
  const normalized = secretKey.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "sk_test" ||
    normalized.endsWith(".local")
  );
}

export function auditStripeLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of STRIPE_LIVE_SMOKE_ERA86_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/stripe/payment-intent.service.ts") {
      if (!src.includes("createStripeLivePaymentIntent")) {
        failures.push("payment-intent.service.ts missing createStripeLivePaymentIntent");
      }
    }
    if (rel === "services/integrations/stripe/webhook-handler.service.ts") {
      if (!src.includes("verifyStripeIntegrationWebhook")) {
        failures.push("webhook-handler.service.ts missing verifyStripeIntegrationWebhook");
      }
      if (!src.includes("handleStripeIntegrationWebhookEvent")) {
        failures.push("webhook-handler.service.ts missing handleStripeIntegrationWebhookEvent");
      }
    }
    if (rel === "services/integrations/stripe/payout-reconciliation.service.ts") {
      if (!src.includes("reconcileStripePayouts")) {
        failures.push("payout-reconciliation.service.ts missing reconcileStripePayouts");
      }
    }
    if (rel === "scripts/smoke-stripe-live.ts") {
      if (!src.includes("payment_intent_wiring")) {
        failures.push("smoke-stripe-live.ts missing payment_intent_wiring step");
      }
      if (!src.includes("webhook_wiring")) {
        failures.push("smoke-stripe-live.ts missing webhook_wiring step");
      }
      if (!src.includes("payout_reconciliation_wiring")) {
        failures.push("smoke-stripe-live.ts missing payout_reconciliation_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveStripeLiveSmokeEra86ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: StripeLiveSmokeEra86Overall | null;
  liveProofStatus?: string;
}): StripeLiveSmokeEra86ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_secret_key") {
    return "proof_skipped_placeholder_secret_key";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_secret_key";
}

export function resolveStripeLiveSmokeEra86Overall(
  proofStatus: StripeLiveSmokeEra86ProofStatus,
): StripeLiveSmokeEra86Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_secret_key"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildStripeLiveSmokeEra86Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: StripeLiveSmokeEra86Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: StripeLiveSmokeEra86Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): StripeLiveSmokeEra86Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveStripeLiveSmokeEra86ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveStripeLiveSmokeEra86Overall(proofStatus);

  const steps: StripeLiveSmokeEra86Step[] = [
    {
      id: "wiring_audit",
      label: "Stripe → PaymentIntent → webhook → payout reconciliation wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 86 Stripe live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_api_payment_webhook_payout",
      label: "Live API → PaymentIntent → webhook → payout reconciliation",
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
    version: STRIPE_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Stripe secret key + PaymentIntent create + webhook secret + payout list wiring.",
  };
}

export function formatStripeLiveSmokeEra86ReportLines(
  summary: StripeLiveSmokeEra86Summary,
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
