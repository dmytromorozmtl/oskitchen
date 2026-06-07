"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  mergeLocationCurrencyIntoTaxSettings,
  MULTI_CURRENCY_SETTINGS_ROUTE,
  parseMultiCurrencyCode,
} from "@/lib/finance/multi-currency-policy";
import { prisma } from "@/lib/prisma";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { locationByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { canUseSettings } from "@/lib/settings/settings-permissions";

const locationCurrencySchema = z.object({
  locationId: z.string().uuid(),
  currency: z.string().max(8),
});

export async function updateLocationCurrencyFormAction(formData: FormData): Promise<void> {
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
  if (!canUseSettings(actor, "manage_workspace")) return;

  const parsed = locationCurrencySchema.safeParse({
    locationId: formData.get("locationId")?.toString() ?? "",
    currency: formData.get("currency")?.toString() ?? "",
  });
  if (!parsed.success) return;

  const cur = parseMultiCurrencyCode(parsed.data.currency);
  if (!cur.ok) return;

  const location = await prisma.location.findFirst({
    where: await locationByIdWhereForOwner(userId, parsed.data.locationId),
    select: { id: true, taxSettingsJson: true },
  });
  if (!location) return;

  await prisma.location.update({
    where: { id: location.id },
    data: {
      taxSettingsJson: mergeLocationCurrencyIntoTaxSettings(
        location.taxSettingsJson,
        cur.currency,
      ) as Prisma.InputJsonValue,
    },
  });

  revalidatePath(MULTI_CURRENCY_SETTINGS_ROUTE);
  revalidatePath("/dashboard/enterprise/multi-location");
}

const workspaceCurrencySchema = z.object({
  currency: z.string().max(8),
});

export async function updateWorkspaceCurrencyFormAction(formData: FormData): Promise<void> {
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
  if (!canUseSettings(actor, "manage_workspace")) return;

  const parsed = workspaceCurrencySchema.safeParse({
    currency: formData.get("currency")?.toString() ?? "",
  });
  if (!parsed.success) return;

  const cur = parseMultiCurrencyCode(parsed.data.currency);
  if (!cur.ok) return;

  await prisma.kitchenSettings.update({
    where: { userId },
    data: { currency: cur.currency },
  });

  revalidatePath(MULTI_CURRENCY_SETTINGS_ROUTE);
  revalidatePath("/dashboard/settings/workspace");
}
