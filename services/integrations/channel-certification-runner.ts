import { createHmac } from "crypto";

import type { IntegrationConnection, IntegrationProvider } from "@prisma/client";

import { isEncryptionConfigured } from "@/lib/crypto";
import {
  getShopifyCredentials,
  getWebhookSecret,
  getWooCommerceCredentials,
} from "@/lib/integrations/decrypt-connection";
import type {
  CertificationCheckResult,
  CertificationCheckStatus,
  CertificationOverall,
  ConnectionCertificationRecord,
} from "@/lib/integrations/channel-certification-types";
import { checklistForProvider } from "@/lib/integrations/channel-certification-types";
import { isWebhookAsyncQueueEnabled } from "@/lib/webhooks/webhook-queue-mode";
import { prisma } from "@/lib/prisma";
import { testConnection as testShopify } from "@/services/integrations/shopify";
import { verifyShopifyHmac } from "@/services/integrations/shopify";
import {
  testConnection as testWoo,
  verifyWebhookSignature,
} from "@/services/integrations/woocommerce";

export type RunCertificationOptions = {
  /** Skip live REST calls (CI / offline). */
  skipLiveApi?: boolean;
};

function check(
  id: CertificationCheckResult["id"],
  label: string,
  status: CertificationCheckStatus,
  message: string,
): CertificationCheckResult {
  return { id, label, status, message };
}

function overallFrom(checks: CertificationCheckResult[]): CertificationOverall {
  const required = checks.filter((c) => c.status !== "skip");
  if (required.some((c) => c.status === "fail")) return "FAIL";
  if (required.some((c) => c.status === "warn")) return "PARTIAL";
  return "PASS";
}

export async function runChannelCertification(
  conn: IntegrationConnection,
  options: RunCertificationOptions = {},
): Promise<ConnectionCertificationRecord> {
  const provider = conn.provider;
  const checklist = checklistForProvider(provider);
  const results: CertificationCheckResult[] = [];
  const labelById = new Map(checklist.map((c) => [c.id, c.label]));

  const push = (
    id: CertificationCheckResult["id"],
    status: CertificationCheckStatus,
    message: string,
  ) => {
    results.push(check(id, labelById.get(id) ?? id, status, message));
  };

  push(
    "encryption_configured",
    isEncryptionConfigured() ? "pass" : "fail",
    isEncryptionConfigured()
      ? "ENCRYPTION_KEY is set — credentials can be stored safely."
      : "Set ENCRYPTION_KEY before saving API secrets.",
  );

  if (provider === "WOOCOMMERCE") {
    const creds = getWooCommerceCredentials(conn);
    push(
      "credentials_present",
      creds ? "pass" : "fail",
      creds ? "Consumer key and secret are stored." : "Save store URL and REST keys.",
    );
    const wh = getWebhookSecret(conn);
    push(
      "webhook_secret_present",
      wh ? "pass" : "fail",
      wh ? "Webhook signing secret is stored." : "Add the WooCommerce webhook secret.",
    );

    if (!options.skipLiveApi && creds) {
      const live = await testWoo(creds);
      push(
        "rest_api_reachable",
        live.ok ? "pass" : "fail",
        live.message,
      );
    } else if (options.skipLiveApi) {
      push("rest_api_reachable", "skip", "Skipped live REST test (--skip-live).");
    } else {
      push("rest_api_reachable", "fail", "Complete credentials before REST test.");
    }

    const body = JSON.stringify({ id: 1 });
    const sig = wh
      ? createHmac("sha256", wh).update(body, "utf8").digest("base64")
      : "";
    push(
      "webhook_hmac_algorithm",
      wh && verifyWebhookSignature(body, sig, wh) ? "pass" : "fail",
      wh
        ? "HMAC-SHA256 base64 verification matches WooCommerce."
        : "Cannot verify without webhook secret.",
    );
  }

  if (provider === "SHOPIFY") {
    const creds = getShopifyCredentials(conn);
    push(
      "credentials_present",
      creds ? "pass" : "fail",
      creds ? "Admin API token is stored." : "Save shop domain and Admin API token.",
    );
    const wh = getWebhookSecret(conn);
    push(
      "webhook_secret_present",
      wh ? "pass" : "fail",
      wh ? "Webhook signing secret is stored." : "Add Shopify webhook signing secret.",
    );
    push(
      "shop_domain_routing",
      conn.shopDomain?.includes(".myshopify.com") ? "pass" : "warn",
      conn.shopDomain
        ? `Routing uses shop domain ${conn.shopDomain}.`
        : "Set *.myshopify.com domain for webhook routing.",
    );

    if (!options.skipLiveApi && creds) {
      const live = await testShopify(creds);
      push(
        "rest_api_reachable",
        live.ok ? "pass" : "fail",
        live.message,
      );
    } else if (options.skipLiveApi) {
      push("rest_api_reachable", "skip", "Skipped live REST test (--skip-live).");
    } else {
      push("rest_api_reachable", "fail", "Complete credentials before REST test.");
    }

    const body = JSON.stringify({ id: 1 });
    const hmac = wh
      ? createHmac("sha256", wh).update(body, "utf8").digest("base64")
      : "";
    push(
      "webhook_hmac_algorithm",
      wh && verifyShopifyHmac(body, hmac, wh) ? "pass" : "fail",
      wh
        ? "HMAC-SHA256 base64 verification matches Shopify."
        : "Cannot verify without webhook secret.",
    );
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [validCount, invalidCount, recentExternalIds] = await Promise.all([
    prisma.webhookEvent.count({
      where: {
        connectionId: conn.id,
        signatureValid: true,
        receivedAt: { gte: since },
      },
    }),
    prisma.webhookEvent.count({
      where: {
        connectionId: conn.id,
        signatureValid: false,
        receivedAt: { gte: since },
      },
    }),
    prisma.webhookEvent.findMany({
      where: {
        connectionId: conn.id,
        externalEventId: { not: null },
        receivedAt: { gte: since },
      },
      select: { externalEventId: true },
      take: 500,
    }),
  ]);

  const seenIds = new Set<string>();
  let duplicateExternalIds = 0;
  for (const row of recentExternalIds) {
    const id = row.externalEventId;
    if (!id) continue;
    if (seenIds.has(id)) duplicateExternalIds += 1;
    seenIds.add(id);
  }

  push(
    "recent_valid_webhooks",
    validCount > 0 ? "pass" : "warn",
    validCount > 0
      ? `${validCount} valid webhook(s) in the last 7 days.`
      : "No valid webhooks yet — place a test order on the test shop.",
  );

  push(
    "idempotency_index",
    duplicateExternalIds === 0 ? "pass" : "warn",
    duplicateExternalIds === 0
      ? "No duplicate external event ids observed (7d window)."
      : `${duplicateExternalIds} duplicate delivery id(s) in log — ingest returns duplicate:true without double-processing.`,
  );

  const asyncOn = isWebhookAsyncQueueEnabled();
  push(
    "async_queue_recommended",
    asyncOn ? "pass" : "warn",
    asyncOn
      ? "WEBHOOK_ASYNC_QUEUE is enabled."
      : "For 50+ webhooks/min enable WEBHOOK_ASYNC_QUEUE and cron webhook-jobs.",
  );

  push(
    "invalid_signature_isolated",
    invalidCount === 0 || validCount > 0 ? "pass" : "warn",
    invalidCount === 0
      ? "No invalid-signature events in the last 7 days."
      : `${invalidCount} invalid signature event(s) logged and not treated as verified.`,
  );

  const overall = overallFrom(results);
  const productStatus: ConnectionCertificationRecord["productStatus"] = "BETA";

  return {
    provider: provider === "WOOCOMMERCE" ? "woocommerce" : "shopify",
    lastRunAt: new Date().toISOString(),
    overall,
    checks: results,
    productStatus,
  };
}

export async function persistCertificationRecord(
  connectionId: string,
  record: ConnectionCertificationRecord,
  existingSettings: unknown,
): Promise<void> {
  const base =
    existingSettings && typeof existingSettings === "object"
      ? { ...(existingSettings as Record<string, unknown>) }
      : {};
  const prior = base.certification as ConnectionCertificationRecord | undefined;

  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      settingsJson: {
        ...base,
        certification: {
          ...record,
          signOff: prior?.signOff ?? record.signOff,
        },
      },
    },
  });
}
