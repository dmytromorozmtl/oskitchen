import { IntegrationProvider, type IntegrationStatus } from "@prisma/client";

import type { IntegrationConnectionSnapshot } from "@/lib/menu/channel-sync-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { beginChannelSyncJob, finishChannelSyncJob } from "@/services/channels/sync-orchestrator";

export async function loadIntegrationConnection(
  userId: string,
  provider: IntegrationProvider,
): Promise<IntegrationConnectionSnapshot> {
  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(userId, provider),
    select: { id: true, status: true, externalStoreId: true },
  });

  if (!conn) {
    return { id: null, connected: false, status: null, externalStoreId: null };
  }

  return {
    id: conn.id,
    connected: conn.status === "CONNECTED",
    status: conn.status,
    externalStoreId: conn.externalStoreId,
  };
}

export function connectionErrorMessage(
  channelLabel: string,
  status: IntegrationStatus | null,
): string {
  if (!status) return `${channelLabel} not connected.`;
  return `${channelLabel} connection ${status.toLowerCase()}.`;
}

export async function runChannelMenuSyncJob(input: {
  userId: string;
  connectionId: string | null;
  provider: IntegrationProvider;
  records?: { processed?: number; updated?: number; failed?: number };
  run: () => Promise<{ ok: boolean; message?: string }>;
}): Promise<{ ok: boolean; message?: string }> {
  const job = await beginChannelSyncJob({
    userId: input.userId,
    connectionId: input.connectionId,
    provider: input.provider,
    type: "MENUS",
  });

  const processed = input.records?.processed ?? 1;
  const updated = input.records?.updated ?? (processed > 0 ? 1 : 0);

  try {
    const result = await input.run();
    await finishChannelSyncJob(job.id, {
      status: result.ok ? "SUCCESS" : "FAILED",
      recordsProcessed: processed,
      recordsCreated: 0,
      recordsUpdated: result.ok ? updated : 0,
      recordsFailed: result.ok ? (input.records?.failed ?? 0) : (input.records?.failed ?? processed),
      errorMessage: result.ok ? null : result.message ?? "Sync failed",
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await finishChannelSyncJob(job.id, {
      status: "FAILED",
      recordsProcessed: 1,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 1,
      errorMessage: message,
    });
    return { ok: false, message };
  }
}

export async function patchMarketplaceMenuItem(input: {
  url: string;
  headers: Record<string, string>;
  body: unknown;
}): Promise<{ ok: boolean; statusCode: number; message: string }> {
  const res = await fetch(input.url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...input.headers,
    },
    body: JSON.stringify(input.body),
    cache: "no-store",
  });

  return {
    ok: res.ok,
    statusCode: res.status,
    message: res.ok ? "Menu item synced." : `API returned ${res.status}`,
  };
}
