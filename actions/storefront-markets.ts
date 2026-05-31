"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { triggerShopifyMarketCatalogPushAfterMarketsUpdate } from "@/lib/integrations/shopify-market-catalog-push-trigger";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { defaultPilotMarket, storefrontMarketSchema } from "@/lib/storefront/markets";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { safeError } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";

const marketsPayloadSchema = z.object({
  marketsJson: z.string().max(20000),
});

export async function updateStorefrontMarketsAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const { sf } = await requireAdminStorefrontRow("storefront.markets", {
      id: true,
      storeSlug: true,
      workspaceId: true,
      userId: true,
      currency: true,
    });
    if (!sf) return { error: "Save storefront overview first." };

    const parsed = marketsPayloadSchema.safeParse({
      marketsJson: formData.get("marketsJson")?.toString() ?? "[]",
    });
    if (!parsed.success) return { error: "Invalid markets payload." };

    let markets: unknown;
    try {
      markets = JSON.parse(parsed.data.marketsJson);
    } catch {
      return { error: "Markets must be valid JSON." };
    }

    const arr = z.array(storefrontMarketSchema).safeParse(markets);
    if (!arr.success) return { error: "Each market needs id, name, and valid fields." };

    const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId: sf.userId } });
    const center =
      kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object"
        ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
        : {};

    const storefrontBlock =
      center.storefront && typeof center.storefront === "object"
        ? { ...(center.storefront as Record<string, unknown>) }
        : {};

    storefrontBlock.markets = arr.data;
    center.storefront = storefrontBlock;

    await prisma.kitchenSettings.upsert({
      where: { userId: sf.userId },
      create: { userId: sf.userId, settingsCenterJson: toInputJsonValue(center) },
      update: { settingsCenterJson: toInputJsonValue(center) },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug, "settings", {
      storefrontId: sf.id,
      ownerUserId: user.id,
    });
    revalidatePath("/dashboard/storefront/markets");
    void triggerShopifyMarketCatalogPushAfterMarketsUpdate({ userId: sf.userId });
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function seedDefaultMarketAction() {
  try {
    await requireTenantActor();
    const { sf } = await requireAdminStorefrontRow("storefront.markets", {
      id: true,
      storeSlug: true,
      workspaceId: true,
      userId: true,
      currency: true,
    });
    if (!sf) return { error: "Save storefront overview first." };

    const fd = new FormData();
    fd.set("marketsJson", JSON.stringify([defaultPilotMarket(sf.storeSlug, sf.currency)], null, 2));
    return updateStorefrontMarketsAction(fd);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function seedDefaultMarketFormAction(): Promise<void> {
  void (await seedDefaultMarketAction());
}
