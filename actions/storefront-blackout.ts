"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

const blackoutSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  message: z.string().max(2000).optional().or(z.literal("")),
});

function parseDateOnly(s: string): Date | null {
  const t = s.trim();
  if (!t) return null;
  const dt = new Date(`${t}T12:00:00.000Z`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

async function sfForSettings() {
  const { sf } = await requireAdminStorefrontRow("storefront.settings", {
    id: true,
    storeSlug: true,
  });
  return sf;
}

export async function createStorefrontBlackoutDate(formData: FormData) {
  try {
    await requireTenantActor();
    const parsed = blackoutSchema.safeParse({
      startDate: formData.get("startDate")?.toString(),
      endDate: formData.get("endDate")?.toString(),
      message: formData.get("message")?.toString(),
    });
    if (!parsed.success) return { error: "Check blackout dates." };

    const start = parseDateOnly(parsed.data.startDate);
    const end = parseDateOnly(parsed.data.endDate);
    if (!start || !end) return { error: "Start and end dates are required." };
    if (end < start) return { error: "End date must be on or after start date." };

    const sf = await sfForSettings();

    await prisma.storefrontBlackoutDate.create({
      data: {
        storefrontId: sf.id,
        startDate: start,
        endDate: end,
        message: parsed.data.message?.trim() || null,
      },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/fulfillment");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createStorefrontBlackoutDateFormAction(formData: FormData): Promise<void> {
  void (await createStorefrontBlackoutDate(formData));
}

export async function deleteStorefrontBlackoutDate(formData: FormData) {
  try {
    await requireTenantActor();
    const id = (formData.get("id") ?? "").toString().trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid blackout row." };

    const sf = await sfForSettings();

    const row = await prisma.storefrontBlackoutDate.findFirst({
      where: { id, storefrontId: sf.id },
    });
    if (!row) return { error: "Blackout not found." };

    await prisma.storefrontBlackoutDate.delete({ where: { id: row.id } });
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/fulfillment");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontBlackoutDateFormAction(formData: FormData): Promise<void> {
  void (await deleteStorefrontBlackoutDate(formData));
}
