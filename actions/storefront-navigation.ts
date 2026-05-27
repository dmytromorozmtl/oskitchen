"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { assertStorefrontManageAccess } from "@/lib/storefront/require-storefront-actor";

const navFooterSchema = z.object({
  itemsJson: z.string().max(120_000),
});

const footerSchema = z.object({
  blocksJson: z.string().max(120_000),
});

async function sfForUser(userId: string) {
  return prisma.storefrontSettings.findFirst({ where: { userId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: { id: true, storeSlug: true },
  });
}

export async function updateStorefrontNavigationSettings(formData: FormData) {
  try {
    const { userId } = await requireTenantActor();
    const manageDenied = await assertStorefrontManageAccess("storefront.navigation.update");
    if (manageDenied) return manageDenied;

    const parsed = navFooterSchema.safeParse({
      itemsJson: formData.get("itemsJson")?.toString() ?? "[]",
    });
    if (!parsed.success) return { error: "Navigation JSON is too large or invalid." };

    let json: unknown;
    try {
      json = JSON.parse(parsed.data.itemsJson) as unknown;
    } catch {
      return { error: "Navigation must be valid JSON." };
    }

    const sf = await sfForUser(userId);
    if (!sf) return { error: "Save the storefront overview once first." };

    await prisma.storefrontNavigation.upsert({
      where: { storefrontId: sf.id },
      create: { storefrontId: sf.id, itemsJson: json as object },
      update: { itemsJson: json as object },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/builder");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontNavigationSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontNavigationSettings(formData));
}

export async function updateStorefrontFooterSettings(formData: FormData) {
  try {
    const { userId } = await requireTenantActor();
    const manageDenied = await assertStorefrontManageAccess("storefront.footer.update");
    if (manageDenied) return manageDenied;

    const parsed = footerSchema.safeParse({
      blocksJson: formData.get("blocksJson")?.toString() ?? "[]",
    });
    if (!parsed.success) return { error: "Footer JSON is too large or invalid." };

    let json: unknown;
    try {
      json = JSON.parse(parsed.data.blocksJson) as unknown;
    } catch {
      return { error: "Footer must be valid JSON." };
    }

    const sf = await sfForUser(userId);
    if (!sf) return { error: "Save the storefront overview once first." };

    await prisma.storefrontFooter.upsert({
      where: { storefrontId: sf.id },
      create: { storefrontId: sf.id, blocksJson: json as object },
      update: { blocksJson: json as object },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/builder");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontFooterSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontFooterSettings(formData));
}
