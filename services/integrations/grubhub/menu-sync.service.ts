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
  locationId?: string | null,
): Promise<{ sections: GrubhubMenuSection[] }> {
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
    locationId?: string | null,
  ): Promise<GrubhubMenuSyncResult> {
    const apiKey = this.creds.apiKey?.trim();
    if (!apiKey || !merchantId.trim()) {
      return {
        ok: false,
        syncedAt: new Date(),
        message: "Grubhub API key and merchant ID are required for menu sync.",
      };
    }

    const payload = await buildGrubhubMenuPayload(ownerUserId, locationId);
    const itemsCount = payload.sections.reduce((sum, s) => sum + s.items.length, 0);

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

    return {
      ok: res.ok,
      syncedAt: new Date(),
      statusCode: res.status,
      categoriesCount: payload.sections.length,
      itemsCount,
      message: res.ok
        ? `Menu synced (${payload.sections.length} sections, ${itemsCount} items)`
        : `Grubhub menu sync failed (${res.status})`,
    };
  }
}
