"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { assertStorefrontThemeUrlsSafe } from "@/services/storefront/storefront-theme-service";
import { themePresetToSettingsPatch } from "@/services/storefront/apply-theme-preset-service";

export async function applyStorefrontThemePreset(presetId: string) {
  try {
    await requireTenantActor();
    const patch = themePresetToSettingsPatch(presetId);
    if (!patch) return { error: "Unknown theme preset." };

    const { sf: row } = await requireAdminStorefrontRow("storefront.theme", {
      id: true,
      storeSlug: true,
      workspaceId: true,
      userId: true,
      logoUrl: true,
      faviconUrl: true,
      heroImageUrl: true,
      coverImageUrl: true,
    });
    if (!row) return { error: "Save the storefront overview once first." };

    assertStorefrontThemeUrlsSafe({
      logoUrl: row.logoUrl,
      faviconUrl: row.faviconUrl,
      heroImageUrl: row.heroImageUrl,
      coverImageUrl: row.coverImageUrl,
      brandColor: patch.brandColor,
      textColor: patch.textColor,
    });

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: patch,
    });

    revalidateStorefrontDashboardAndPublic(row.storeSlug);
    revalidatePath("/dashboard/storefront/theme");
    return { ok: true as const, presetId };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function applyStorefrontThemePresetFormAction(formData: FormData): Promise<void> {
  const presetId = formData.get("presetId")?.toString() ?? "";
  void (await applyStorefrontThemePreset(presetId));
}
