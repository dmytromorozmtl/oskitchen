"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import {
  getShopifyCredentials,
  getWooCommerceCredentials,
} from "@/lib/integrations/decrypt-connection";
import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { testConnection as testShopify } from "@/services/integrations/shopify";
import { testConnection as testWoo } from "@/services/integrations/woocommerce";
import { IntegrationHealthStatus, IntegrationProvider } from "@prisma/client";

export async function runIntegrationHealthCheckForm(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { userId } = await requireTenantActor();
    const connectionId = String(formData.get("connectionId") ?? "").trim();
    if (!connectionId) return { error: "Missing connection" };

    const conn = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByIdWhereForOwner(userId, connectionId),
    });
    if (!conn) return { error: "Connection not found" };

    const started = Date.now();
    let status: IntegrationHealthStatus = "OK";
    let errorMessage: string | null = null;

    if (conn.status === "ERROR") {
      status = "ERROR";
      errorMessage = conn.lastError?.slice(0, 500) ?? "Connection in error state";
    } else if (conn.status === "NEEDS_AUTH") {
      status = "DEGRADED";
      errorMessage = "Credentials need attention";
    } else if (conn.provider === IntegrationProvider.WOOCOMMERCE) {
      const creds = getWooCommerceCredentials(conn);
      if (!creds) {
        status = "DEGRADED";
        errorMessage = "Incomplete WooCommerce credentials";
      } else {
        const live = await testWoo(creds);
        if (!live.ok) {
          status = "ERROR";
          errorMessage = live.message;
        }
      }
    } else if (conn.provider === IntegrationProvider.SHOPIFY) {
      const creds = getShopifyCredentials(conn);
      if (!creds) {
        status = "DEGRADED";
        errorMessage = "Incomplete Shopify credentials";
      } else {
        const live = await testShopify(creds);
        if (!live.ok) {
          status = "ERROR";
          errorMessage = live.message;
        }
      }
    }

    const latencyMs = Math.min(60_000, Math.max(0, Date.now() - started));

    await prisma.integrationHealthCheck.create({
      data: {
        connectionId: conn.id,
        status,
        latencyMs,
        errorMessage,
      },
    });

    revalidatePath("/dashboard/integrations/health");
    revalidatePath("/dashboard/sales-channels");
    revalidatePath("/dashboard/sales-channels/health");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export const runIntegrationHealthCheckFormAction = asVoidFormAction(runIntegrationHealthCheckForm);
