"use server";


import { fail, ok } from "@/lib/action-result";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  parseStorefrontCurrency,
  parseStorefrontLocale,
  parseStorefrontTimezone,
} from "@/lib/storefront/regional";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

const regionalSchema = z.object({
  currency: z.string().max(8),
  locale: z.string().max(16),
  timezone: z.string().max(64),
});

export async function updateStorefrontRegionalSettings(formData: FormData) {
  try {
    await requireTenantActor();
    const parsed = regionalSchema.safeParse({
      currency: formData.get("currency")?.toString() ?? "",
      locale: formData.get("locale")?.toString() ?? "",
      timezone: formData.get("timezone")?.toString() ?? "",
    });
    if (!parsed.success) return { error: "Check regional fields." };

    const cur = parseStorefrontCurrency(parsed.data.currency);
    if (!cur.ok) return { error: cur.error };
    const loc = parseStorefrontLocale(parsed.data.locale);
    if (!loc.ok) return { error: loc.error };
    const tz = parseStorefrontTimezone(parsed.data.timezone);
    if (!tz.ok) return { error: tz.error };

    const { sf: row } = await requireAdminStorefrontRow("storefront.settings", { id: true, storeSlug: true, workspaceId: true, userId: true });
    if (!row) return { error: "Save the storefront overview once first." };

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: {
        currency: cur.currency,
        locale: loc.locale,
        timezone: tz.timezone,
      },
    });
    revalidateStorefrontDashboardAndPublic(row.storeSlug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontRegionalSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontRegionalSettings(formData));
}
