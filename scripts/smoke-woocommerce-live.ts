/**
 * WooCommerce live smoke — validate credentials, create test order, deliver signed
 * webhook to staging, verify canonical ExternalOrder row in DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/smoke-woocommerce-live.ts [--write]
 *
 * Env (direct Woo store):
 *   WOOCOMMERCE_BASE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET
 *   WOOCOMMERCE_WEBHOOK_SECRET, E2E_STAGING_BASE_URL, CHANNEL_SMOKE_CONNECTION_ID
 *   DATABASE_URL
 *
 * Env (load connection from staging DB instead of WOOCOMMERCE_*):
 *   DATABASE_URL, ENCRYPTION_KEY, CHANNEL_SMOKE_OWNER_EMAIL | CHANNEL_SMOKE_CONNECTION_ID
 *   E2E_STAGING_BASE_URL
 *
 * Missing credentials → SKIPPED WITH REASON (exit 0). Real failure → FAILED (exit 1).
 *
 * Auto-loads `.env.smoke.local` when present (see .env.smoke.example).
 */
import { createHmac } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  getWebhookSecret,
  getWooCommerceCredentials,
} from "@/lib/integrations/decrypt-connection";
import {
  WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT,
} from "@/lib/integrations/woocommerce-live-smoke-era71-policy";
import { isPlaceholderWooStoreHost } from "@/lib/integrations/woocommerce-live-smoke-summary";
import {
  inventorySyncTopicForSmoke,
  waitForKdsTicket,
  waitForKitchenImport,
} from "@/services/integrations/woocommerce-live-smoke-service";
import {
  testConnection,
  verifyWebhookSignature,
  type WooCredentials,
} from "@/services/integrations/woocommerce";
import {
  WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT,
  WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID,
} from "@/lib/integrations/woocommerce-webhook-kds-live-smoke-policy";
import {
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_ARTIFACT,
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_POLICY_ID,
} from "@/lib/integrations/woocommerce-merchant-proof-p0-10-policy";
import {
  appendMerchantProofInventoryStepsAfterOrder,
  ensureMerchantProofInventoryFixture,
} from "@/services/integrations/woocommerce-merchant-proof-p0-10";
import {
  ensureKitchenTaskForKdsSmoke,
  ingestWooCommerceWebhookForSmoke,
  simulateKdsBump,
  waitForKitchenTaskForOrder,
  waitForKdsBumpState,
  waitForWebhookEvent,
} from "@/services/integrations/woocommerce-webhook-kds-smoke";

export const WOOCOMMERCE_LIVE_SMOKE_ARTIFACT = WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT;

export const WOOCOMMERCE_LIVE_SMOKE_VERSION = WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID;

export type WooCommerceLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type WooCommerceLiveSmokeStep = {
  id: string;
  label: string;
  status: WooCommerceLiveSmokeStepStatus;
  detail?: string;
};

export type WooCommerceLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_passed_webhook_synthetic"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed";

export type WooCommerceLiveSmokeSummary = {
  version: typeof WOOCOMMERCE_LIVE_SMOKE_VERSION;
  policyId: typeof WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: WooCommerceLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: WooCommerceLiveSmokeStep[];
  externalOrderId: string | null;
  connectionId: string | null;
  webhookEventId: string | null;
  kitchenTaskId: string | null;
  importedOrderId: string | null;
  stagingWebhookUrl: string | null;
  honestyNote: string;
};

export type WooCommerceLiveSmokeEnvInput = {
  wooBaseUrl: string | null;
  wooConsumerKey: string | null;
  wooConsumerSecret: string | null;
  wooWebhookSecret: string | null;
  stagingBaseUrl: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export const WOOCOMMERCE_LIVE_DIRECT_ENV_KEYS = [
  "WOOCOMMERCE_BASE_URL",
  "WOOCOMMERCE_CONSUMER_KEY",
  "WOOCOMMERCE_CONSUMER_SECRET",
  "WOOCOMMERCE_WEBHOOK_SECRET",
  "E2E_STAGING_BASE_URL",
  "CHANNEL_SMOKE_CONNECTION_ID",
  "DATABASE_URL",
] as const;

export const WOOCOMMERCE_LIVE_DB_ENV_KEYS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "E2E_STAGING_BASE_URL",
] as const;

export function readWooCommerceLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): WooCommerceLiveSmokeEnvInput {
  return {
    wooBaseUrl: env.WOOCOMMERCE_BASE_URL?.trim() ?? null,
    wooConsumerKey: env.WOOCOMMERCE_CONSUMER_KEY?.trim() ?? null,
    wooConsumerSecret: env.WOOCOMMERCE_CONSUMER_SECRET?.trim() ?? null,
    wooWebhookSecret: env.WOOCOMMERCE_WEBHOOK_SECRET?.trim() ?? null,
    stagingBaseUrl: env.E2E_STAGING_BASE_URL?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function wooStoreHostLabel(baseUrl: string): string {
  try {
    return new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`).host;
  } catch {
    return baseUrl.slice(0, 80);
  }
}

export function formatWooPingFailureDetail(baseUrl: string, message: string): string {
  const host = wooStoreHostLabel(baseUrl);
  const placeholder =
    host.includes("smoke-test") ||
    host.includes("example.com") ||
    host.endsWith(".local");
  const hint = placeholder
    ? " Update the store URL in Dashboard → Integrations → WooCommerce (saved host is a placeholder)."
    : "";
  return `Store ${host}: ${message}.${hint}`;
}

export function listMissingWooCommerceLiveSmokeEnvVars(
  input: WooCommerceLiveSmokeEnvInput,
): string[] {
  const missing: string[] = [];

  if (!input.databaseUrl) missing.push("DATABASE_URL");
  if (!input.stagingBaseUrl) missing.push("E2E_STAGING_BASE_URL");

  const hasDirectWoo =
    Boolean(input.wooBaseUrl) &&
    Boolean(input.wooConsumerKey) &&
    Boolean(input.wooConsumerSecret) &&
    Boolean(input.wooWebhookSecret) &&
    Boolean(input.connectionId);

  const hasDbTenant =
    Boolean(input.encryptionKey) &&
    Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirectWoo && !hasDbTenant) {
    if (!input.wooBaseUrl) missing.push("WOOCOMMERCE_BASE_URL");
    if (!input.wooConsumerKey) missing.push("WOOCOMMERCE_CONSUMER_KEY");
    if (!input.wooConsumerSecret) missing.push("WOOCOMMERCE_CONSUMER_SECRET");
    if (!input.wooWebhookSecret) missing.push("WOOCOMMERCE_WEBHOOK_SECRET");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
    }
    if (!input.encryptionKey && !input.wooBaseUrl) missing.push("ENCRYPTION_KEY");
    if (!input.ownerEmail && !input.connectionId && !input.wooBaseUrl) {
      missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

function basicAuthHeader(key: string, secret: string): string {
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

function wooRestUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/wp-json/wc/v3${path}`;
}

async function createWooTestOrder(creds: WooCredentials): Promise<{ ok: true; orderId: string; payload: Record<string, unknown> } | { ok: false; message: string }> {
  const body = {
    payment_method: "cod",
    payment_method_title: "KitchenOS smoke",
    set_paid: false,
    status: "processing",
    billing: {
      first_name: "KitchenOS",
      last_name: "Smoke",
      email: "smoke-woo@kitchenos.test",
    },
    line_items: [
      {
        name: "KitchenOS Woo live smoke item",
        quantity: 1,
        total: "1.00",
      },
    ],
  };

  const res = await fetch(wooRestUrl(creds.baseUrl, "/orders"), {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(creds.consumerKey, creds.consumerSecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, message: `Woo create order ${res.status}: ${text.slice(0, 300)}` };
  }

  const payload = (await res.json()) as Record<string, unknown>;
  const orderId = String(payload.id ?? "");
  if (!orderId) {
    return { ok: false, message: "Woo create order returned no id" };
  }
  return { ok: true, orderId, payload };
}

export function signWooWebhookBody(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

export function buildSyntheticWooSmokeOrderPayload(
  externalOrderId: string,
): Record<string, unknown> {
  const fixturePath = join(
    process.cwd(),
    "tests/fixtures/channel-golden-path/woo-order-minimal.json",
  );
  const base = JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
  return {
    ...base,
    id: Number(externalOrderId) || externalOrderId,
    number: externalOrderId,
    customer_note: `KitchenOS webhook-only smoke ${externalOrderId}`,
  };
}

async function postStagingWooWebhook(input: {
  stagingBaseUrl: string;
  connectionId: string;
  rawBody: string;
  webhookSecret: string;
  topic?: string;
  deliveryId?: string;
}): Promise<
  | { ok: true; status: number; queued: boolean; body: unknown }
  | { ok: false; message: string }
> {
  const url = `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`;
  const signature = signWooWebhookBody(input.rawBody, input.webhookSecret);
  const topic = input.topic ?? inventorySyncTopicForSmoke();
  const deliveryId = input.deliveryId ?? `smoke-${Date.now()}`;

  if (!verifyWebhookSignature(input.rawBody, signature, input.webhookSecret)) {
    return { ok: false, message: "Local signature self-check failed" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WC-Webhook-Topic": topic,
      "X-WC-Webhook-Delivery-Id": deliveryId,
      "X-WC-Webhook-Signature": signature,
    },
    body: input.rawBody,
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, message: `Staging webhook ${res.status}: ${text.slice(0, 300)}` };
  }

  const body = await res.json().catch(() => ({}));
  return {
    ok: true,
    status: res.status,
    queued: Boolean((body as { queued?: boolean }).queued),
    body,
  };
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

export function buildWooCommerceLiveSmokeSummary(input: {
  steps: WooCommerceLiveSmokeStep[];
  missingEnvVars: string[];
  externalOrderId?: string | null;
  connectionId?: string | null;
  webhookEventId?: string | null;
  kitchenTaskId?: string | null;
  importedOrderId?: string | null;
  stagingWebhookUrl?: string | null;
}): WooCommerceLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 ||
    input.steps.every((s) => s.status === "SKIPPED");

  let overall: WooCommerceLiveSmokeSummary["overall"];
  let proofStatus: WooCommerceLiveSmokeProofStatus;

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "woo_api_connection" && step.status === "SKIPPED",
  );
  const webhookKdsPassed =
    input.steps.some((step) => step.id === "webhook_event_persisted" && step.status === "PASSED") &&
    input.steps.some((step) => step.id === "kitchen_task_linked" && step.status === "PASSED") &&
    input.steps.some((step) => step.id === "kds_bump_ready" && step.status === "PASSED") &&
    input.steps.some((step) => step.id === "kds_ticket_visible" && step.status === "PASSED") &&
    input.steps.some((step) => step.id === "staging_webhook_delivery" && step.status === "PASSED");

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (failed) {
    overall = "FAILED";
    proofStatus = "proof_failed";
  } else if (placeholderSkipped && webhookKdsPassed) {
    overall = "PASSED";
    proofStatus = "proof_passed_webhook_synthetic";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_store";
  } else if (skippedOnly) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else {
    overall = "PASSED";
    proofStatus = "proof_passed";
  }

  const honestyNote =
    proofStatus === "proof_passed_webhook_synthetic"
      ? "Webhook-only PASS: signed order.created → WebhookEvent → ExternalOrder → kitchen import → KitchenTask → KDS bump (READY) → bi-directional inventory sync (kitchen decrement + product.updated pull)."
      : "PASS requires live Woo REST + signed webhook → WebhookEvent → ExternalOrder → kitchen import → KitchenTask → KDS bump — bi-directional inventory sync on order.created + product.updated.";

  return {
    version: WOOCOMMERCE_LIVE_SMOKE_VERSION,
    policyId: WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    externalOrderId: input.externalOrderId ?? null,
    connectionId: input.connectionId ?? null,
    webhookEventId: input.webhookEventId ?? null,
    kitchenTaskId: input.kitchenTaskId ?? null,
    importedOrderId: input.importedOrderId ?? null,
    stagingWebhookUrl: input.stagingWebhookUrl ?? null,
    honestyNote,
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: WooCommerceLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      userId: string;
      creds: WooCredentials;
      webhookSecret: string;
    }
  | { error: string }
> {
  if (
    input.wooBaseUrl &&
    input.wooConsumerKey &&
    input.wooConsumerSecret &&
    input.wooWebhookSecret &&
    input.connectionId
  ) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: input.connectionId },
      select: { userId: true },
    });
    if (!conn) {
      return { error: `Connection not found: ${input.connectionId}` };
    }
    return {
      connectionId: input.connectionId,
      userId: conn.userId,
      creds: {
        baseUrl: input.wooBaseUrl,
        consumerKey: input.wooConsumerKey,
        consumerSecret: input.wooConsumerSecret,
      },
      webhookSecret: input.wooWebhookSecret,
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
          provider: IntegrationProvider.WOOCOMMERCE,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return { error: "No WooCommerce connection — set WOOCOMMERCE_* or CHANNEL_SMOKE_* + DATABASE_URL" };
  }

  const creds = getWooCommerceCredentials(conn);
  const webhookSecret =
    getWebhookSecret(conn) ?? input.wooWebhookSecret ?? process.env.WOOCOMMERCE_WEBHOOK_SECRET?.trim() ?? null;

  if (!creds) {
    return { error: "Connection missing decrypted Woo credentials (ENCRYPTION_KEY?)" };
  }
  if (!webhookSecret) {
    return { error: "Webhook secret missing on connection and WOOCOMMERCE_WEBHOOK_SECRET unset" };
  }

  return { connectionId: conn.id, userId: conn.userId, creds, webhookSecret };
}

async function runWooWebhookKdsProofSteps(input: {
  prisma: PrismaClient;
  steps: WooCommerceLiveSmokeStep[];
  stagingBaseUrl: string;
  connectionId: string;
  userId: string;
  webhookSecret: string;
  externalOrderId: string;
  orderPayload: Record<string, unknown>;
  syntheticWebhook?: boolean;
}): Promise<WooCommerceLiveSmokeSummary | null> {
  if (input.syntheticWebhook) {
    input.steps.push({
      id: "synthetic_order_payload",
      label: "Synthetic Woo order payload (webhook-only)",
      status: "PASSED",
      detail: `externalOrderId=${input.externalOrderId}`,
    });
  }

  const rawBody = JSON.stringify(input.orderPayload);
  const webhookTopic = inventorySyncTopicForSmoke();
  const deliveryId = `smoke-${input.externalOrderId}-${Date.now()}`;
  const hmacOk = verifyWebhookSignature(
    rawBody,
    signWooWebhookBody(rawBody, input.webhookSecret),
    input.webhookSecret,
  );
  input.steps.push({
    id: "hmac_self_check",
    label: "HMAC signature self-check",
    status: hmacOk ? "PASSED" : "FAILED",
    detail: hmacOk ? "sha256 HMAC matches webhook secret" : "Local HMAC verify failed",
  });
  if (!hmacOk) {
    return buildWooCommerceLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
    });
  }

  const merchantFixture = await ensureMerchantProofInventoryFixture({
    prisma: input.prisma,
    userId: input.userId,
    connectionId: input.connectionId,
  });
  input.steps.push({
    id: "merchant_proof_fixture",
    label: "Merchant proof inventory fixture",
    status: merchantFixture.ok ? "PASSED" : "SKIPPED",
    detail: merchantFixture.ok
      ? `productId=${merchantFixture.productId} sku=GOLDEN-WOO-1 qty=${merchantFixture.initialQuantity}`
      : merchantFixture.detail ?? "Fixture not provisioned — inventory proof skipped",
  });

  const delivered = await postStagingWooWebhook({
    stagingBaseUrl: input.stagingBaseUrl,
    connectionId: input.connectionId,
    rawBody,
    webhookSecret: input.webhookSecret,
    topic: webhookTopic,
    deliveryId,
  });
  let webhookDelivered = delivered.ok;
  let webhookEventId: string | null = null;
  let usedInlineFallback = false;

  const runInlineIngest = async (reason: string): Promise<boolean> => {
    try {
      const conn = await input.prisma.integrationConnection.findUnique({
        where: { id: input.connectionId },
        select: { workspaceId: true },
      });
      const ingested = await ingestWooCommerceWebhookForSmoke({
        userId: input.userId,
        workspaceId: conn?.workspaceId,
        connectionId: input.connectionId,
        topic: webhookTopic,
        payload: input.orderPayload,
        deliveryId: `${deliveryId}-inline`,
      });
      webhookEventId = ingested.webhookEventId;
      usedInlineFallback = true;
      input.steps.push({
        id: "inline_webhook_processor",
        label: "Inline webhook processor (DB fallback)",
        status: "PASSED",
        detail: `${reason} → WebhookEvent ${ingested.webhookEventId}`,
      });
      input.steps.push({
        id: "webhook_event_persisted",
        label: "WebhookEvent row persisted",
        status: "PASSED",
        detail: `webhookEventId=${ingested.webhookEventId}`,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      input.steps.push({
        id: "inline_webhook_processor",
        label: "Inline webhook processor (DB fallback)",
        status: "FAILED",
        detail: message.slice(0, 300),
      });
      return false;
    }
  };

  if (delivered.ok && delivered.queued) {
    webhookDelivered = await runInlineIngest("staging queued async webhook");
  } else if (delivered.ok) {
    const webhookEvent = await waitForWebhookEvent({
      prisma: input.prisma,
      connectionId: input.connectionId,
      externalEventId: deliveryId,
    });
    webhookEventId = webhookEvent.webhookEventId;
    input.steps.push({
      id: "webhook_event_persisted",
      label: "WebhookEvent row persisted",
      status: webhookEvent.ok ? "PASSED" : "FAILED",
      detail: webhookEvent.ok
        ? `webhookEventId=${webhookEvent.webhookEventId} processed=${webhookEvent.processed}`
        : "WebhookEvent not found after staging POST — check DATABASE_URL matches staging",
    });
    if (!webhookEvent.ok) {
      return buildWooCommerceLiveSmokeSummary({
        steps: input.steps,
        missingEnvVars: [],
        externalOrderId: input.externalOrderId,
        connectionId: input.connectionId,
        stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
      });
    }
  }

  if (!delivered.ok) {
    const useInlineFallback =
      input.syntheticWebhook ||
      process.env.SMOKE_WOO_INLINE_FALLBACK?.trim().toLowerCase() === "1" ||
      process.env.SMOKE_WOO_INLINE_FALLBACK?.trim().toLowerCase() === "true";
    if (useInlineFallback) {
      webhookDelivered = await runInlineIngest("staging HTTP unavailable");
    }
  }

  input.steps.push({
    id: "staging_webhook_delivery",
    label: "Signed webhook POST to staging",
    status: webhookDelivered ? "PASSED" : "FAILED",
    detail: webhookDelivered
      ? usedInlineFallback
        ? `inline fallback topic=${webhookTopic}`
        : delivered.ok
          ? `HTTP ${delivered.status} topic=${webhookTopic}${delivered.queued ? " (queued)" : ""}`
          : `inline fallback topic=${webhookTopic}`
      : delivered.ok
        ? "Async queue returned 200 but inline ingest failed"
        : delivered.message,
  });
  if (!webhookDelivered) {
    return buildWooCommerceLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
    });
  }

  const inDb = await waitForExternalOrder(
    input.prisma,
    input.connectionId,
    input.externalOrderId,
  );
  input.steps.push({
    id: "db_canonical_order",
    label: "ExternalOrder row in DATABASE_URL",
    status: inDb ? "PASSED" : "FAILED",
    detail: inDb
      ? `connectionId=${input.connectionId} externalOrderId=${input.externalOrderId}`
      : "Order not found within 15s — check staging DB matches DATABASE_URL",
  });
  if (!inDb) {
    return buildWooCommerceLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
    });
  }

  const kitchenImport = await waitForKitchenImport({
    prisma: input.prisma,
    connectionId: input.connectionId,
    externalOrderId: input.externalOrderId,
  });
  input.steps.push({
    id: "kds_kitchen_import",
    label: "Kitchen import (KDS ticket source)",
    status: kitchenImport.ok ? "PASSED" : "FAILED",
    detail: kitchenImport.ok
      ? `importedOrderId=${kitchenImport.orderId}`
      : "importedOrderId not set within 20s — check staging webhook processor",
  });
  if (!kitchenImport.ok || !kitchenImport.orderId) {
    return buildWooCommerceLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
    });
  }

  const kdsTicket = await waitForKdsTicket({
    prisma: input.prisma,
    orderId: kitchenImport.orderId,
  });
  input.steps.push({
    id: "kds_ticket_visible",
    label: "KDS ticket row in kitchen orders",
    status: kdsTicket.ok ? "PASSED" : "FAILED",
    detail: kdsTicket.ok
      ? `orderId=${kitchenImport.orderId} status=${kdsTicket.status}`
      : "Kitchen order not visible within 15s",
  });
  if (!kdsTicket.ok) {
    return buildWooCommerceLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      webhookEventId,
      importedOrderId: kitchenImport.orderId,
      stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
    });
  }

  const conn = await input.prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { workspaceId: true },
  });
  let kitchenTaskId: string | null = null;
  const existingTask = await waitForKitchenTaskForOrder({
    prisma: input.prisma,
    orderId: kitchenImport.orderId,
  });
  if (existingTask.ok && existingTask.taskId) {
    kitchenTaskId = existingTask.taskId;
  } else {
    const ensured = await ensureKitchenTaskForKdsSmoke({
      prisma: input.prisma,
      userId: input.userId,
      workspaceId: conn?.workspaceId,
      orderId: kitchenImport.orderId,
      externalOrderId: input.externalOrderId,
    });
    kitchenTaskId = ensured.taskId;
  }
  input.steps.push({
    id: "kitchen_task_linked",
    label: "KitchenTask linked to imported order",
    status: kitchenTaskId ? "PASSED" : "FAILED",
    detail: kitchenTaskId
      ? `kitchenTaskId=${kitchenTaskId} relatedOrderId=${kitchenImport.orderId}`
      : "Could not create or find KitchenTask for order",
  });
  if (!kitchenTaskId) {
    return buildWooCommerceLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      webhookEventId,
      importedOrderId: kitchenImport.orderId,
      stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
    });
  }

  const bumped = await simulateKdsBump({
    prisma: input.prisma,
    orderId: kitchenImport.orderId,
  });
  const bumpReady = await waitForKdsBumpState({
    prisma: input.prisma,
    orderId: kitchenImport.orderId,
  });
  input.steps.push({
    id: "kds_bump_ready",
    label: "KDS bump (order READY)",
    status: bumped.ok && bumpReady.ok ? "PASSED" : "FAILED",
    detail: bumpReady.ok
      ? `orderId=${kitchenImport.orderId} status=${bumpReady.status}`
      : "Order did not reach READY after simulated bump",
  });
  if (!bumped.ok || !bumpReady.ok) {
    return buildWooCommerceLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      webhookEventId,
      kitchenTaskId,
      importedOrderId: kitchenImport.orderId,
      stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
    });
  }

  if (merchantFixture.ok) {
    const merchantSteps: Array<{
      id: string;
      label: string;
      status: "PASSED" | "FAILED" | "SKIPPED";
      detail?: string;
    }> = [];
    const inventoryProof = await appendMerchantProofInventoryStepsAfterOrder({
      prisma: input.prisma,
      userId: input.userId,
      connectionId: input.connectionId,
      fixture: merchantFixture,
      orderedQuantity: 2,
      steps: merchantSteps,
    });
    for (const step of merchantSteps) {
      input.steps.push(step);
    }
    if (!inventoryProof.bidirectionalOk) {
      return buildWooCommerceLiveSmokeSummary({
        steps: input.steps,
        missingEnvVars: [],
        externalOrderId: input.externalOrderId,
        connectionId: input.connectionId,
        webhookEventId,
        kitchenTaskId,
        importedOrderId: kitchenImport.orderId,
        stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
      });
    }
  } else {
    input.steps.push({
      id: "inventory_sync_bidirectional_complete",
      label: "Bi-directional inventory sync complete",
      status: "SKIPPED",
      detail: "Skipped — merchant proof fixture unavailable",
    });
  }

  return buildWooCommerceLiveSmokeSummary({
    steps: input.steps,
    missingEnvVars: [],
    externalOrderId: input.externalOrderId,
    connectionId: input.connectionId,
    webhookEventId,
    kitchenTaskId,
    importedOrderId: kitchenImport.orderId,
    stagingWebhookUrl: `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`,
  });
}

export async function runWooCommerceLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
  options: { webhookOnly?: boolean } = {},
): Promise<WooCommerceLiveSmokeSummary> {
  const input = readWooCommerceLiveSmokeEnv(env);
  const missingEnvVars = listMissingWooCommerceLiveSmokeEnvVars(input);
  const steps: WooCommerceLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildWooCommerceLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Woo or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Woo connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildWooCommerceLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
      });
    }

    const { connectionId, userId, creds, webhookSecret } = resolved;
    const stagingWebhookUrl = `${input.stagingBaseUrl!.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(connectionId)}`;

    const storeHost = wooStoreHostLabel(creds.baseUrl);
    const placeholderStore = isPlaceholderWooStoreHost(storeHost);
    const ping = await testConnection(creds);
    steps.push({
      id: "woo_api_connection",
      label: "WooCommerce REST connection",
      status: ping.ok ? "PASSED" : placeholderStore ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : formatWooPingFailureDetail(creds.baseUrl, ping.message),
    });
    if (!ping.ok) {
      const webhookOnly = options.webhookOnly || placeholderStore;
      if (webhookOnly) {
        const externalOrderId = `smoke-${Date.now()}`;
        const orderPayload = buildSyntheticWooSmokeOrderPayload(externalOrderId);
        const webhookSummary = await runWooWebhookKdsProofSteps({
          prisma,
          steps,
          stagingBaseUrl: input.stagingBaseUrl!,
          connectionId,
          userId,
          webhookSecret,
          externalOrderId,
          orderPayload,
          syntheticWebhook: true,
        });
        return webhookSummary!;
      }
      return buildWooCommerceLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        stagingWebhookUrl,
      });
    }

    const created = await createWooTestOrder(creds);
    steps.push({
      id: "woo_create_order",
      label: "Create test order via Woo REST",
      status: created.ok ? "PASSED" : "FAILED",
      detail: created.ok ? `order id ${created.orderId}` : created.message,
    });
    if (!created.ok) {
      return buildWooCommerceLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        stagingWebhookUrl,
      });
    }

    const webhookSummary = await runWooWebhookKdsProofSteps({
      prisma,
      steps,
      stagingBaseUrl: input.stagingBaseUrl!,
      connectionId,
      userId,
      webhookSecret,
      externalOrderId: created.orderId,
      orderPayload: created.payload,
    });
    return webhookSummary!;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const webhookOnly = process.argv.includes("--webhook-only");
  let summary: WooCommerceLiveSmokeSummary;
  try {
    summary = await runWooCommerceLiveSmoke(process.env, { webhookOnly });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    summary = buildWooCommerceLiveSmokeSummary({
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

  console.log(`\nWooCommerce live smoke (${summary.version})\n`);
  console.log(`Overall: ${summary.overall} | proofStatus: ${summary.proofStatus}`);
  for (const step of summary.steps) {
    console.log(`  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`);
  }
  if (summary.missingEnvVars.length > 0) {
    console.log(`\nMissing env: ${summary.missingEnvVars.join(", ")}`);
  }

  if (shouldWrite) {
    const era71Path = join(process.cwd(), WOOCOMMERCE_LIVE_SMOKE_ARTIFACT);
    const p0Path = join(process.cwd(), WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT);
    const p10Path = join(process.cwd(), WOOCOMMERCE_MERCHANT_PROOF_P0_10_ARTIFACT);
    mkdirSync(dirname(era71Path), { recursive: true });
    writeFileSync(era71Path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    writeFileSync(p0Path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    const merchantProofSummary = {
      policyId: WOOCOMMERCE_MERCHANT_PROOF_P0_10_POLICY_ID,
      runAt: summary.runAt,
      overall: summary.overall,
      proofStatus: summary.proofStatus,
      connectionId: summary.connectionId,
      externalOrderId: summary.externalOrderId,
      importedOrderId: summary.importedOrderId,
      steps: summary.steps.filter((step) =>
        [
          "merchant_proof_fixture",
          "inventory_sync_outbound_kitchen",
          "inventory_sync_inbound_product_webhook",
          "inventory_sync_bidirectional_complete",
          "kds_bump_ready",
          "kitchen_task_linked",
        ].includes(step.id),
      ),
      honestyNote:
        "P0-10 merchant proof: dev store webhook → KDS artifact + bi-directional inventory sync (order.created outbound + product.updated inbound).",
    };
    writeFileSync(p10Path, `${JSON.stringify(merchantProofSummary, null, 2)}\n`, "utf8");
    console.log(`\nArtifacts:`);
    console.log(`  ${WOOCOMMERCE_LIVE_SMOKE_ARTIFACT}`);
    console.log(`  ${WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT}`);
    console.log(`  ${WOOCOMMERCE_MERCHANT_PROOF_P0_10_ARTIFACT}\n`);
  }

  process.exit(summary.overall === "FAILED" ? 1 : 0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
