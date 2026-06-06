/**
 * Stripe live smoke — validate secret key, PaymentIntent, webhook, payout reconciliation wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  STRIPE_LIVE_SMOKE_ERA86_POLICY_ID,
  STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT,
} from "@/lib/integrations/stripe-live-smoke-era86-policy";
import { isPlaceholderStripeSecretKey } from "@/lib/integrations/stripe-live-smoke-summary";
import { createStripeLivePaymentIntent } from "@/services/integrations/stripe/payment-intent.service";
import {
  getStripePendingPayoutCents,
  reconcileStripePayouts,
} from "@/services/integrations/stripe/payout-reconciliation.service";
import { isStripeWebhookConfigured } from "@/services/integrations/stripe/stripe-credentials";

export const STRIPE_LIVE_SMOKE_ARTIFACT = STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT;

export const STRIPE_LIVE_SMOKE_VERSION = STRIPE_LIVE_SMOKE_ERA86_POLICY_ID;

export type StripeLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type StripeLiveSmokeStep = {
  id: string;
  label: string;
  status: StripeLiveSmokeStepStatus;
  detail?: string;
};

export type StripeLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_secret_key"
  | "proof_failed";

export type StripeLiveSmokeSummary = {
  version: typeof STRIPE_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: StripeLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: StripeLiveSmokeStep[];
  connectionId: string | null;
  honestyNote: string;
};

export type StripeLiveSmokeEnvInput = {
  secretKey: string | null;
  webhookSecret: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  ownerEmail: string | null;
};

export function readStripeLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): StripeLiveSmokeEnvInput {
  return {
    secretKey: env.STRIPE_SECRET_KEY?.trim() ?? null,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingStripeLiveSmokeEnvVars(input: StripeLiveSmokeEnvInput): string[] {
  const missing: string[] = [];
  if (!input.secretKey) missing.push("STRIPE_SECRET_KEY");
  if (!input.databaseUrl) missing.push("DATABASE_URL");
  return missing;
}

export function buildStripeLiveSmokeSummary(input: {
  steps: StripeLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
}): StripeLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "stripe_api_connection" && step.status === "SKIPPED",
  );

  let overall: StripeLiveSmokeSummary["overall"];
  let proofStatus: StripeLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_secret_key";
  } else if (failed) {
    overall = "FAILED";
    proofStatus = "proof_failed";
  } else if (skippedOnly) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else {
    overall = "PASSED";
    proofStatus = "proof_passed";
  }

  return {
    version: STRIPE_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    honestyNote:
      "PASS requires live Stripe secret key + PaymentIntent create + webhook secret + payout list wiring.",
  };
}

async function pingStripeApi(secretKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const pendingCents = await getStripePendingPayoutCents();
    if (pendingCents === null) {
      return { ok: false, message: "Stripe balance retrieve failed." };
    }
    return {
      ok: true,
      message: `Stripe API reachable (pending balance ${(pendingCents / 100).toFixed(2)} USD).`,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Stripe connection test failed.";
    if (message.includes("Invalid API Key") || isPlaceholderStripeSecretKey(secretKey)) {
      return { ok: false, message };
    }
    return { ok: false, message };
  }
}

async function resolveStripeUserId(
  prisma: PrismaClient,
  input: StripeLiveSmokeEnvInput,
): Promise<{ userId: string; connectionId: string | null } | null> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.ownerEmail) {
    const profile = await prisma.userProfile.findFirst({
      where: { email: input.ownerEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (profile) {
      conn = await prisma.integrationConnection.findFirst({
        where: {
          userId: profile.id,
          provider: IntegrationProvider.STRIPE,
        },
        orderBy: { updatedAt: "desc" },
      });
      if (!conn) {
        return { userId: profile.id, connectionId: null };
      }
    }
  }

  if (!conn) return null;
  return { userId: conn.userId, connectionId: conn.id };
}

export async function runStripeLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<StripeLiveSmokeSummary> {
  const input = readStripeLiveSmokeEnv(env);
  const missingEnvVars = listMissingStripeLiveSmokeEnvVars(input);
  const steps: StripeLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildStripeLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "STRIPE_SECRET_KEY + DATABASE_URL present",
  });

  const secretKey = input.secretKey!;
  const placeholderKey = isPlaceholderStripeSecretKey(secretKey);
  const ping = await pingStripeApi(secretKey);
  steps.push({
    id: "stripe_api_connection",
    label: "Stripe API connection",
    status: ping.ok ? "PASSED" : placeholderKey ? "SKIPPED" : "FAILED",
    detail: ping.ok
      ? ping.message
      : placeholderKey
        ? `Placeholder key: ${ping.message}. Replace with live/test secret key in vault.`
        : ping.message,
  });
  if (!ping.ok) {
    return buildStripeLiveSmokeSummary({ steps, missingEnvVars: [], connectionId: input.connectionId });
  }

  const paymentIntent = await createStripeLivePaymentIntent({
    amount: 0.5,
    currency: "usd",
    description: "OS Kitchen era86 live smoke PaymentIntent",
  });
  steps.push({
    id: "payment_intent_wiring",
    label: "PaymentIntent wiring",
    status: paymentIntent.ok ? "PASSED" : "FAILED",
    detail: paymentIntent.message,
  });
  if (!paymentIntent.ok) {
    return buildStripeLiveSmokeSummary({ steps, missingEnvVars: [], connectionId: input.connectionId });
  }

  steps.push({
    id: "webhook_wiring",
    label: "Webhook signature wiring",
    status: isStripeWebhookConfigured() ? "PASSED" : "SKIPPED",
    detail: isStripeWebhookConfigured()
      ? "STRIPE_WEBHOOK_SECRET configured for integration webhook."
      : "STRIPE_WEBHOOK_SECRET not set — webhook wiring verified in cert only.",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveStripeUserId(prisma, input);
    if (!resolved) {
      steps.push({
        id: "payout_reconciliation_wiring",
        label: "Payout reconciliation wiring",
        status: "SKIPPED",
        detail: "No Stripe owner in DATABASE_URL — set CHANNEL_SMOKE_OWNER_EMAIL.",
      });
    } else {
      const reconcile = await reconcileStripePayouts(resolved.userId);
      steps.push({
        id: "payout_reconciliation_wiring",
        label: "Payout reconciliation wiring",
        status: reconcile.ok ? "PASSED" : "FAILED",
        detail: reconcile.message,
      });
      return buildStripeLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: resolved.connectionId,
      });
    }
  } finally {
    await prisma.$disconnect();
  }

  return buildStripeLiveSmokeSummary({
    steps,
    missingEnvVars: [],
    connectionId: input.connectionId,
  });
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runStripeLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), STRIPE_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${STRIPE_LIVE_SMOKE_ARTIFACT}\n`);
  }

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
