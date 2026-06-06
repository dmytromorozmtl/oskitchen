/**
 * Grubhub live smoke — validate API credentials, deliver signed orders webhook
 * to staging, verify canonical ExternalOrder row + KDS kitchen import in DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/smoke-grubhub-live.ts [--write]
 *
 * Env (direct Grubhub partner sandbox):
 *   GRUBHUB_API_KEY, GRUBHUB_MERCHANT_ID, GRUBHUB_WEBHOOK_SECRET
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
  getGrubhubApiCredentials,
  getWebhookSecret,
} from "@/lib/integrations/decrypt-connection";
import {
  GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID,
  GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT,
} from "@/lib/integrations/grubhub-live-smoke-era78-policy";
import { isPlaceholderGrubhubMerchantId } from "@/lib/integrations/grubhub-live-smoke-summary";
import {
  statusSyncTopicForSmoke,
  waitForKdsTicket,
  waitForKitchenImport,
} from "@/services/integrations/grubhub-live-smoke-service";
import { fetchGrubhubMarketplaceOrders } from "@/services/integrations/grubhub/grubhub-marketplace";

export const GRUBHUB_LIVE_SMOKE_ARTIFACT = GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT;

export const GRUBHUB_LIVE_SMOKE_VERSION = GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID;

export type GrubhubLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type GrubhubLiveSmokeStep = {
  id: string;
  label: string;
  status: GrubhubLiveSmokeStepStatus;
  detail?: string;
};

export type GrubhubLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed";

export type GrubhubLiveSmokeSummary = {
  version: typeof GRUBHUB_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: GrubhubLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: GrubhubLiveSmokeStep[];
  externalOrderId: string | null;
  connectionId: string | null;
  merchantId: string | null;
  stagingWebhookUrl: string | null;
  honestyNote: string;
};

export type GrubhubLiveSmokeEnvInput = {
  apiKey: string | null;
  merchantId: string | null;
  webhookSecret: string | null;
  stagingBaseUrl: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export const GRUBHUB_LIVE_DIRECT_ENV_KEYS = [
  "GRUBHUB_API_KEY",
  "GRUBHUB_MERCHANT_ID",
  "GRUBHUB_WEBHOOK_SECRET",
  "E2E_STAGING_BASE_URL",
  "CHANNEL_SMOKE_CONNECTION_ID",
  "DATABASE_URL",
] as const;

export const GRUBHUB_LIVE_DB_ENV_KEYS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "E2E_STAGING_BASE_URL",
] as const;

export function readGrubhubLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): GrubhubLiveSmokeEnvInput {
  return {
    apiKey: env.GRUBHUB_API_KEY?.trim() ?? null,
    merchantId: env.GRUBHUB_MERCHANT_ID?.trim() ?? null,
    webhookSecret: env.GRUBHUB_WEBHOOK_SECRET?.trim() ?? null,
    stagingBaseUrl: env.E2E_STAGING_BASE_URL?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingGrubhubLiveSmokeEnvVars(input: GrubhubLiveSmokeEnvInput): string[] {
  const missing: string[] = [];

  if (!input.databaseUrl) missing.push("DATABASE_URL");
  if (!input.stagingBaseUrl) missing.push("E2E_STAGING_BASE_URL");

  const hasDirectGrubhub =
    Boolean(input.apiKey) &&
    Boolean(input.merchantId) &&
    Boolean(input.webhookSecret);

  const hasDbTenant =
    Boolean(input.encryptionKey) &&
    Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirectGrubhub && !hasDbTenant) {
    if (!input.apiKey) missing.push("GRUBHUB_API_KEY");
    if (!input.merchantId) missing.push("GRUBHUB_MERCHANT_ID");
    if (!input.webhookSecret) missing.push("GRUBHUB_WEBHOOK_SECRET");
    if (!input.encryptionKey && !input.apiKey) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.apiKey) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

function buildSyntheticGrubhubOrderPayload(externalOrderId: string): Record<string, unknown> {
  return {
    event_id: `evt-smoke-${externalOrderId}`,
    event_type: "order.created",
    order: {
      uuid: externalOrderId,
      id: externalOrderId,
      display_id: externalOrderId.slice(-6),
      status: "confirmed",
      customer: {
        first_name: "Smoke",
        last_name: "Guest",
        phone: "+15550100002",
      },
      items: [{ name: "KitchenOS Smoke Tacos", quantity: 1, price: 1499 }],
      total: 1499,
      currency: "USD",
    },
  };
}

function signGrubhubWebhook(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

async function postStagingGrubhubWebhook(input: {
  stagingBaseUrl: string;
  connectionId: string;
  rawBody: string;
  webhookSecret: string;
}): Promise<{ ok: boolean; status?: number; message?: string }> {
  const signature = signGrubhubWebhook(input.rawBody, input.webhookSecret);
  const url = `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/grubhub/orders?cid=${encodeURIComponent(input.connectionId)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-grubhub-signature": signature,
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

async function pingGrubhubMarketplace(creds: {
  apiKey: string;
  merchantId: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const orders = await fetchGrubhubMarketplaceOrders(creds);
    return {
      ok: true,
      message: `Grubhub marketplace API reachable (${orders.length} orders in latest poll).`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Grubhub connection test failed.",
    };
  }
}

export function buildGrubhubLiveSmokeSummary(input: {
  steps: GrubhubLiveSmokeStep[];
  missingEnvVars: string[];
  externalOrderId?: string | null;
  connectionId?: string | null;
  merchantId?: string | null;
  stagingWebhookUrl?: string | null;
}): GrubhubLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 ||
    input.steps.every((s) => s.status === "SKIPPED");

  let overall: GrubhubLiveSmokeSummary["overall"];
  let proofStatus: GrubhubLiveSmokeProofStatus;

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "grubhub_api_connection" && step.status === "SKIPPED",
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
    version: GRUBHUB_LIVE_SMOKE_VERSION,
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
      "PASS requires live Grubhub marketplace API + staging orders webhook + ExternalOrder + KDS kitchen import — status sync on orders topic.",
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: GrubhubLiveSmokeEnvInput,
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
        provider: IntegrationProvider.GRUBHUB,
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
          provider: IntegrationProvider.GRUBHUB,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Grubhub connection in DATABASE_URL — save credentials in dashboard or set GRUBHUB_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getGrubhubApiCredentials(conn);
  const creds =
    input.apiKey && input.merchantId
      ? { apiKey: input.apiKey, merchantId: input.merchantId }
      : decrypted;

  const webhookSecret =
    input.webhookSecret ??
    getWebhookSecret(conn) ??
    process.env.GRUBHUB_WEBHOOK_SECRET?.trim() ??
    null;

  if (!creds) {
    return { error: "Connection missing decrypted Grubhub credentials (ENCRYPTION_KEY?)" };
  }
  if (!webhookSecret) {
    return { error: "Webhook secret missing on connection and GRUBHUB_WEBHOOK_SECRET unset" };
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

export async function runGrubhubLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<GrubhubLiveSmokeSummary> {
  const input = readGrubhubLiveSmokeEnv(env);
  const missingEnvVars = listMissingGrubhubLiveSmokeEnvVars(input);
  const steps: GrubhubLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildGrubhubLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Grubhub or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Grubhub connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildGrubhubLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        merchantId: input.merchantId,
      });
    }

    const { connectionId, creds, webhookSecret, merchantId } = resolved;
    const stagingWebhookUrl = `${input.stagingBaseUrl!.replace(/\/+$/, "")}/api/webhooks/grubhub/orders?cid=${connectionId}`;

    const placeholderMerchant = isPlaceholderGrubhubMerchantId(merchantId);
    const ping = await pingGrubhubMarketplace(creds);
    steps.push({
      id: "grubhub_api_connection",
      label: "Grubhub marketplace API connection",
      status: ping.ok ? "PASSED" : placeholderMerchant ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderMerchant
          ? `Merchant ${merchantId}: ${ping.message}. Update Dashboard → Integrations → Grubhub (saved merchant is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      return buildGrubhubLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        merchantId,
        stagingWebhookUrl,
      });
    }

    const externalOrderId = `gh-smoke-${Date.now()}`;
    const payload = buildSyntheticGrubhubOrderPayload(externalOrderId);
    const rawBody = JSON.stringify(payload);

    steps.push({
      id: "synthetic_webhook_payload",
      label: "Build synthetic Grubhub orders webhook payload",
      status: "PASSED",
      detail: `externalOrderId=${externalOrderId}`,
    });

    const delivered = await postStagingGrubhubWebhook({
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
      return buildGrubhubLiveSmokeSummary({
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
      return buildGrubhubLiveSmokeSummary({
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
      return buildGrubhubLiveSmokeSummary({
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
      return buildGrubhubLiveSmokeSummary({
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
          ? "orders topic triggers syncGrubhubStatusFromKitchenOrder"
          : `unexpected topic ${webhookTopic}`,
    });

    return buildGrubhubLiveSmokeSummary({
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
  const summary = await runGrubhubLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), GRUBHUB_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${GRUBHUB_LIVE_SMOKE_ARTIFACT}\n`);
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
