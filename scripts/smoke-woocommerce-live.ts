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
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  getWebhookSecret,
  getWooCommerceCredentials,
} from "@/lib/integrations/decrypt-connection";
import {
  testConnection,
  verifyWebhookSignature,
  type WooCredentials,
} from "@/services/integrations/woocommerce";

export const WOOCOMMERCE_LIVE_SMOKE_ARTIFACT =
  "artifacts/woocommerce-live-smoke-summary.json" as const;

export const WOOCOMMERCE_LIVE_SMOKE_VERSION = "woocommerce-live-smoke-v1" as const;

export type WooCommerceLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type WooCommerceLiveSmokeStep = {
  id: string;
  label: string;
  status: WooCommerceLiveSmokeStepStatus;
  detail?: string;
};

export type WooCommerceLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_failed";

export type WooCommerceLiveSmokeSummary = {
  version: typeof WOOCOMMERCE_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: WooCommerceLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: WooCommerceLiveSmokeStep[];
  externalOrderId: string | null;
  connectionId: string | null;
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

function signWooWebhookBody(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

async function postStagingWooWebhook(input: {
  stagingBaseUrl: string;
  connectionId: string;
  rawBody: string;
  webhookSecret: string;
}): Promise<{ ok: true; status: number } | { ok: false; message: string }> {
  const url = `${input.stagingBaseUrl.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(input.connectionId)}`;
  const signature = signWooWebhookBody(input.rawBody, input.webhookSecret);

  if (!verifyWebhookSignature(input.rawBody, signature, input.webhookSecret)) {
    return { ok: false, message: "Local signature self-check failed" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WC-Webhook-Topic": "order.updated",
      "X-WC-Webhook-Delivery-Id": `smoke-${Date.now()}`,
      "X-WC-Webhook-Signature": signature,
    },
    body: input.rawBody,
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, message: `Staging webhook ${res.status}: ${text.slice(0, 300)}` };
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

export function buildWooCommerceLiveSmokeSummary(input: {
  steps: WooCommerceLiveSmokeStep[];
  missingEnvVars: string[];
  externalOrderId?: string | null;
  connectionId?: string | null;
  stagingWebhookUrl?: string | null;
}): WooCommerceLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 ||
    input.steps.every((s) => s.status === "SKIPPED");

  let overall: WooCommerceLiveSmokeSummary["overall"];
  let proofStatus: WooCommerceLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
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
    version: WOOCOMMERCE_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    externalOrderId: input.externalOrderId ?? null,
    connectionId: input.connectionId ?? null,
    stagingWebhookUrl: input.stagingWebhookUrl ?? null,
    honestyNote:
      "PASS requires live Woo REST + staging webhook ingest + ExternalOrder row — not wiring cert alone.",
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: WooCommerceLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
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
    return {
      connectionId: input.connectionId,
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

  return { connectionId: conn.id, creds, webhookSecret };
}

export async function runWooCommerceLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
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

    const { connectionId, creds, webhookSecret } = resolved;
    const stagingWebhookUrl = `${input.stagingBaseUrl!.replace(/\/+$/, "")}/api/webhooks/woocommerce?cid=${encodeURIComponent(connectionId)}`;

    const ping = await testConnection(creds);
    steps.push({
      id: "woo_api_connection",
      label: "WooCommerce REST connection",
      status: ping.ok ? "PASSED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : formatWooPingFailureDetail(creds.baseUrl, ping.message),
    });
    if (!ping.ok) {
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

    const rawBody = JSON.stringify(created.payload);
    const delivered = await postStagingWooWebhook({
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
      return buildWooCommerceLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        externalOrderId: created.orderId,
        connectionId,
        stagingWebhookUrl,
      });
    }

    const inDb = await waitForExternalOrder(prisma, connectionId, created.orderId);
    steps.push({
      id: "db_canonical_order",
      label: "ExternalOrder row in DATABASE_URL",
      status: inDb ? "PASSED" : "FAILED",
      detail: inDb
        ? `connectionId=${connectionId} externalOrderId=${created.orderId}`
        : "Order not found within 15s — check staging DB matches DATABASE_URL",
    });

    return buildWooCommerceLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      externalOrderId: created.orderId,
      connectionId,
      stagingWebhookUrl,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  let summary: WooCommerceLiveSmokeSummary;
  try {
    summary = await runWooCommerceLiveSmoke();
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
    const path = join(process.cwd(), WOOCOMMERCE_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`\nArtifact: ${WOOCOMMERCE_LIVE_SMOKE_ARTIFACT}\n`);
  }

  process.exit(summary.overall === "FAILED" ? 1 : 0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
