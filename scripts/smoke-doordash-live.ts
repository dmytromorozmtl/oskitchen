/**
 * DoorDash live smoke — validate API credentials, deliver signed orders webhook
 * to staging, verify canonical ExternalOrder row + KDS kitchen import in DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/smoke-doordash-live.ts [--write]
 *
 * Env (direct DoorDash partner sandbox):
 *   DOORDASH_API_KEY, DOORDASH_MERCHANT_ID, DOORDASH_WEBHOOK_SECRET
 *   E2E_STAGING_BASE_URL, CHANNEL_SMOKE_CONNECTION_ID, DATABASE_URL
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
  getDoorDashApiCredentials,
  getWebhookSecret,
} from "@/lib/integrations/decrypt-connection";
import {
  DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID,
  DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT,
} from "@/lib/integrations/doordash-live-smoke-era77-policy";
import { isPlaceholderDoorDashMerchantId } from "@/lib/integrations/doordash-live-smoke-summary";
import {
  statusSyncTopicForSmoke,
  waitForKdsTicket,
  waitForKitchenImport,
} from "@/services/integrations/doordash-live-smoke-service";
import { fetchDoorDashMarketplaceOrders } from "@/services/integrations/doordash/doordash-marketplace";

export const DOORDASH_LIVE_SMOKE_ARTIFACT = DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT;

export const DOORDASH_LIVE_SMOKE_VERSION = DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID;

export type DoorDashLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type DoorDashLiveSmokeStep = {
  id: string;
  label: string;
  status: DoorDashLiveSmokeStepStatus;
  detail?: string;
};

export type DoorDashLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed";

export type DoorDashLiveSmokeSummary = {
  version: typeof DOORDASH_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: DoorDashLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: DoorDashLiveSmokeStep[];
  externalOrderId: string | null;
  connectionId: string | null;
  merchantId: string | null;
  stagingWebhookUrl: string | null;
  honestyNote: string;
};

export type DoorDashLiveSmokeEnvInput = {
  apiKey: string | null;
  merchantId: string | null;
  webhookSecret: string | null;
  stagingBaseUrl: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export const DOORDASH_LIVE_DIRECT_ENV_KEYS = [
  "DOORDASH_API_KEY",
  "DOORDASH_MERCHANT_ID",
  "DOORDASH_WEBHOOK_SECRET",
  "E2E_STAGING_BASE_URL",
  "CHANNEL_SMOKE_CONNECTION_ID",
  "DATABASE_URL",
] as const;

export const DOORDASH_LIVE_DB_ENV_KEYS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "E2E_STAGING_BASE_URL",
] as const;

export function readDoorDashLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): DoorDashLiveSmokeEnvInput {
  return {
    apiKey: env.DOORDASH_API_KEY?.trim() ?? null,
    merchantId: env.DOORDASH_MERCHANT_ID?.trim() ?? null,
    webhookSecret: env.DOORDASH_WEBHOOK_SECRET?.trim() ?? null,
    stagingBaseUrl: env.E2E_STAGING_BASE_URL?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingDoorDashLiveSmokeEnvVars(input: DoorDashLiveSmokeEnvInput): string[] {
  const missing: string[] = [];

  if (!input.databaseUrl) missing.push("DATABASE_URL");
  if (!input.stagingBaseUrl) missing.push("E2E_STAGING_BASE_URL");

  const hasDirectDoorDash =
    Boolean(input.apiKey) &&
    Boolean(input.merchantId) &&
    Boolean(input.webhookSecret);

  const hasDbTenant =
    Boolean(input.encryptionKey) &&
    Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirectDoorDash && !hasDbTenant) {
    if (!input.apiKey) missing.push("DOORDASH_API_KEY");
    if (!input.merchantId) missing.push("DOORDASH_MERCHANT_ID");
    if (!input.webhookSecret) missing.push("DOORDASH_WEBHOOK_SECRET");
    if (!input.encryptionKey && !input.apiKey) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.apiKey) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

function buildSyntheticDoorDashOrderPayload(externalOrderId: string): Record<string, unknown> {
  return {
    event_id: `evt-smoke-${externalOrderId}`,
    event_type: "order.created",
    order: {
      id: externalOrderId,
      display_id: externalOrderId.slice(-6),
      status: "confirmed",
      customer: {
        first_name: "Smoke",
        last_name: "Guest",
        phone: "+15550100002",
      },
      items: [{ name: "KitchenOS Smoke Bowl", quantity: 1, price: 1499 }],
      total: 1499,
      currency: "USD",
    },
  };
}

function signDoorDashWebhook(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

async function postStagingDoorDashWebhook(input: {
  stagingBaseUrl: string;
  connectionId: string;
  rawBody: string;
  webhookSecret: string;
}): Promise<{ ok: boolean; status?: number; message?: string }> {
  const signature = signDoorDashWebhook(input.rawBody, input.webhookSecret);
  const url = `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/doordash/orders?cid=${encodeURIComponent(input.connectionId)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-doordash-signature": signature,
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

async function pingDoorDashMarketplace(creds: {
  apiKey: string;
  merchantId: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const orders = await fetchDoorDashMarketplaceOrders(creds);
    return {
      ok: true,
      message: `DoorDash marketplace API reachable (${orders.length} orders in latest poll).`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "DoorDash connection test failed.",
    };
  }
}

export function buildDoorDashLiveSmokeSummary(input: {
  steps: DoorDashLiveSmokeStep[];
  missingEnvVars: string[];
  externalOrderId?: string | null;
  connectionId?: string | null;
  merchantId?: string | null;
  stagingWebhookUrl?: string | null;
}): DoorDashLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 ||
    input.steps.every((s) => s.status === "SKIPPED");

  let overall: DoorDashLiveSmokeSummary["overall"];
  let proofStatus: DoorDashLiveSmokeProofStatus;

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "doordash_api_connection" && step.status === "SKIPPED",
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
    version: DOORDASH_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    externalOrderId: input.externalOrderId ?? null,
    connectionId: input.connectionId ?? null,
    merchantId: input.merchantId ?? null,
    stagingWebhookUrl: input.stagingWebhookUrl ?? null,
    honestyNote:
      "PASS requires live DoorDash marketplace API + staging orders webhook + ExternalOrder + KDS kitchen import — status sync on orders topic.",
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: DoorDashLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      creds: { apiKey: string; merchantId: string };
      webhookSecret: string;
      merchantId: string;
    }
  | { error: string }
> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.merchantId) {
    conn = await prisma.integrationConnection.findFirst({
      where: {
        provider: IntegrationProvider.DOORDASH,
        externalStoreId: input.merchantId,
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
          provider: IntegrationProvider.DOORDASH,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No DoorDash connection in DATABASE_URL — save credentials in dashboard or set DOORDASH_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getDoorDashApiCredentials(conn);
  const creds =
    input.apiKey && input.merchantId
      ? { apiKey: input.apiKey, merchantId: input.merchantId }
      : decrypted;

  const webhookSecret =
    input.webhookSecret ??
    getWebhookSecret(conn) ??
    process.env.DOORDASH_WEBHOOK_SECRET?.trim() ??
    null;

  if (!creds) {
    return { error: "Connection missing decrypted DoorDash credentials (ENCRYPTION_KEY?)" };
  }
  if (!webhookSecret) {
    return { error: "Webhook secret missing on connection and DOORDASH_WEBHOOK_SECRET unset" };
  }

  const merchantId = creds.merchantId?.trim() ?? conn.externalStoreId?.trim() ?? "";
  if (!merchantId) {
    return { error: "Merchant ID missing on connection" };
  }

  return {
    connectionId: conn.id,
    creds: { ...creds, merchantId },
    webhookSecret,
    merchantId,
  };
}

export async function runDoorDashLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<DoorDashLiveSmokeSummary> {
  const input = readDoorDashLiveSmokeEnv(env);
  const missingEnvVars = listMissingDoorDashLiveSmokeEnvVars(input);
  const steps: DoorDashLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildDoorDashLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct DoorDash or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve DoorDash connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildDoorDashLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        merchantId: input.merchantId,
      });
    }

    const { connectionId, creds, webhookSecret, merchantId } = resolved;
    const stagingWebhookUrl = `${input.stagingBaseUrl!.replace(/\/+$/, "")}/api/webhooks/doordash/orders?cid=${connectionId}`;

    const placeholderMerchant = isPlaceholderDoorDashMerchantId(merchantId);
    const ping = await pingDoorDashMarketplace(creds);
    steps.push({
      id: "doordash_api_connection",
      label: "DoorDash marketplace API connection",
      status: ping.ok ? "PASSED" : placeholderMerchant ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderMerchant
          ? `Merchant ${merchantId}: ${ping.message}. Update Dashboard → Integrations → DoorDash (saved merchant is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      return buildDoorDashLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        merchantId,
        stagingWebhookUrl,
      });
    }

    const externalOrderId = `dd-smoke-${Date.now()}`;
    const payload = buildSyntheticDoorDashOrderPayload(externalOrderId);
    const rawBody = JSON.stringify(payload);

    steps.push({
      id: "synthetic_webhook_payload",
      label: "Build synthetic DoorDash orders webhook payload",
      status: "PASSED",
      detail: `externalOrderId=${externalOrderId}`,
    });

    const delivered = await postStagingDoorDashWebhook({
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
      return buildDoorDashLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        merchantId,
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
      return buildDoorDashLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        merchantId,
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
      return buildDoorDashLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        merchantId,
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
      return buildDoorDashLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        merchantId,
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
          ? "orders topic triggers syncDoorDashStatusFromKitchenOrder"
          : `unexpected topic ${webhookTopic}`,
    });

    return buildDoorDashLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      externalOrderId,
      connectionId,
      merchantId,
      stagingWebhookUrl,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runDoorDashLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), DOORDASH_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${DOORDASH_LIVE_SMOKE_ARTIFACT}\n`);
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
