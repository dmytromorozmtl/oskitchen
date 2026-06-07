"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import {
  mergeLocationCurrencyIntoTaxSettings,
  MULTI_CURRENCY_SETTINGS_ROUTE,
  parseMultiCurrencyCode,
} from "@/lib/finance/multi-currency-policy";
import { prisma } from "@/lib/prisma";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { locationByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { safeError } from "@/lib/security";

const locationCurrencySchema = z.object({
  locationId: z.string().uuid(),
  currency: z.string().max(8),
});

export async function updateLocationCurrencyFormAction(formData: FormData) {
  try {
    const { sessionUser, userId } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: { role: true, email: true },
    });
    const actor = {
      userId,
      email: profile?.email ?? sessionUser.email ?? null,
      role: (profile?.role ?? null) as string | null,
    };
    if (!canUseSettings(actor, "manage_workspace")) {
      return fail("You do not have permission to update currency settings.");
    }

    const parsed = locationCurrencySchema.safeParse({
      locationId: formData.get("locationId")?.toString() ?? "",
      currency: formData.get("currency")?.toString() ?? "",
    });
    if (!parsed.success) return fail("Check location and currency fields.");

    const cur = parseMultiCurrencyCode(parsed.data.currency);
    if (!cur.ok) return fail(cur.error);

    const location = await prisma.location.findFirst({
      where: await locationByIdWhereForOwner(userId, parsed.data.locationId),
      select: { id: true, taxSettingsJson: true },
    });
    if (!location) return fail("Location not found.");

    await prisma.location.update({
      where: { id: location.id },
      data: {
        taxSettingsJson: mergeLocationCurrencyIntoTaxSettings(location.taxSettingsJson, cur.currency),
      },
    });

    revalidatePath(MULTI_CURRENCY_SETTINGS_ROUTE);
    revalidatePath("/dashboard/enterprise/multi-location");
    return ok(undefined);
  } catch (error) {
    return fail(safeError(error));
  }
}

const workspaceCurrencySchema = z.object({
  currency: z.string().max(8),
});

export async function updateWorkspaceCurrencyFormAction(formData: FormData) {
  try {
    const { sessionUser, userId } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: { role: true, email: true },
    });
    const actor = {
      userId,
      email: profile?.email ?? sessionUser.email ?? null,
      role: (profile?.role ?? null) as string | null,
    };
    if (!canUseSettings(actor, "manage_workspace")) {
      return fail("You do not have permission to update currency settings.");
    }

    const parsed = workspaceCurrencySchema.safeParse({
      currency: formData.get("currency")?.toString() ?? "",
    });
    if (!parsed.success) return fail("Check workspace currency field.");

    const cur = parseMultiCurrencyCode(parsed.data.currency);
    if (!cur.ok) return fail(cur.error);

    await prisma.kitchenSettings.update({
      where: { userId },
      data: { currency: cur.currency },
    });

    revalidatePath(MULTI_CURRENCY_SETTINGS_ROUTE);
    revalidatePath("/dashboard/settings/workspace");
    return ok(undefined);
  } catch (error) {
    return fail(safeError(error));
  }
}
