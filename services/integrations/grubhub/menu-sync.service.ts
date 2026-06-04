import type { Prisma } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import { runChannelMenuSyncJob } from "@/lib/menu/channel-sync-helpers";
import { menuListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type { GrubhubCredentials } from "@/services/integrations/grubhub/grubhub-service";

export type GrubhubMenuSyncResult = {
  ok: boolean;
  syncedAt: Date;
  statusCode?: number;
  message?: string;
  categoriesCount?: number;
  itemsCount?: number;
};

export type GrubhubMenuSyncOptions = {
  menuId?: string | null;
  locationId?: string | null;
};

type GrubhubMenuSection = {
  name: string;
  items: Array<{
    external_id: string;
    name: string;
    description?: string;
    price: number;
    available: boolean;
  }>;
};

const MENU_API_BASE =
  process.env.GRUBHUB_MENU_API_BASE ?? "https://api-gtm.grubhub.com/v1";

export async function buildGrubhubMenuPayload(
  ownerUserId: string,
  options?: GrubhubMenuSyncOptions,
): Promise<{ sections: GrubhubMenuSection[] }> {
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

  const sections: GrubhubMenuSection[] = menus.map((menu) => ({
    name: menu.title,
    items: menu.products.map((product) => ({
      external_id: product.id,
      name: product.title,
      description: product.description ?? undefined,
      price: Math.round(Number(product.price) * 100),
      available: product.active,
    })),
  }));

  return { sections };
}

export class GrubhubMenuSyncService {
  constructor(private readonly creds: GrubhubCredentials = {}) {}

  async pushMenu(
    ownerUserId: string,
    merchantId: string,
    options?: GrubhubMenuSyncOptions,
    connectionId?: string | null,
  ): Promise<GrubhubMenuSyncResult> {
    const apiKey = this.creds.apiKey?.trim();
    if (!apiKey || !merchantId.trim()) {
      return {
        ok: false,
        syncedAt: new Date(),
        message: "Grubhub API key and merchant ID are required for menu sync.",
      };
    }

    const payload = await buildGrubhubMenuPayload(ownerUserId, options);
    const itemsCount = payload.sections.reduce((sum, s) => sum + s.items.length, 0);

    if (payload.sections.length === 0) {
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
      provider: IntegrationProvider.GRUBHUB,
      records: { processed: itemsCount, updated: itemsCount },
      run: async () => {
        const res = await fetch(
          `${MENU_API_BASE}/merchants/${encodeURIComponent(merchantId)}/menu`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ sections: payload.sections }),
            cache: "no-store",
          },
        );

        if (res.ok) {
          return {
            ok: true,
            message: `Menu synced (${payload.sections.length} sections, ${itemsCount} items)`,
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
          message: `Grubhub menu sync failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
        };
      },
    });

    return {
      ok: outcome.ok,
      syncedAt: new Date(),
      statusCode: outcome.ok ? 200 : undefined,
      categoriesCount: payload.sections.length,
      itemsCount,
      message: outcome.message,
    };
  }
}
