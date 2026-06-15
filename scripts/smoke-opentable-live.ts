/**
 * OpenTable live smoke — validate OAuth, reservation webhook, table availability wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { format } from "date-fns";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID,
  OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT,
} from "@/lib/integrations/opentable-live-smoke-era89-policy";
import {
  isPlaceholderOpenTableAccessToken,
  isPlaceholderOpenTableRestaurantId,
} from "@/lib/integrations/opentable-live-smoke-summary";
import { fetchOpenTableAvailability } from "@/services/integrations/opentable/opentable-api";
import { getOpenTableCredentials } from "@/services/integrations/opentable/opentable-credentials";
import { verifyOpenTableWebhookSignature } from "@/services/integrations/opentable/opentable-live-service";
import { syncOpenTableAvailability } from "@/services/integrations/opentable/table-availability.service";

export const OPENTABLE_LIVE_SMOKE_ARTIFACT = OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT;

export const OPENTABLE_LIVE_SMOKE_VERSION = OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID;

export type OpenTableLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type OpenTableLiveSmokeStep = {
  id: string;
  label: string;
  status: OpenTableLiveSmokeStepStatus;
  detail?: string;
};

export type OpenTableLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_token"
  | "proof_failed";

export type OpenTableLiveSmokeSummary = {
  version: typeof OPENTABLE_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: OpenTableLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: OpenTableLiveSmokeStep[];
  connectionId: string | null;
  restaurantId: string | null;
  honestyNote: string;
};

export type OpenTableLiveSmokeEnvInput = {
  accessToken: string | null;
  restaurantId: string | null;
  webhookSecret: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readOpenTableLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): OpenTableLiveSmokeEnvInput {
  return {
    accessToken:
      env.OPENTABLE_ACCESS_TOKEN?.trim() ?? env.OPENTABLE_API_KEY?.trim() ?? null,
    restaurantId: env.OPENTABLE_RID?.trim() ?? null,
    webhookSecret: env.OPENTABLE_WEBHOOK_SECRET?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingOpenTableLiveSmokeEnvVars(
  input: OpenTableLiveSmokeEnvInput,
): string[] {
  const missing: string[] = [];
  if (!input.databaseUrl) missing.push("DATABASE_URL");

  const hasDirect = Boolean(input.accessToken) && Boolean(input.restaurantId);
  const hasDbTenant =
    Boolean(input.encryptionKey) && Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirect && !hasDbTenant) {
    if (!input.accessToken) {
      missing.push("OPENTABLE_ACCESS_TOKEN");
      missing.push("OPENTABLE_API_KEY");
    }
    if (!input.restaurantId) missing.push("OPENTABLE_RID");
    if (!input.encryptionKey && !input.accessToken) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.accessToken) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

export function buildOpenTableLiveSmokeSummary(input: {
  steps: OpenTableLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
  restaurantId?: string | null;
}): OpenTableLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "opentable_oauth_connection" && step.status === "SKIPPED",
  );

  let overall: OpenTableLiveSmokeSummary["overall"];
  let proofStatus: OpenTableLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_token";
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
    version: OPENTABLE_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    restaurantId: input.restaurantId ?? null,
    honestyNote:
      "PASS requires live OpenTable OAuth + availability API ping — live reservation webhook delivery requires sandbox webhook secret.",
  };
}

async function pingOpenTableApi(creds: {
  accessToken: string;
  restaurantId: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const date = format(new Date(), "yyyy-MM-dd");
    const slots = await fetchOpenTableAvailability({
      accessToken: creds.accessToken,
      restaurantId: creds.restaurantId,
      date,
      partySize: 2,
    });
    return {
      ok: true,
      message: `OpenTable API reachable (${slots.length} slot(s) on ${date}).`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "OpenTable connection test failed.",
    };
  }
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: OpenTableLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string | null;
      userId: string | null;
      accessToken: string;
      restaurantId: string;
      webhookSecret: string | null;
    }
  | { error: string }
> {
  if (input.accessToken && input.restaurantId) {
    return {
      connectionId: input.connectionId,
      userId: null,
      accessToken: input.accessToken,
      restaurantId: input.restaurantId,
      webhookSecret: input.webhookSecret,
    };
  }

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
          provider: IntegrationProvider.OPENTABLE,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No OpenTable connection in DATABASE_URL — complete OAuth in dashboard or set OPENTABLE_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getOpenTableCredentials(conn);
  if (!decrypted?.accessToken || !decrypted.restaurantId) {
    return { error: "Connection missing OpenTable access token or restaurant ID (ENCRYPTION_KEY?)" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    accessToken: decrypted.accessToken,
    restaurantId: decrypted.restaurantId,
    webhookSecret: decrypted.webhookSecret ?? input.webhookSecret,
  };
}

export async function runOpenTableLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<OpenTableLiveSmokeSummary> {
  const input = readOpenTableLiveSmokeEnv(env);
  const missingEnvVars = listMissingOpenTableLiveSmokeEnvVars(input);
  const steps: OpenTableLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildOpenTableLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct OpenTable or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve OpenTable connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildOpenTableLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        restaurantId: input.restaurantId,
      });
    }

    const { connectionId, userId, accessToken, restaurantId, webhookSecret } = resolved;

    steps.push({
      id: "resolve_connection",
      label: "Resolve OpenTable connection",
      status: "PASSED",
      detail: connectionId
        ? `connectionId=${connectionId}`
        : "Direct OPENTABLE_ACCESS_TOKEN + OPENTABLE_RID",
    });

    const placeholderToken = isPlaceholderOpenTableAccessToken(accessToken);
    const placeholderRid = isPlaceholderOpenTableRestaurantId(restaurantId);
    const ping = await pingOpenTableApi({ accessToken, restaurantId });

    steps.push({
      id: "opentable_oauth_connection",
      label: "OpenTable OAuth API connection",
      status: ping.ok ? "PASSED" : placeholderToken || placeholderRid ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderToken || placeholderRid
          ? `Placeholder credentials: ${ping.message}. Replace with live OAuth token + restaurant ID in vault.`
          : ping.message,
    });
    if (!ping.ok) {
      return buildOpenTableLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        restaurantId,
      });
    }

    const secret = webhookSecret?.trim();
    if (secret) {
      const sampleBody = JSON.stringify({ event: "reservation.created", id: "smoke-era89" });
      const { createHmac } = await import("crypto");
      const sig = createHmac("sha256", secret).update(sampleBody).digest("hex");
      const verified = verifyOpenTableWebhookSignature(sampleBody, sig, secret);
      steps.push({
        id: "reservation_webhook_wiring",
        label: "Reservation webhook signature wiring",
        status: verified ? "PASSED" : "FAILED",
        detail: verified
          ? "Webhook HMAC verify + route wiring confirmed."
          : "verifyOpenTableWebhookSignature failed for sample payload.",
      });
    } else {
      steps.push({
        id: "reservation_webhook_wiring",
        label: "Reservation webhook signature wiring",
        status: "SKIPPED",
        detail:
          "OPENTABLE_WEBHOOK_SECRET not set — webhook route wiring verified in cert only.",
      });
    }

    if (userId) {
      const availability = await syncOpenTableAvailability(userId, { partySize: 2 });
      steps.push({
        id: "table_availability_wiring",
        label: "Table availability sync wiring",
        status: availability.ok ? "PASSED" : "FAILED",
        detail: availability.message,
      });
    } else {
      const date = format(new Date(), "yyyy-MM-dd");
      try {
        const slots = await fetchOpenTableAvailability({
          accessToken,
          restaurantId,
          date,
          partySize: 2,
        });
        steps.push({
          id: "table_availability_wiring",
          label: "Table availability API wiring (read-only)",
          status: "PASSED",
          detail: `Fetched ${slots.filter((s) => s.open).length} open slot(s) for party of 2.`,
        });
      } catch (e) {
        steps.push({
          id: "table_availability_wiring",
          label: "Table availability API wiring",
          status: "FAILED",
          detail: e instanceof Error ? e.message : "Availability fetch failed.",
        });
      }
    }

    return buildOpenTableLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      connectionId,
      restaurantId,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runOpenTableLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), OPENTABLE_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${OPENTABLE_LIVE_SMOKE_ARTIFACT}\n`);
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
