import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import { getShopifyCredentials, getWooCommerceCredentials } from "@/lib/integrations/decrypt-connection";
import { prisma } from "@/lib/prisma";
import { testConnection as shopifyTest } from "@/services/integrations/shopify";
import { testConnection as wooTest } from "@/services/integrations/woocommerce";

export type ChannelTestConnectionResult = {
  success: boolean;
  latencyMs: number;
  errorCode?: string;
  userMessage: string;
  developerMessage?: string;
  nextAction?: string;
};

export async function runChannelTestConnectionForUser(input: {
  userId: string;
  connectionId: string;
}): Promise<ChannelTestConnectionResult> {
  const started = Date.now();
  const conn = await prisma.integrationConnection.findFirst({
    where: { id: input.connectionId, userId: input.userId },
  });
  if (!conn) {
    return {
      success: false,
      latencyMs: Date.now() - started,
      errorCode: "NOT_FOUND",
      userMessage: "Connection not found for this workspace.",
      nextAction: "Refresh the page or reconnect the channel.",
    };
  }

  try {
    if (conn.provider === IntegrationProvider.WOOCOMMERCE) {
      const creds = getWooCommerceCredentials(conn);
      if (!creds) {
        return {
          success: false,
          latencyMs: Date.now() - started,
          errorCode: "NEEDS_CREDENTIALS",
          userMessage: "WooCommerce consumer key/secret are incomplete.",
          nextAction: "Open WooCommerce setup and save credentials.",
        };
      }
      const r = await wooTest(creds);
      await prisma.integrationConnection.update({
        where: { id: conn.id },
        data: {
          status: r.ok ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR,
          lastError: r.ok ? null : r.message,
        },
      });
      return {
        success: r.ok,
        latencyMs: Date.now() - started,
        userMessage: r.ok ? "WooCommerce REST API responded successfully." : r.message,
        developerMessage: r.ok ? undefined : r.message,
        nextAction: r.ok ? "Run a product or order sync when ready." : "Verify base URL, keys, and TLS.",
      };
    }

    if (conn.provider === IntegrationProvider.SHOPIFY) {
      const settings = conn.settingsJson as { apiVersion?: string } | null;
      const creds = getShopifyCredentials(conn, settings?.apiVersion ?? undefined);
      if (!creds) {
        return {
          success: false,
          latencyMs: Date.now() - started,
          errorCode: "NEEDS_CREDENTIALS",
          userMessage: "Shopify Admin API token or shop domain is incomplete.",
          nextAction: "Open Shopify setup and save credentials.",
        };
      }
      const r = await shopifyTest(creds);
      await prisma.integrationConnection.update({
        where: { id: conn.id },
        data: {
          status: r.ok ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR,
          lastError: r.ok ? null : r.message,
        },
      });
      return {
        success: r.ok,
        latencyMs: Date.now() - started,
        userMessage: r.ok ? "Shopify Admin API responded successfully." : r.message,
        developerMessage: r.ok ? undefined : r.message,
        nextAction: r.ok ? "Register webhooks for orders/products." : "Verify shop domain, token scopes, and API version.",
      };
    }

    return {
      success: false,
      latencyMs: Date.now() - started,
      errorCode: "UNSUPPORTED",
      userMessage: "Automated test connection is not implemented for this provider yet.",
      nextAction: "Use partner documentation or contact support for provisioning status.",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      success: false,
      latencyMs: Date.now() - started,
      errorCode: "EXCEPTION",
      userMessage: "Test connection failed unexpectedly.",
      developerMessage: msg,
      nextAction: "Retry after a minute; if it persists, inspect server logs.",
    };
  }
}
