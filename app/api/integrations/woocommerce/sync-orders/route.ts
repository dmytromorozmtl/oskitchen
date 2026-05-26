import { NextResponse } from "next/server";
import { z } from "zod";

import { requireConnectionOwner } from "@/lib/integrations/api-helpers";
import { getWooCommerceCredentials } from "@/lib/integrations/decrypt-connection";
import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { prisma } from "@/lib/prisma";
import { stageSyncJobOrders } from "@/lib/channels/import-staging";
import { IntegrationProvider, IntegrationStatus } from "@prisma/client";
import { fetchOrders, normalizeWooOrder } from "@/services/integrations/woocommerce";
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

  const creds = getWooCommerceCredentials(owned.conn);
  if (!creds) {
    return NextResponse.json({ error: "Missing WooCommerce credentials" }, { status: 400 });
  }

  let jobId: string | null = null;
  let imported = 0;
  try {
    const job = await beginChannelSyncJob({
      userId: owned.conn.userId,
      connectionId: owned.conn.id,
      provider: IntegrationProvider.WOOCOMMERCE,
      type: "ORDERS",
    });
    jobId = job.id;

    const entries: Array<{ raw: unknown; normalized: ReturnType<typeof normalizeWooOrder> }> = [];
    for (let page = 1; page <= 20; page++) {
      const batch = await fetchOrders(creds, page, 50);
      if (!batch.length) break;
      for (const raw of batch) {
        const normalized = normalizeWooOrder(raw as Record<string, unknown>);
        await persistNormalizedExternalOrder({
          userId: owned.conn.userId,
          connectionId: owned.conn.id,
          normalized,
        });
        entries.push({ raw, normalized });
        imported++;
      }
      if (batch.length < 50) break;
    }

    await stageSyncJobOrders({
      syncJobId: jobId,
      userId: owned.conn.userId,
      connectionId: owned.conn.id,
      provider: IntegrationProvider.WOOCOMMERCE,
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

    if (jobId) {
      await finishChannelSyncJob(jobId, {
        status: "SUCCESS",
        recordsProcessed: imported,
        recordsCreated: imported,
        recordsUpdated: 0,
        recordsFailed: 0,
      });
    }

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
