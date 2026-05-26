import { IntegrationProvider } from "@prisma/client";

import { menuListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type { UberEatsCredentials } from "@/services/integrations/uber-eats";

export type UberEatsMenuSyncResult = {
  ok: boolean;
  syncedAt: Date;
  statusCode?: number;
  message?: string;
  categoriesCount?: number;
  itemsCount?: number;
};

type UberMenuCategory = {
  id: string;
  title: string;
  entities: Array<{ id: string; title: string; price: number; description?: string }>;
};

const UBER_MENU_API =
  process.env.UBER_EATS_MENU_API_BASE ?? "https://api.uber.com/v2/eats/stores";

/** Build Uber Eats Menu API v2 payload from KitchenOS menus/products. */
export async function buildUberEatsMenuPayload(
  ownerUserId: string,
  locationId?: string | null,
): Promise<{ categories: UberMenuCategory[] }> {
  const menuWhere = await menuListWhereForOwner(ownerUserId);
  const menus = await prisma.menu.findMany({
    where: {
      AND: [
        menuWhere,
        { active: true },
        ...(locationId ? [{ locationId }] : []),
      ],
    },
    include: {
      products: {
        where: { active: true },
        orderBy: { title: "asc" },
        take: 500,
      },
    },
    take: 20,
  });

  const categories: UberMenuCategory[] = menus.map((menu) => ({
    id: menu.id,
    title: menu.title,
    entities: menu.products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description ?? undefined,
      price: Math.round(Number(p.price) * 100),
    })),
  }));

  return { categories };
}

async function getUberAccessToken(creds: UberEatsCredentials): Promise<string | null> {
  if (!creds.clientId?.trim() || !creds.clientSecret?.trim()) return null;
  const tokenUrl = process.env.UBER_EATS_TOKEN_URL ?? "https://login.uber.com/oauth/v2/token";
  try {
    const body = new URLSearchParams({
      client_id: creds.clientId.trim(),
      client_secret: creds.clientSecret.trim(),
      grant_type: "client_credentials",
      scope: "eats.store",
    });
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

export class UberEatsMenuSyncService {
  constructor(private readonly creds: UberEatsCredentials) {}

  async pushMenu(ownerUserId: string, storeId: string, locationId?: string | null): Promise<UberEatsMenuSyncResult> {
    const syncedAt = new Date();
    const menu = await buildUberEatsMenuPayload(ownerUserId, locationId);
    const token = await getUberAccessToken(this.creds);
    const sid = storeId || this.creds.storeId?.trim();

    if (!token || !sid) {
      return {
        ok: false,
        syncedAt,
        message: "Uber Eats credentials or store ID missing — menu payload built locally only.",
        categoriesCount: menu.categories.length,
        itemsCount: menu.categories.reduce((n, c) => n + c.entities.length, 0),
      };
    }

    const res = await fetch(`${UBER_MENU_API}/${encodeURIComponent(sid)}/menus`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ menus: [{ service_availability: [], category_ids: menu.categories.map((c) => c.id) }], categories: menu.categories }),
    });

    await prisma.channelSyncJob.create({
      data: {
        userId: ownerUserId,
        provider: IntegrationProvider.UBER_EATS,
        type: "MENUS",
        status: res.ok ? "SUCCESS" : "FAILED",
        completedAt: new Date(),
        resultJson: { statusCode: res.status, storeId: sid },
      },
    }).catch(() => undefined);

    return {
      ok: res.ok,
      syncedAt,
      statusCode: res.status,
      message: res.ok ? "Menu pushed to Uber Eats" : `Uber API returned ${res.status}`,
      categoriesCount: menu.categories.length,
      itemsCount: menu.categories.reduce((n, c) => n + c.entities.length, 0),
    };
  }
}
