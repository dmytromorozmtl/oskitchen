"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireManageStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";

async function storefrontForUser() {
  const { sf } = await requireManageStorefrontRow(
    { id: true, storeSlug: true },
    { operation: "storefront.discounts" },
  );
  return sf;
}

const createSchema = z.object({
  code: z.string().min(2).max(40),
  kind: z.enum(["PERCENT_OFF", "FIXED_OFF", "FREE_DELIVERY"]),
  percentOff: z.string().optional(),
  amountOff: z.string().optional(),
  maxUses: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function createStorefrontDiscountAction(formData: FormData) {
  try {
    await requireTenantActor();
    const sf = await storefrontForUser();
    if (!sf) return { error: "Save storefront overview first." };
    const parsed = createSchema.safeParse({
      code: formData.get("code")?.toString(),
      kind: formData.get("kind")?.toString(),
      percentOff: formData.get("percentOff")?.toString(),
      amountOff: formData.get("amountOff")?.toString(),
      maxUses: formData.get("maxUses")?.toString(),
      expiresAt: formData.get("expiresAt")?.toString(),
    });
    if (!parsed.success) return { error: "Check discount fields." };
    const d = parsed.data;
    const code = d.code.trim().toUpperCase();
    let percent: number | null = null;
    let amount: number | null = null;
    if (d.kind === "PERCENT_OFF") {
      const n = Number(d.percentOff?.trim());
      if (!Number.isFinite(n) || n <= 0 || n > 100) return { error: "Percent off must be between 1 and 100." };
      percent = n;
    }
    if (d.kind === "FIXED_OFF") {
      const n = Number(d.amountOff?.trim());
      if (!Number.isFinite(n) || n <= 0) return { error: "Amount off must be a positive number." };
      amount = n;
    }
    let maxUses: number | null = null;
    if (d.maxUses?.trim()) {
      const n = parseInt(d.maxUses, 10);
      if (!Number.isFinite(n) || n < 1) return { error: "Max uses is invalid." };
      maxUses = n;
    }
    let expiresAt: Date | null = null;
    if (d.expiresAt?.trim()) {
      const dt = new Date(`${d.expiresAt.trim()}T23:59:59.000Z`);
      if (Number.isNaN(dt.getTime())) return { error: "Expiry date is invalid." };
      expiresAt = dt;
    }
    await prisma.storefrontDiscount.create({
      data: {
        storefrontId: sf.id,
        code,
        kind: d.kind,
        percentOff: percent,
        amountOff: amount,
        active: true,
        maxUses,
        expiresAt,
      },
    });
    revalidatePath("/dashboard/storefront/discounts");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function toggleStorefrontDiscountAction(formData: FormData) {
  try {
    await requireTenantActor();
    const sf = await storefrontForUser();
    if (!sf) return { error: "Storefront not found." };
    const id = formData.get("id")?.toString();
    if (!id) return { error: "Missing id." };
    const row = await prisma.storefrontDiscount.findFirst({
      where: { id, storefrontId: sf.id },
    });
    if (!row) return { error: "Discount not found." };
    await prisma.storefrontDiscount.update({
      where: { id },
      data: { active: !row.active },
    });
    revalidatePath("/dashboard/storefront/discounts");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontDiscountAction(formData: FormData) {
  try {
    await requireTenantActor();
    const sf = await storefrontForUser();
    if (!sf) return { error: "Storefront not found." };
    const id = formData.get("id")?.toString();
    if (!id) return { error: "Missing id." };
    const row = await prisma.storefrontDiscount.findFirst({
      where: { id, storefrontId: sf.id },
    });
    if (!row) return { error: "Discount not found." };
    await prisma.storefrontDiscount.delete({ where: { id } });
    revalidatePath("/dashboard/storefront/discounts");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createStorefrontDiscountFormAction(formData: FormData): Promise<void> {
  void (await createStorefrontDiscountAction(formData));
}

export async function toggleStorefrontDiscountFormAction(formData: FormData): Promise<void> {
  void (await toggleStorefrontDiscountAction(formData));
}

export async function deleteStorefrontDiscountFormAction(formData: FormData): Promise<void> {
  void (await deleteStorefrontDiscountAction(formData));
}
