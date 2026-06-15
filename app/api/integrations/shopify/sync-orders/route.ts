import { NextResponse } from "next/server";
import { z } from "zod";

import { requireConnectionOwner } from "@/lib/integrations/api-helpers";
import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { prisma } from "@/lib/prisma";
import { stageSyncJobOrders } from "@/lib/channels/import-staging";
import { IntegrationProvider, IntegrationStatus } from "@prisma/client";
import {
  fetchOrdersGraphQL,
  normalizeShopifyOrder,
} from "@/services/integrations/shopify";
import { importShopifyOrderToKitchen } from "@/services/integrations/shopify/kitchen-import.service";
import { beginChannelSyncJob, finishChannelSyncJob } from "@/services/channels/sync-orchestrator";

const bodySchema = z.object({
  connectionId: z.string().uuid(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const owned = await requireConnectionOwner(parsed.data.connectionId);
  if ("error" in owned) return owned.error;

  const settings = owned.conn.settingsJson as { apiVersion?: string } | null;
  const creds = getShopifyCredentials(
    owned.conn,
    settings?.apiVersion ?? undefined,
  );
  if (!creds) {
    return NextResponse.json({ error: "Missing Shopify credentials" }, { status: 400 });
  }

  let jobId: string | null = null;
  let imported = 0;
  try {
    const job = await beginChannelSyncJob({
      userId: owned.conn.userId,
      connectionId: owned.conn.id,
      provider: IntegrationProvider.SHOPIFY,
      type: "ORDERS",
    });
    jobId = job.id;

    const entries: Array<{ raw: unknown; normalized: ReturnType<typeof normalizeShopifyOrder> }> =
      [];
    const nodes = await fetchOrdersGraphQL(creds, 50);
    for (const node of nodes) {
      const normalized = normalizeShopifyOrder(node as Record<string, unknown>);
      const external = await persistNormalizedExternalOrder({
        userId: owned.conn.userId,
        connectionId: owned.conn.id,
        normalized,
      });
      const kitchen = await importShopifyOrderToKitchen({
        userId: owned.conn.userId,
        workspaceId: owned.conn.workspaceId,
        connectionId: owned.conn.id,
        normalized,
        externalOrderRecordId: external.id,
      });
      entries.push({ raw: node, normalized });
      if (kitchen.imported) imported++;
    }

    await stageSyncJobOrders({
      syncJobId: jobId,
      userId: owned.conn.userId,
      connectionId: owned.conn.id,
      provider: IntegrationProvider.SHOPIFY,
      entries,
    });

    await prisma.integrationConnection.update({
      where: { id: owned.conn.id },
      data: {
        lastSyncAt: new Date(),
        lastError: null,
        status: IntegrationStatus.CONNECTED,
      },
    });

    await finishChannelSyncJob(jobId, {
      status: "SUCCESS",
      recordsProcessed: imported,
      recordsCreated: imported,
      recordsUpdated: 0,
      recordsFailed: 0,
    });

    return NextResponse.json({ ok: true, imported });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (jobId) {
      await finishChannelSyncJob(jobId, {
        status: "FAILED",
        recordsProcessed: imported,
        recordsCreated: imported,
        recordsUpdated: 0,
        recordsFailed: 1,
        errorMessage: msg,
      });
    }
    await prisma.integrationConnection.update({
      where: { id: owned.conn.id },
      data: {
        lastError: msg,
        status: IntegrationStatus.ERROR,
      },
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
