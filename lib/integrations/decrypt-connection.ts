import type { IntegrationConnection } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";

import type { ShopifyCredentials } from "@/services/integrations/shopify";
import type { UberEatsCredentials } from "@/services/integrations/uber-eats";
import type { WooCredentials } from "@/services/integrations/woocommerce";

export function getWooCommerceCredentials(conn: IntegrationConnection): WooCredentials | null {
  const baseUrl = conn.baseUrl?.trim();
  const consumerKey = decryptOptional(conn.consumerKeyEncrypted);
  const consumerSecret = decryptOptional(conn.consumerSecretEncrypted);
  if (!baseUrl || !consumerKey || !consumerSecret) return null;
  return { baseUrl, consumerKey, consumerSecret };
}

export function getShopifyCredentials(
  conn: IntegrationConnection,
  apiVersion?: string,
): ShopifyCredentials | null {
  const shopDomain = conn.shopDomain?.trim();
  const adminAccessToken = decryptOptional(conn.accessTokenEncrypted);
  if (!shopDomain || !adminAccessToken) return null;
  return {
    shopDomain,
    adminAccessToken,
    apiVersion: apiVersion ?? (conn.settingsJson as { apiVersion?: string } | null)?.apiVersion,
  };
}

export function getUberEatsCredentials(conn: IntegrationConnection): UberEatsCredentials | null {
  const clientId = decryptOptional(conn.consumerKeyEncrypted);
  const clientSecret = decryptOptional(conn.consumerSecretEncrypted);
  const storeId = conn.externalStoreId?.trim() ?? null;
  if (!clientId || !clientSecret || !storeId) return null;
  return { clientId, clientSecret, storeId };
}

export function getWebhookSecret(conn: IntegrationConnection): string | null {
  return decryptOptional(conn.webhookSecretEncrypted);
}

export function getDoorDashApiCredentials(
  conn: IntegrationConnection,
): { apiKey: string; merchantId: string } | null {
  const settings = conn.settingsJson as { liveOAuth?: { accessTokenEnc?: string } } | null;
  const oauthToken = settings?.liveOAuth?.accessTokenEnc
    ? decryptOptional(settings.liveOAuth.accessTokenEnc)
    : null;
  const apiKey = oauthToken ?? decryptOptional(conn.consumerKeyEncrypted);
  const merchantId = conn.externalStoreId?.trim() ?? null;
  if (!apiKey || !merchantId) return null;
  return { apiKey, merchantId };
}

export function getGrubhubApiCredentials(
  conn: IntegrationConnection,
): { apiKey: string; merchantId: string } | null {
  const settings = conn.settingsJson as { liveOAuth?: { accessTokenEnc?: string } } | null;
  const oauthToken = settings?.liveOAuth?.accessTokenEnc
    ? decryptOptional(settings.liveOAuth.accessTokenEnc)
    : null;
  const apiKey = oauthToken ?? decryptOptional(conn.consumerKeyEncrypted);
  const merchantId = conn.externalStoreId?.trim() ?? null;
  if (!apiKey || !merchantId) return null;
  return { apiKey, merchantId };
}
