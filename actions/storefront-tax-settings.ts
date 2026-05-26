"use server";


import { fail, ok } from "@/lib/action-result";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import {
  parseStorefrontTaxSettings,
  presetTaxSettings,
  storefrontTaxSettingsSchema,
  taxJurisdictionModes,
  type TaxJurisdictionMode,
} from "@/lib/storefront/tax-settings";

function mergeTaxIntoSettingsCenter(
  settingsCenterJson: unknown,
  tax: z.infer<typeof storefrontTaxSettingsSchema>,
): Prisma.InputJsonValue {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  const sf =
    base.storefront && typeof base.storefront === "object"
      ? { ...(base.storefront as Record<string, unknown>) }
      : {};
  return {
    ...base,
    storefront: {
      ...sf,
      tax,
    },
  } as Prisma.InputJsonValue;
}

const saveTaxSchema = z.object({
  mode: z.enum(taxJurisdictionModes),
  taxIncludedInPrices: z.coerce.boolean().optional(),
  regionCode: z.string().max(16).optional().or(z.literal("")),
  componentsJson: z.string().max(8000),
});

export async function saveStorefrontTaxSettingsFormAction(formData: FormData): Promise<void> {
  void (await saveStorefrontTaxSettings(formData));
}

export async function saveStorefrontTaxSettings(formData: FormData) {
  try {
    await requireTenantActor();
    const parsed = saveTaxSchema.safeParse({
      mode: formData.get("mode")?.toString(),
      taxIncludedInPrices: formData.get("taxIncludedInPrices") === "on",
      regionCode: formData.get("regionCode")?.toString(),
      componentsJson: formData.get("componentsJson")?.toString() ?? "[]",
    });
    if (!parsed.success) return { error: "Check tax fields." };

    let components: unknown;
    try {
      components = JSON.parse(parsed.data.componentsJson);
    } catch {
      return { error: "Tax components must be valid JSON." };
    }

    const taxParsed = storefrontTaxSettingsSchema.safeParse({
      mode: parsed.data.mode,
      taxIncludedInPrices: parsed.data.taxIncludedInPrices ?? false,
      regionCode: parsed.data.regionCode || undefined,
      components,
    });
    if (!taxParsed.success) return { error: "Invalid tax configuration." };

    const { sf: row } = await requireAdminStorefrontRow("storefront.settings", {
      id: true,
      storeSlug: true,
      userId: true,
    });
    if (!row) return { error: "Save storefront overview first." };

    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId: row.userId },
      select: { settingsCenterJson: true },
    });

    await prisma.kitchenSettings.update({
      where: { userId: row.userId },
      data: {
        settingsCenterJson: mergeTaxIntoSettingsCenter(kitchen?.settingsCenterJson, taxParsed.data),
        taxIncludedInPrices: taxParsed.data.taxIncludedInPrices,
        defaultTaxRate:
          taxParsed.data.components[0]?.ratePercent != null
            ? taxParsed.data.components[0].ratePercent
            : undefined,
        taxDisplayName: taxParsed.data.components[0]?.label ?? "Tax",
      },
    });

    revalidateStorefrontDashboardAndPublic(row.storeSlug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function applyStorefrontTaxPresetFormAction(formData: FormData): Promise<void> {
  const mode = formData.get("presetMode")?.toString() as TaxJurisdictionMode | undefined;
  if (!mode || !taxJurisdictionModes.includes(mode)) return;
  const preset = presetTaxSettings(mode);
  const fd = new FormData();
  fd.set("mode", preset.mode);
  if (preset.taxIncludedInPrices) fd.set("taxIncludedInPrices", "on");
  if (preset.regionCode) fd.set("regionCode", preset.regionCode);
  fd.set("componentsJson", JSON.stringify(preset.components));
  void (await saveStorefrontTaxSettings(fd));
}

