import type { Prisma } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import { runChannelMenuSyncJob } from "@/lib/menu/channel-sync-helpers";
import { menuListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type { DoorDashCredentials } from "@/services/integrations/doordash/doordash-service";

export type DoorDashMenuSyncResult = {
  ok: boolean;
  syncedAt: Date;
  statusCode?: number;
  message?: string;
  categoriesCount?: number;
  itemsCount?: number;
};

export type DoorDashMenuSyncOptions = {
  menuId?: string | null;
  locationId?: string | null;
};

type DoorDashMenuCategory = {
  name: string;
  items: Array<{
    external_id: string;
    name: string;
    description?: string;
    price: number;
    active: boolean;
  }>;
};

const MENU_API_BASE =
  process.env.DOORDASH_MENU_API_BASE ?? "https://openapi.doordash.com/marketplace/v2";

export async function buildDoorDashMenuPayload(
  ownerUserId: string,
  options?: DoorDashMenuSyncOptions,
): Promise<{ categories: DoorDashMenuCategory[] }> {
  const menuWhere = await menuListWhereForOwner(ownerUserId);
  const filters: Prisma.MenuWhereInput[] = [menuWhere, { active: true }];
  if (options?.menuId) {
    filters.push({ id: options.menuId });
  } else if (options?.locationId) {
    filters.push({ locationId: options.locationId });
  }

  const menus = await prisma.menu.findMany({
    where: { AND: filters },
    include: {
      products: {
        where: { active: true },
        orderBy: { title: "asc" },
        take: 500,
      },
    },
    take: options?.menuId ? 1 : 20,
  });

  const categories: DoorDashMenuCategory[] = menus.map((menu) => ({
    name: menu.title,
    items: menu.products.map((product) => ({
      external_id: product.id,
      name: product.title,
      description: product.description ?? undefined,
      price: Math.round(Number(product.price) * 100),
      active: product.active,
    })),
  }));

  return { categories };
}

export class DoorDashMenuSyncService {
  constructor(private readonly creds: DoorDashCredentials = {}) {}

  async pushMenu(
    ownerUserId: string,
    merchantId: string,
    options?: DoorDashMenuSyncOptions,
    connectionId?: string | null,
  ): Promise<DoorDashMenuSyncResult> {
    const apiKey = this.creds.apiKey?.trim();
    if (!apiKey || !merchantId.trim()) {
      return {
        ok: false,
        syncedAt: new Date(),
        message: "DoorDash API key and merchant ID are required for menu sync.",
      };
    }

    const payload = await buildDoorDashMenuPayload(ownerUserId, options);
    const itemsCount = payload.categories.reduce((sum, c) => sum + c.items.length, 0);

    if (payload.categories.length === 0) {
      return {
        ok: false,
        syncedAt: new Date(),
        message: options?.menuId
          ? "Menu not found or has no active products."
          : "No active menus with products to sync.",
        categoriesCount: 0,
        itemsCount: 0,
      };
    }

    const outcome = await runChannelMenuSyncJob({
      userId: ownerUserId,
      connectionId: connectionId ?? null,
      provider: IntegrationProvider.DOORDASH,
      records: { processed: itemsCount, updated: itemsCount },
      run: async () => {
        const res = await fetch(
          `${MENU_API_BASE}/stores/${encodeURIComponent(merchantId)}/menu`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ categories: payload.categories }),
            cache: "no-store",
          },
        );

        if (res.ok) {
          return {
            ok: true,
            message: `Menu synced (${payload.categories.length} categories, ${itemsCount} items)`,
          };
        }

        let detail = "";
        try {
          detail = await res.text();
        } catch {
          detail = "";
        }
        return {
          ok: false,
          message: `DoorDash menu sync failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
        };
      },
    });

    return {
      ok: outcome.ok,
      syncedAt: new Date(),
      categoriesCount: payload.categories.length,
      itemsCount,
      message: outcome.message,
    };
  }
}
