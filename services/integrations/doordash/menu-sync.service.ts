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
  locationId?: string | null,
): Promise<{ categories: DoorDashMenuCategory[] }> {
  const menuWhere = await menuListWhereForOwner(ownerUserId);
  const menus = await prisma.menu.findMany({
    where: {
      AND: [menuWhere, { active: true }, ...(locationId ? [{ locationId }] : [])],
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
    locationId?: string | null,
  ): Promise<DoorDashMenuSyncResult> {
    const apiKey = this.creds.apiKey?.trim();
    if (!apiKey || !merchantId.trim()) {
      return {
        ok: false,
        syncedAt: new Date(),
        message: "DoorDash API key and merchant ID are required for menu sync.",
      };
    }

    const payload = await buildDoorDashMenuPayload(ownerUserId, locationId);
    const itemsCount = payload.categories.reduce((sum, c) => sum + c.items.length, 0);

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

    return {
      ok: res.ok,
      syncedAt: new Date(),
      statusCode: res.status,
      categoriesCount: payload.categories.length,
      itemsCount,
      message: res.ok
        ? `Menu synced (${payload.categories.length} categories, ${itemsCount} items)`
        : `DoorDash menu sync failed (${res.status})`,
    };
  }
}
