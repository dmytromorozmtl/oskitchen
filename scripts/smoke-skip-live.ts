/**
 * Skip live smoke — validate API credentials, deliver signed orders webhook
 * to staging, verify canonical ExternalOrder row + KDS kitchen import in DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/smoke-skip-live.ts [--write]
 *
 * Env (direct Skip partner sandbox):
 *   SKIP_CLIENT_ID, SKIP_CLIENT_SECRET, SKIP_RESTAURANT_ID, SKIP_WEBHOOK_SECRET
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
  getSkipOAuthCredentials,
  getWebhookSecret,
} from "@/lib/integrations/decrypt-connection";
import {
  SKIP_LIVE_SMOKE_ERA79_POLICY_ID,
  SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT,
} from "@/lib/integrations/skip-live-smoke-era79-policy";
import { isPlaceholderSkipRestaurantId } from "@/lib/integrations/skip-live-smoke-summary";
import {
  statusSyncTopicForSmoke,
  waitForKdsTicket,
  waitForKitchenImport,
} from "@/services/integrations/skip-live-smoke-service";
import { fetchSkipMarketplaceOrders } from "@/services/integrations/skip/skip-marketplace";

export const SKIP_LIVE_SMOKE_ARTIFACT = SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT;

export const SKIP_LIVE_SMOKE_VERSION = SKIP_LIVE_SMOKE_ERA79_POLICY_ID;

export type SkipLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type SkipLiveSmokeStep = {
  id: string;
  label: string;
  status: SkipLiveSmokeStepStatus;
  detail?: string;
};

export type SkipLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed";

export type SkipLiveSmokeSummary = {
  version: typeof SKIP_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: SkipLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: SkipLiveSmokeStep[];
  externalOrderId: string | null;
  connectionId: string | null;
  restaurantId: string | null;
  stagingWebhookUrl: string | null;
  honestyNote: string;
};

export type SkipLiveSmokeEnvInput = {
  clientId: string | null;
  clientSecret: string | null;
  restaurantId: string | null;
  webhookSecret: string | null;
  stagingBaseUrl: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export const SKIP_LIVE_DIRECT_ENV_KEYS = [
  "SKIP_CLIENT_ID",
  "SKIP_CLIENT_SECRET",
  "SKIP_RESTAURANT_ID",
  "SKIP_WEBHOOK_SECRET",
  "E2E_STAGING_BASE_URL",
  "CHANNEL_SMOKE_CONNECTION_ID",
  "DATABASE_URL",
] as const;

export const SKIP_LIVE_DB_ENV_KEYS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "E2E_STAGING_BASE_URL",
] as const;

export function readSkipLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): SkipLiveSmokeEnvInput {
  return {
    clientId: env.SKIP_CLIENT_ID?.trim() ?? null,
    clientSecret: env.SKIP_CLIENT_SECRET?.trim() ?? null,
    restaurantId: env.SKIP_RESTAURANT_ID?.trim() ?? null,
    webhookSecret: env.SKIP_WEBHOOK_SECRET?.trim() ?? null,
    stagingBaseUrl: env.E2E_STAGING_BASE_URL?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingSkipLiveSmokeEnvVars(input: SkipLiveSmokeEnvInput): string[] {
  const missing: string[] = [];

  if (!input.databaseUrl) missing.push("DATABASE_URL");
  if (!input.stagingBaseUrl) missing.push("E2E_STAGING_BASE_URL");

  const hasDirectSkip =
    Boolean(input.clientId) &&
    Boolean(input.clientSecret) &&
    Boolean(input.restaurantId) &&
    Boolean(input.webhookSecret);

  const hasDbTenant =
    Boolean(input.encryptionKey) &&
    Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirectSkip && !hasDbTenant) {
    if (!input.clientId) missing.push("SKIP_CLIENT_ID");
    if (!input.clientSecret) missing.push("SKIP_CLIENT_SECRET");
    if (!input.restaurantId) missing.push("SKIP_RESTAURANT_ID");
    if (!input.webhookSecret) missing.push("SKIP_WEBHOOK_SECRET");
    if (!input.encryptionKey && !input.clientId) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.clientId) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

function buildSyntheticSkipOrderPayload(externalOrderId: string): Record<string, unknown> {
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
      items: [{ name: "KitchenOS Smoke Poutine", quantity: 1, price: 1499 }],
      total: 1499,
      currency: "USD",
    },
  };
}

function signSkipWebhook(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

async function postStagingSkipWebhook(input: {
  stagingBaseUrl: string;
  connectionId: string;
  rawBody: string;
  webhookSecret: string;
}): Promise<{ ok: boolean; status?: number; message?: string }> {
  const signature = signSkipWebhook(input.rawBody, input.webhookSecret);
  const url = `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/skip/orders?cid=${encodeURIComponent(input.connectionId)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-skip-signature": signature,
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

async function pingSkipMarketplace(creds: {
  clientId: string;
  clientSecret: string;
  restaurantId: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const orders = await fetchSkipMarketplaceOrders(creds);
    return {
      ok: true,
      message: `Skip marketplace API reachable (${orders.length} orders in latest poll).`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Skip connection test failed.",
    };
  }
}

export function buildSkipLiveSmokeSummary(input: {
  steps: SkipLiveSmokeStep[];
  missingEnvVars: string[];
  externalOrderId?: string | null;
  connectionId?: string | null;
  restaurantId?: string | null;
  stagingWebhookUrl?: string | null;
}): SkipLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 ||
    input.steps.every((s) => s.status === "SKIPPED");

  let overall: SkipLiveSmokeSummary["overall"];
  let proofStatus: SkipLiveSmokeProofStatus;

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "skip_api_connection" && step.status === "SKIPPED",
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
    version: SKIP_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    externalOrderId: input.externalOrderId ?? null,
    connectionId: input.connectionId ?? null,
    restaurantId: input.restaurantId ?? null,
    stagingWebhookUrl: input.stagingWebhookUrl ?? null,
    honestyNote:
      "PASS requires live Skip marketplace API + staging orders webhook + ExternalOrder + KDS kitchen import — status sync on orders topic.",
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: SkipLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      creds: { clientId: string; clientSecret: string; restaurantId: string };
      webhookSecret: string;
      restaurantId: string;
    }
  | { error: string }
> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.restaurantId) {
    conn = await prisma.integrationConnection.findFirst({
      where: {
        provider: IntegrationProvider.SKIP,
        externalStoreId: input.restaurantId,
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
          provider: IntegrationProvider.SKIP,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Skip connection in DATABASE_URL — save credentials in dashboard or set SKIP_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getSkipOAuthCredentials(conn);
  const creds =
    input.clientId && input.restaurantId
      ? { clientId: input.clientId, clientSecret: input.clientSecret!, restaurantId: input.restaurantId }
      : decrypted;

  const webhookSecret =
    input.webhookSecret ??
    getWebhookSecret(conn) ??
    process.env.SKIP_WEBHOOK_SECRET?.trim() ??
    null;

  if (!creds) {
    return { error: "Connection missing decrypted Skip credentials (ENCRYPTION_KEY?)" };
  }
  if (!webhookSecret) {
    return { error: "Webhook secret missing on connection and SKIP_WEBHOOK_SECRET unset" };
  }

  const restaurantId = creds.restaurantId?.trim() ?? conn.externalStoreId?.trim() ?? "";
  if (!restaurantId) {
    return { error: "Restaurant ID missing on connection" };
  }

  return {
    connectionId: conn.id,
    creds: { ...creds, restaurantId },
    webhookSecret,
    restaurantId,
  };
}

export async function runSkipLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SkipLiveSmokeSummary> {
  const input = readSkipLiveSmokeEnv(env);
  const missingEnvVars = listMissingSkipLiveSmokeEnvVars(input);
  const steps: SkipLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildSkipLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Skip or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Skip connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildSkipLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        restaurantId: input.restaurantId,
      });
    }

    const { connectionId, creds, webhookSecret, restaurantId } = resolved;
    const stagingWebhookUrl = `${input.stagingBaseUrl!.replace(/\/+$/, "")}/api/webhooks/skip/orders?cid=${connectionId}`;

    const placeholderRestaurant = isPlaceholderSkipRestaurantId(restaurantId);
    const ping = await pingSkipMarketplace(creds);
    steps.push({
      id: "skip_api_connection",
      label: "Skip OAuth marketplace API connection",
      status: ping.ok ? "PASSED" : placeholderRestaurant ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderRestaurant
          ? `Restaurant ${restaurantId}: ${ping.message}. Update Dashboard → Integrations → Skip (saved restaurant is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      return buildSkipLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        restaurantId,
        stagingWebhookUrl,
      });
    }

    const externalOrderId = `skip-smoke-${Date.now()}`;
    const payload = buildSyntheticSkipOrderPayload(externalOrderId);
    const rawBody = JSON.stringify(payload);

    steps.push({
      id: "synthetic_webhook_payload",
      label: "Build synthetic Skip orders webhook payload",
      status: "PASSED",
      detail: `externalOrderId=${externalOrderId}`,
    });

    const delivered = await postStagingSkipWebhook({
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
      return buildSkipLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        restaurantId,
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
      return buildSkipLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        restaurantId,
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
      return buildSkipLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        restaurantId,
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
      return buildSkipLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId,
        connectionId,
        restaurantId,
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
          ? "orders topic triggers syncSkipStatusFromKitchenOrder"
          : `unexpected topic ${webhookTopic}`,
    });

    return buildSkipLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      externalOrderId,
      connectionId,
      restaurantId,
      stagingWebhookUrl,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runSkipLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), SKIP_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${SKIP_LIVE_SMOKE_ARTIFACT}\n`);
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
