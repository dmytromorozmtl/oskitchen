/**
 * Uber Eats live smoke — validate OAuth credentials, deliver signed orders webhook
 * to staging, verify canonical ExternalOrder row + KDS kitchen import in DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/smoke-uber-eats-live.ts [--write]
 *
 * Env (direct Uber Eats partner sandbox):
 *   UBER_EATS_CLIENT_ID, UBER_EATS_CLIENT_SECRET, UBER_EATS_STORE_ID
 *   UBER_EATS_WEBHOOK_SECRET, E2E_STAGING_BASE_URL, CHANNEL_SMOKE_CONNECTION_ID
 *   DATABASE_URL
 *
 * Env (load connection from staging DB):
 *   DATABASE_URL, ENCRYPTION_KEY, CHANNEL_SMOKE_OWNER_EMAIL | CHANNEL_SMOKE_CONNECTION_ID
 *   E2E_STAGING_BASE_URL
 *
 * Missing credentials → SKIPPED WITH REASON (exit 0). Real failure → FAILED (exit 1).
 */
import { createHmac } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  getUberEatsCredentials,
  getWebhookSecret,
} from "@/lib/integrations/decrypt-connection";
import {
  UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID,
  UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT,
} from "@/lib/integrations/uber-eats-live-smoke-era76-policy";
import { isPlaceholderUberEatsStoreId } from "@/lib/integrations/uber-eats-live-smoke-summary";
import {
  statusSyncTopicForSmoke,
  waitForKdsTicket,
  waitForKitchenImport,
} from "@/services/integrations/uber-eats-live-smoke-service";
import { testConnection, type UberEatsCredentials } from "@/services/integrations/uber-eats";

export const UBER_EATS_LIVE_SMOKE_ARTIFACT = UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT;

export const UBER_EATS_LIVE_SMOKE_VERSION = UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID;

export type UberEatsLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type UberEatsLiveSmokeStep = {
  id: string;
  label: string;
  status: UberEatsLiveSmokeStepStatus;
  detail?: string;
};

export type UberEatsLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed";

export type UberEatsLiveSmokeSummary = {
  version: typeof UBER_EATS_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: UberEatsLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: UberEatsLiveSmokeStep[];
  externalOrderId: string | null;
  connectionId: string | null;
  storeId: string | null;
  stagingWebhookUrl: string | null;
  honestyNote: string;
};

export type UberEatsLiveSmokeEnvInput = {
  clientId: string | null;
  clientSecret: string | null;
  storeId: string | null;
  webhookSecret: string | null;
  stagingBaseUrl: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export const UBER_EATS_LIVE_DIRECT_ENV_KEYS = [
  "UBER_EATS_CLIENT_ID",
  "UBER_EATS_CLIENT_SECRET",
  "UBER_EATS_STORE_ID",
  "UBER_EATS_WEBHOOK_SECRET",
  "E2E_STAGING_BASE_URL",
  "CHANNEL_SMOKE_CONNECTION_ID",
  "DATABASE_URL",
] as const;

export const UBER_EATS_LIVE_DB_ENV_KEYS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "E2E_STAGING_BASE_URL",
] as const;

export function readUberEatsLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): UberEatsLiveSmokeEnvInput {
  return {
    clientId: env.UBER_EATS_CLIENT_ID?.trim() ?? null,
    clientSecret: env.UBER_EATS_CLIENT_SECRET?.trim() ?? null,
    storeId: env.UBER_EATS_STORE_ID?.trim() ?? null,
    webhookSecret: env.UBER_EATS_WEBHOOK_SECRET?.trim() ?? null,
    stagingBaseUrl: env.E2E_STAGING_BASE_URL?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingUberEatsLiveSmokeEnvVars(input: UberEatsLiveSmokeEnvInput): string[] {
  const missing: string[] = [];

  if (!input.databaseUrl) missing.push("DATABASE_URL");
  if (!input.stagingBaseUrl) missing.push("E2E_STAGING_BASE_URL");

  const hasDirectUber =
    Boolean(input.clientId) &&
    Boolean(input.clientSecret) &&
    Boolean(input.storeId) &&
    Boolean(input.webhookSecret);

  const hasDbTenant =
    Boolean(input.encryptionKey) &&
    Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirectUber && !hasDbTenant) {
    if (!input.clientId) missing.push("UBER_EATS_CLIENT_ID");
    if (!input.clientSecret) missing.push("UBER_EATS_CLIENT_SECRET");
    if (!input.storeId) missing.push("UBER_EATS_STORE_ID");
    if (!input.webhookSecret) missing.push("UBER_EATS_WEBHOOK_SECRET");
    if (!input.encryptionKey && !input.clientId) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.clientId) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

function buildSyntheticUberEatsOrderPayload(externalOrderId: string): Record<string, unknown> {
  return {
    event_id: `evt-smoke-${externalOrderId}`,
    id: externalOrderId,
    state: "ACCEPTED",
    eater: {
      first_name: "Smoke",
      last_name: "Guest",
      phone: "+15550100001",
    },
    cart: {
      items: [{ title: "KitchenOS Smoke Burger", quantity: 1, price: { unit_price: 1299 } }],
    },
    payment: { total: 1299, currency_code: "USD" },
  };
}

async function postStagingUberEatsWebhook(input: {
  stagingBaseUrl: string;
  connectionId: string;
  rawBody: string;
  webhookSecret: string;
}): Promise<{ ok: boolean; status?: number; message?: string }> {
  const signature = createHmac("sha256", input.webhookSecret).update(input.rawBody, "utf8").digest("hex");
  const url = `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/uber-eats/orders?cid=${encodeURIComponent(input.connectionId)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-uber-eats-signature": signature,
    },
    body: input.rawBody,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, message: text.slice(0, 300) || `HTTP ${res.status}` };
  }
  return { ok: true, status: res.status };
}

async function waitForExternalOrder(
  prisma: PrismaClient,
  connectionId: string,
  externalOrderId: string,
  timeoutMs = 15_000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const row = await prisma.externalOrder.findUnique({
      where: {
        connectionId_externalOrderId: {
          connectionId,
          externalOrderId,
        },
      },
      select: { id: true },
    });
    if (row) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

export function buildUberEatsLiveSmokeSummary(input: {
  steps: UberEatsLiveSmokeStep[];
  missingEnvVars: string[];
  externalOrderId?: string | null;
  connectionId?: string | null;
  storeId?: string | null;
  stagingWebhookUrl?: string | null;
}): UberEatsLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 ||
    input.steps.every((s) => s.status === "SKIPPED");

  let overall: UberEatsLiveSmokeSummary["overall"];
  let proofStatus: UberEatsLiveSmokeProofStatus;

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "uber_oauth_connection" && step.status === "SKIPPED",
  );

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_store";
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
    version: UBER_EATS_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    externalOrderId: input.externalOrderId ?? null,
    connectionId: input.connectionId ?? null,
    storeId: input.storeId ?? null,
    stagingWebhookUrl: input.stagingWebhookUrl ?? null,
    honestyNote:
      "PASS requires live Uber OAuth + staging orders webhook + ExternalOrder + KDS kitchen import — status sync on orders topic.",
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: UberEatsLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      creds: UberEatsCredentials;
      webhookSecret: string;
      storeId: string;
    }
  | { error: string }
> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.storeId) {
    conn = await prisma.integrationConnection.findFirst({
      where: {
        provider: IntegrationProvider.UBER_EATS,
        externalStoreId: input.storeId,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  if (!conn && input.ownerEmail) {
    const profile = await prisma.userProfile.findFirst({
      where: { email: input.ownerEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (profile) {
      conn = await prisma.integrationConnection.findFirst({
        where: {
          userId: profile.id,
          provider: IntegrationProvider.UBER_EATS,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Uber Eats connection in DATABASE_URL — save credentials in dashboard or set UBER_EATS_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getUberEatsCredentials(conn);
  const creds: UberEatsCredentials | null =
    input.clientId && input.clientSecret && input.storeId
      ? {
          clientId: input.clientId,
          clientSecret: input.clientSecret,
          storeId: input.storeId,
        }
      : decrypted;

  const webhookSecret =
    input.webhookSecret ??
    getWebhookSecret(conn) ??
    process.env.UBER_EATS_WEBHOOK_SECRET?.trim() ??
    null;

  if (!creds) {
    return { error: "Connection missing decrypted Uber credentials (ENCRYPTION_KEY?)" };
  }
  if (!webhookSecret) {
    return { error: "Webhook secret missing on connection and UBER_EATS_WEBHOOK_SECRET unset" };
  }

  const storeId = creds.storeId?.trim() ?? conn.externalStoreId?.trim() ?? "";
  if (!storeId) {
    return { error: "Store UUID missing on connection" };
  }

  return {
    connectionId: conn.id,
    creds: { ...creds, storeId },
    webhookSecret,
    storeId,
  };
}

export async function runUberEatsLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<UberEatsLiveSmokeSummary> {
  const input = readUberEatsLiveSmokeEnv(env);
  const missingEnvVars = listMissingUberEatsLiveSmokeEnvVars(input);
  const steps: UberEatsLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildUberEatsLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Uber Eats or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Uber Eats connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildUberEatsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        storeId: input.storeId,
      });
    }

    const { connectionId, creds, webhookSecret, storeId } = resolved;
    const stagingWebhookUrl = `${input.stagingBaseUrl!.replace(/\/+$/, "")}/api/webhooks/uber-eats/orders?cid=${connectionId}`;

    const placeholderStore = isPlaceholderUberEatsStoreId(storeId);
    const ping = await testConnection(creds);
    steps.push({
      id: "uber_oauth_connection",
      label: "Uber Eats OAuth token exchange",
      status: ping.ok ? "PASSED" : placeholderStore ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderStore
          ? `Store ${storeId}: ${ping.message}. Update Dashboard → Integrations → Uber Eats (saved store is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      return buildUberEatsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        storeId,
        stagingWebhookUrl,
      });
    }

    const externalOrderId = `ue-smoke-${Date.now()}`;
    const payload = buildSyntheticUberEatsOrderPayload(externalOrderId);
    const rawBody = JSON.stringify(payload);

    steps.push({
      id: "synthetic_webhook_payload",
      label: "Build synthetic Uber Eats orders webhook payload",
      status: "PASSED",
      detail: `externalOrderId=${externalOrderId}`,
    });

    const delivered = await postStagingUberEatsWebhook({
      stagingBaseUrl: input.stagingBaseUrl!,
      connectionId,
      rawBody,
      webhookSecret,
    });
    steps.push({
      id: "staging_webhook_delivery",
      label: "Signed webhook POST to staging",
      status: delivered.ok ? "PASSED" : "FAILED",
      detail: delivered.ok ? `HTTP ${delivered.status}` : delivered.message,
    });
    if (!delivered.ok) {
      return buildUberEatsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        storeId,
        stagingWebhookUrl,
      });
    }

    const inDb = await waitForExternalOrder(prisma, connectionId, externalOrderId);
    steps.push({
      id: "db_canonical_order",
      label: "ExternalOrder row in DATABASE_URL",
      status: inDb ? "PASSED" : "FAILED",
      detail: inDb
        ? `connectionId=${connectionId} externalOrderId=${externalOrderId}`
        : "Order not found within 15s — check staging DB matches DATABASE_URL",
    });
    if (!inDb) {
      return buildUberEatsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        storeId,
        stagingWebhookUrl,
      });
    }

    const kitchenImport = await waitForKitchenImport({
      prisma,
      connectionId,
      externalOrderId,
    });
    steps.push({
      id: "kds_kitchen_import",
      label: "Kitchen import (KDS ticket source)",
      status: kitchenImport.ok ? "PASSED" : "FAILED",
      detail: kitchenImport.ok
        ? `importedOrderId=${kitchenImport.orderId}`
        : "importedOrderId not set within 20s — check staging webhook processor",
    });
    if (!kitchenImport.ok || !kitchenImport.orderId) {
      return buildUberEatsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        storeId,
        stagingWebhookUrl,
      });
    }

    const kdsTicket = await waitForKdsTicket({
      prisma,
      orderId: kitchenImport.orderId,
    });
    steps.push({
      id: "kds_ticket_visible",
      label: "KDS ticket row in kitchen orders",
      status: kdsTicket.ok ? "PASSED" : "FAILED",
      detail: kdsTicket.ok
        ? `orderId=${kitchenImport.orderId} status=${kdsTicket.status}`
        : "Kitchen order not visible within 15s",
    });
    if (!kdsTicket.ok) {
      return buildUberEatsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        storeId,
        stagingWebhookUrl,
      });
    }

    const webhookTopic = statusSyncTopicForSmoke();
    steps.push({
      id: "status_sync_wiring",
      label: "Status sync on orders topic",
      status: webhookTopic === "orders" ? "PASSED" : "FAILED",
      detail:
        webhookTopic === "orders"
          ? "orders topic triggers syncUberEatsStatusFromKitchenOrder"
          : `unexpected topic ${webhookTopic}`,
    });

    return buildUberEatsLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      externalOrderId,
      connectionId,
      storeId,
      stagingWebhookUrl,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  let summary: UberEatsLiveSmokeSummary;
  try {
    summary = await runUberEatsLiveSmoke();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    summary = buildUberEatsLiveSmokeSummary({
      steps: [
        {
          id: "runtime_error",
          label: "Smoke execution",
          status: "FAILED",
          detail: message.slice(0, 500),
        },
      ],
      missingEnvVars: [],
    });
  }
  const shouldWrite = process.argv.includes("--write") || process.argv.includes("-w");

  console.log(`\nUber Eats live smoke (${summary.version})\n`);
  console.log(`Overall: ${summary.overall} | proofStatus: ${summary.proofStatus}`);
  for (const step of summary.steps) {
    console.log(`  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`);
  }
  if (summary.missingEnvVars.length > 0) {
    console.log(`\nMissing env: ${summary.missingEnvVars.join(", ")}`);
  }

  if (shouldWrite) {
    const path = join(process.cwd(), UBER_EATS_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`\nArtifact: ${UBER_EATS_LIVE_SMOKE_ARTIFACT}\n`);
  }

  process.exit(summary.overall === "FAILED" ? 1 : 0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
