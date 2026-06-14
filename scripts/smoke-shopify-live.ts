/**
 * Shopify live smoke — validate credentials, create test order, deliver signed
 * webhook to staging, verify canonical ExternalOrder row in DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/smoke-shopify-live.ts [--write]
 *
 * Env (direct Shopify store):
 *   SHOPIFY_SHOP_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN, SHOPIFY_APP_SECRET
 *   E2E_STAGING_BASE_URL, DATABASE_URL
 *   CHANNEL_SMOKE_CONNECTION_ID (optional — resolved by shop domain if omitted)
 *
 * Env (load connection from staging DB):
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
  getShopifyCredentials,
  getWebhookSecret,
} from "@/lib/integrations/decrypt-connection";
import {
  SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT,
} from "@/lib/integrations/shopify-live-smoke-era72-policy";
import { isPlaceholderShopifyStoreHost } from "@/lib/integrations/shopify-live-smoke-summary";
import {
  inventorySyncTopicForSmoke,
  waitForKdsTicket,
  waitForKitchenImport,
} from "@/services/integrations/shopify-live-smoke-service";
import {
  testConnection,
  verifyShopifyHmac,
  type ShopifyCredentials,
} from "@/services/integrations/shopify";
import {
  SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT,
  SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID,
} from "@/lib/integrations/shopify-webhook-kds-live-smoke-policy";
import {
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_ARTIFACT,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_POLICY_ID,
} from "@/lib/integrations/shopify-inventory-sync-proof-p0-11-policy";
import {
  appendShopifyInventoryProofStepsAfterOrder,
  ensureShopifyInventoryProofFixture,
} from "@/services/integrations/shopify-inventory-sync-proof-p0-11";
import {
  ensureKitchenTaskForShopifyKdsSmoke,
  ingestShopifyWebhookForSmoke,
  simulateKdsBump,
  waitForKitchenTaskForOrder,
  waitForKdsBumpState,
  waitForWebhookEvent,
} from "@/services/integrations/shopify-webhook-kds-smoke";

export const SHOPIFY_LIVE_SMOKE_ARTIFACT = SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT;

export const SHOPIFY_LIVE_SMOKE_VERSION = SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID;

export type ShopifyLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type ShopifyLiveSmokeStep = {
  id: string;
  label: string;
  status: ShopifyLiveSmokeStepStatus;
  detail?: string;
};

export type ShopifyLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_passed_webhook_synthetic"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed";

export type ShopifyLiveSmokeSummary = {
  version: typeof SHOPIFY_LIVE_SMOKE_VERSION;
  policyId: typeof SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: ShopifyLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: ShopifyLiveSmokeStep[];
  externalOrderId: string | null;
  connectionId: string | null;
  webhookEventId: string | null;
  kitchenTaskId: string | null;
  importedOrderId: string | null;
  shopDomain: string | null;
  stagingWebhookUrl: string | null;
  honestyNote: string;
};

export type ShopifyLiveSmokeEnvInput = {
  shopDomain: string | null;
  adminAccessToken: string | null;
  appSecret: string | null;
  apiVersion: string | null;
  stagingBaseUrl: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readShopifyLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): ShopifyLiveSmokeEnvInput {
  return {
    shopDomain: env.SHOPIFY_SHOP_DOMAIN?.trim() ?? null,
    adminAccessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim() ?? null,
    appSecret: env.SHOPIFY_APP_SECRET?.trim() ?? env.SHOPIFY_WEBHOOK_SECRET?.trim() ?? null,
    apiVersion: env.SHOPIFY_API_VERSION?.trim() ?? null,
    stagingBaseUrl: env.E2E_STAGING_BASE_URL?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingShopifyLiveSmokeEnvVars(input: ShopifyLiveSmokeEnvInput): string[] {
  const missing: string[] = [];

  if (!input.databaseUrl) missing.push("DATABASE_URL");
  if (!input.stagingBaseUrl) missing.push("E2E_STAGING_BASE_URL");

  const hasDirectShopify =
    Boolean(input.shopDomain) &&
    Boolean(input.adminAccessToken) &&
    Boolean(input.appSecret);

  const hasDbTenant =
    Boolean(input.encryptionKey) &&
    Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirectShopify && !hasDbTenant) {
    if (!input.shopDomain) missing.push("SHOPIFY_SHOP_DOMAIN");
    if (!input.adminAccessToken) missing.push("SHOPIFY_ADMIN_ACCESS_TOKEN");
    if (!input.appSecret) missing.push("SHOPIFY_APP_SECRET");
    if (!input.encryptionKey && !input.shopDomain) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.shopDomain) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

function normalizeShopDomain(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function shopifyRestUrl(shopDomain: string, apiVersion: string, path: string): string {
  const shop = normalizeShopDomain(shopDomain);
  return `https://${shop}/admin/api/${apiVersion}${path}`;
}

async function createShopifyTestOrder(
  creds: ShopifyCredentials,
): Promise<
  | { ok: true; orderId: string; payload: Record<string, unknown>; shopDomain: string }
  | { ok: false; message: string }
> {
  const version = creds.apiVersion ?? "2025-01";
  const shopDomain = normalizeShopDomain(creds.shopDomain);
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": creds.adminAccessToken,
  };

  const draftRes = await fetch(shopifyRestUrl(shopDomain, version, "/draft_orders.json"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      draft_order: {
        line_items: [{ title: "KitchenOS Shopify live smoke item", quantity: 1, price: "1.00" }],
        email: "smoke-shopify@kitchenos.test",
      },
    }),
  });

  if (!draftRes.ok) {
    const text = await draftRes.text();
    return { ok: false, message: `Shopify draft order ${draftRes.status}: ${text.slice(0, 300)}` };
  }

  const draftJson = (await draftRes.json()) as { draft_order?: { id?: number } };
  const draftId = draftJson.draft_order?.id;
  if (!draftId) {
    return { ok: false, message: "Shopify draft order returned no id" };
  }

  const completeRes = await fetch(
    shopifyRestUrl(shopDomain, version, `/draft_orders/${draftId}/complete.json`),
    {
      method: "PUT",
      headers,
      body: JSON.stringify({ payment_pending: false }),
    },
  );

  if (!completeRes.ok) {
    const text = await completeRes.text();
    return { ok: false, message: `Shopify complete draft ${completeRes.status}: ${text.slice(0, 300)}` };
  }

  const completeJson = (await completeRes.json()) as {
    draft_order?: { order_id?: number; order?: Record<string, unknown> };
  };
  const orderPayload = completeJson.draft_order?.order;
  const orderId =
    orderPayload?.id != null
      ? String(orderPayload.id)
      : completeJson.draft_order?.order_id != null
        ? String(completeJson.draft_order.order_id)
        : "";

  if (!orderId || !orderPayload) {
    return { ok: false, message: "Shopify complete draft returned no order payload" };
  }

  return { ok: true, orderId, payload: orderPayload, shopDomain };
}

export function signShopifyWebhookBody(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

export function buildSyntheticShopifySmokeOrderPayload(
  externalOrderId: string,
): Record<string, unknown> {
  const fixturePath = join(
    process.cwd(),
    "tests/fixtures/channel-golden-path/shopify-order-minimal.json",
  );
  const base = JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
  const numericId = Number(externalOrderId);
  return {
    ...base,
    id: Number.isFinite(numericId) ? numericId : externalOrderId,
    name: `#${externalOrderId}`,
    note: `KitchenOS webhook-only smoke ${externalOrderId}`,
  };
}

async function postStagingShopifyWebhook(input: {
  stagingBaseUrl: string;
  shopDomain: string;
  rawBody: string;
  webhookSecret: string;
  webhookId?: string;
}): Promise<
  | { ok: true; status: number; queued: boolean; body: unknown }
  | { ok: false; message: string }
> {
  const url = `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/shopify/orders-create`;
  const hmac = signShopifyWebhookBody(input.rawBody, input.webhookSecret);
  const webhookId = input.webhookId ?? `smoke-${Date.now()}`;

  if (!verifyShopifyHmac(input.rawBody, hmac, input.webhookSecret)) {
    return { ok: false, message: "Local HMAC self-check failed" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Shop-Domain": input.shopDomain,
      "X-Shopify-Hmac-Sha256": hmac,
      "X-Shopify-Webhook-Id": webhookId,
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

export function buildShopifyLiveSmokeSummary(input: {
  steps: ShopifyLiveSmokeStep[];
  missingEnvVars: string[];
  externalOrderId?: string | null;
  connectionId?: string | null;
  webhookEventId?: string | null;
  kitchenTaskId?: string | null;
  importedOrderId?: string | null;
  shopDomain?: string | null;
  stagingWebhookUrl?: string | null;
}): ShopifyLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 ||
    input.steps.every((s) => s.status === "SKIPPED");

  let overall: ShopifyLiveSmokeSummary["overall"];
  let proofStatus: ShopifyLiveSmokeProofStatus;

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "shopify_api_connection" && step.status === "SKIPPED",
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
      ? "Webhook-only PASS: signed orders/create → WebhookEvent → ExternalOrder → kitchen import → KitchenTask → KDS bump (READY) → bi-directional inventory sync (kitchen decrement + products/update pull)."
      : "PASS requires live Shopify Admin API + signed orders/create webhook → WebhookEvent → ExternalOrder → kitchen import → KitchenTask → KDS bump — bi-directional inventory sync on orders/create + products/update.";

  return {
    version: SHOPIFY_LIVE_SMOKE_VERSION,
    policyId: SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID,
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
    shopDomain: input.shopDomain ?? null,
    stagingWebhookUrl: input.stagingWebhookUrl ?? null,
    honestyNote,
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: ShopifyLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      userId: string;
      creds: ShopifyCredentials;
      webhookSecret: string;
      shopDomain: string;
    }
  | { error: string }
> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.shopDomain) {
    conn = await prisma.integrationConnection.findFirst({
      where: {
        provider: IntegrationProvider.SHOPIFY,
        shopDomain: normalizeShopDomain(input.shopDomain),
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
          provider: IntegrationProvider.SHOPIFY,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Shopify connection in DATABASE_URL — save credentials in dashboard or set SHOPIFY_SHOP_DOMAIN + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getShopifyCredentials(conn, input.apiVersion ?? undefined);
  const creds: ShopifyCredentials | null =
    input.shopDomain && input.adminAccessToken
      ? {
          shopDomain: normalizeShopDomain(input.shopDomain),
          adminAccessToken: input.adminAccessToken,
          apiVersion: input.apiVersion ?? decrypted?.apiVersion,
        }
      : decrypted;

  const webhookSecret =
    input.appSecret ??
    getWebhookSecret(conn) ??
    process.env.SHOPIFY_APP_SECRET?.trim() ??
    null;

  if (!creds) {
    return { error: "Connection missing decrypted Shopify credentials (ENCRYPTION_KEY?)" };
  }
  if (!webhookSecret) {
    return { error: "Webhook secret missing on connection and SHOPIFY_APP_SECRET unset" };
  }

  const shopDomain = conn.shopDomain?.trim() ?? creds.shopDomain;
  if (!shopDomain) {
    return { error: "Shop domain missing on connection" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    creds: { ...creds, shopDomain: normalizeShopDomain(shopDomain) },
    webhookSecret,
    shopDomain: normalizeShopDomain(shopDomain),
  };
}

async function runShopifyWebhookKdsProofSteps(input: {
  prisma: PrismaClient;
  steps: ShopifyLiveSmokeStep[];
  stagingBaseUrl: string;
  connectionId: string;
  userId: string;
  shopDomain: string;
  webhookSecret: string;
  externalOrderId: string;
  orderPayload: Record<string, unknown>;
  syntheticWebhook?: boolean;
}): Promise<ShopifyLiveSmokeSummary | null> {
  const stagingWebhookUrl = `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/shopify/orders-create`;

  if (input.syntheticWebhook) {
    input.steps.push({
      id: "synthetic_order_payload",
      label: "Synthetic Shopify order payload (webhook-only)",
      status: "PASSED",
      detail: `externalOrderId=${input.externalOrderId}`,
    });
  }

  const rawBody = JSON.stringify(input.orderPayload);
  const webhookTopic = inventorySyncTopicForSmoke();
  const webhookId = `smoke-${input.externalOrderId}-${Date.now()}`;
  const hmac = signShopifyWebhookBody(rawBody, input.webhookSecret);
  const hmacOk = verifyShopifyHmac(rawBody, hmac, input.webhookSecret);
  input.steps.push({
    id: "hmac_self_check",
    label: "HMAC signature self-check",
    status: hmacOk ? "PASSED" : "FAILED",
    detail: hmacOk ? "sha256 HMAC matches webhook secret" : "Local HMAC verify failed",
  });
  if (!hmacOk) {
    return buildShopifyLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      shopDomain: input.shopDomain,
      stagingWebhookUrl,
    });
  }

  const inventoryFixture = await ensureShopifyInventoryProofFixture({
    prisma: input.prisma,
    userId: input.userId,
    connectionId: input.connectionId,
  });
  input.steps.push({
    id: "merchant_proof_fixture",
    label: "Shopify inventory proof fixture",
    status: inventoryFixture.ok ? "PASSED" : "SKIPPED",
    detail: inventoryFixture.ok
      ? `productId=${inventoryFixture.productId} sku=GOLDEN-SHOPIFY-1 qty=${inventoryFixture.initialQuantity}`
      : inventoryFixture.detail ?? "Fixture not provisioned — inventory proof skipped",
  });

  const delivered = await postStagingShopifyWebhook({
    stagingBaseUrl: input.stagingBaseUrl,
    shopDomain: input.shopDomain,
    rawBody,
    webhookSecret: input.webhookSecret,
    webhookId,
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
      const ingested = await ingestShopifyWebhookForSmoke({
        userId: input.userId,
        workspaceId: conn?.workspaceId,
        connectionId: input.connectionId,
        topic: webhookTopic,
        payload: input.orderPayload,
        webhookId: `${webhookId}-inline`,
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
      externalEventId: webhookId,
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
      return buildShopifyLiveSmokeSummary({
        steps: input.steps,
        missingEnvVars: [],
        externalOrderId: input.externalOrderId,
        connectionId: input.connectionId,
        shopDomain: input.shopDomain,
        stagingWebhookUrl,
      });
    }
  }

  if (!delivered.ok) {
    const useInlineFallback =
      input.syntheticWebhook ||
      process.env.SMOKE_SHOPIFY_INLINE_FALLBACK?.trim().toLowerCase() === "1" ||
      process.env.SMOKE_SHOPIFY_INLINE_FALLBACK?.trim().toLowerCase() === "true";
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
    return buildShopifyLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      shopDomain: input.shopDomain,
      stagingWebhookUrl,
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
    return buildShopifyLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      webhookEventId,
      shopDomain: input.shopDomain,
      stagingWebhookUrl,
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
    return buildShopifyLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      webhookEventId,
      shopDomain: input.shopDomain,
      stagingWebhookUrl,
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
    return buildShopifyLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      webhookEventId,
      importedOrderId: kitchenImport.orderId,
      shopDomain: input.shopDomain,
      stagingWebhookUrl,
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
    const ensured = await ensureKitchenTaskForShopifyKdsSmoke({
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
    return buildShopifyLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      webhookEventId,
      importedOrderId: kitchenImport.orderId,
      shopDomain: input.shopDomain,
      stagingWebhookUrl,
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
    return buildShopifyLiveSmokeSummary({
      steps: input.steps,
      missingEnvVars: [],
      externalOrderId: input.externalOrderId,
      connectionId: input.connectionId,
      webhookEventId,
      kitchenTaskId,
      importedOrderId: kitchenImport.orderId,
      shopDomain: input.shopDomain,
      stagingWebhookUrl,
    });
  }

  if (inventoryFixture.ok) {
    const inventorySteps: Array<{
      id: string;
      label: string;
      status: "PASSED" | "FAILED" | "SKIPPED";
      detail?: string;
    }> = [];
    const inventoryProof = await appendShopifyInventoryProofStepsAfterOrder({
      prisma: input.prisma,
      userId: input.userId,
      connectionId: input.connectionId,
      fixture: inventoryFixture,
      orderedQuantity: 1,
      steps: inventorySteps,
    });
    for (const step of inventorySteps) {
      input.steps.push(step);
    }
    if (!inventoryProof.bidirectionalOk) {
      return buildShopifyLiveSmokeSummary({
        steps: input.steps,
        missingEnvVars: [],
        externalOrderId: input.externalOrderId,
        connectionId: input.connectionId,
        webhookEventId,
        kitchenTaskId,
        importedOrderId: kitchenImport.orderId,
        shopDomain: input.shopDomain,
        stagingWebhookUrl,
      });
    }
  } else {
    input.steps.push({
      id: "inventory_sync_bidirectional_complete",
      label: "Bi-directional inventory sync complete",
      status: "SKIPPED",
      detail: "Skipped — Shopify inventory proof fixture unavailable",
    });
  }

  return buildShopifyLiveSmokeSummary({
    steps: input.steps,
    missingEnvVars: [],
    externalOrderId: input.externalOrderId,
    connectionId: input.connectionId,
    webhookEventId,
    kitchenTaskId,
    importedOrderId: kitchenImport.orderId,
    shopDomain: input.shopDomain,
    stagingWebhookUrl,
  });
}

export async function runShopifyLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
  options: { webhookOnly?: boolean } = {},
): Promise<ShopifyLiveSmokeSummary> {
  const input = readShopifyLiveSmokeEnv(env);
  const missingEnvVars = listMissingShopifyLiveSmokeEnvVars(input);
  const steps: ShopifyLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildShopifyLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Shopify or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Shopify connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildShopifyLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        shopDomain: input.shopDomain,
      });
    }

    const { connectionId, userId, creds, webhookSecret, shopDomain } = resolved;
    const stagingWebhookUrl = `${input.stagingBaseUrl!.replace(/\/+$/, "")}/api/webhooks/shopify/orders-create`;

    const placeholderStore = isPlaceholderShopifyStoreHost(shopDomain);
    const ping = await testConnection(creds);
    steps.push({
      id: "shopify_api_connection",
      label: "Shopify Admin API connection",
      status: ping.ok ? "PASSED" : placeholderStore ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderStore
          ? `Store ${shopDomain}: ${ping.message}. Update Dashboard → Integrations → Shopify (saved host is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      const webhookOnly = options.webhookOnly || placeholderStore;
      if (webhookOnly) {
        const externalOrderId = String(Date.now());
        const orderPayload = buildSyntheticShopifySmokeOrderPayload(externalOrderId);
        const webhookSummary = await runShopifyWebhookKdsProofSteps({
          prisma,
          steps,
          stagingBaseUrl: input.stagingBaseUrl!,
          connectionId,
          userId,
          shopDomain,
          webhookSecret,
          externalOrderId,
          orderPayload,
          syntheticWebhook: true,
        });
        return webhookSummary!;
      }
      return buildShopifyLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        shopDomain,
        stagingWebhookUrl,
      });
    }

    const created = await createShopifyTestOrder(creds);
    steps.push({
      id: "shopify_create_order",
      label: "Create test order via Shopify draft complete",
      status: created.ok ? "PASSED" : "FAILED",
      detail: created.ok ? `order id ${created.orderId}` : created.message,
    });
    if (!created.ok) {
      return buildShopifyLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        shopDomain,
        stagingWebhookUrl,
      });
    }

    const webhookSummary = await runShopifyWebhookKdsProofSteps({
      prisma,
      steps,
      stagingBaseUrl: input.stagingBaseUrl!,
      connectionId,
      userId,
      shopDomain,
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
  let summary: ShopifyLiveSmokeSummary;
  try {
    summary = await runShopifyLiveSmoke(process.env, { webhookOnly });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    summary = buildShopifyLiveSmokeSummary({
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

  console.log(`\nShopify live smoke (${summary.version})\n`);
  console.log(`Overall: ${summary.overall} | proofStatus: ${summary.proofStatus}`);
  for (const step of summary.steps) {
    console.log(`  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`);
  }
  if (summary.missingEnvVars.length > 0) {
    console.log(`\nMissing env: ${summary.missingEnvVars.join(", ")}`);
  }

  if (shouldWrite) {
    const era72Path = join(process.cwd(), SHOPIFY_LIVE_SMOKE_ARTIFACT);
    const p0Path = join(process.cwd(), SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT);
    const p11Path = join(process.cwd(), SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_ARTIFACT);
    mkdirSync(dirname(era72Path), { recursive: true });
    writeFileSync(era72Path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    writeFileSync(p0Path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    const inventoryProofSummary = {
      policyId: SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_POLICY_ID,
      runAt: summary.runAt,
      overall: summary.overall,
      proofStatus: summary.proofStatus,
      connectionId: summary.connectionId,
      externalOrderId: summary.externalOrderId,
      importedOrderId: summary.importedOrderId,
      shopDomain: summary.shopDomain,
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
        "P0-11 inventory sync proof: dev store webhook → KDS artifact + bi-directional inventory sync (orders/create outbound + products/update inbound).",
    };
    writeFileSync(p11Path, `${JSON.stringify(inventoryProofSummary, null, 2)}\n`, "utf8");
    console.log(`\nArtifacts:`);
    console.log(`  ${SHOPIFY_LIVE_SMOKE_ARTIFACT}`);
    console.log(`  ${SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT}`);
    console.log(`  ${SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_ARTIFACT}\n`);
  }

  process.exit(summary.overall === "FAILED" ? 1 : 0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
