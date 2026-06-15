"use server";


import { fail, ok } from "@/lib/action-result";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import {
  deleteStorefrontRedirectForStorefront,
  upsertStorefrontRedirectForStorefront,
} from "@/services/storefront/storefront-redirect-service";
import { parseFulfillmentRulesJsonForSave } from "@/services/storefront/storefront-fulfillment-rule-service";
import { createStorefrontTestOrder, purgeStorefrontTestOrdersForUser } from "@/services/storefront/storefront-test-order-service";

const redirectUpsertSchema = z.object({
  id: z.string().max(64).optional(),
  fromPath: z.string().min(1).max(512).refine((p) => p.startsWith("/"), "From path must start with /."),
  toPath: z.string().min(1).max(512).refine((p) => p.startsWith("/"), "To path must start with /."),
  httpStatus: z.coerce.number().pipe(z.union([z.literal(301), z.literal(302)])),
  active: z.boolean(),
});

const fulfillmentRuleSchema = z.object({
  id: z.string().max(64).optional(),
  label: z.string().min(1).max(200),
  priority: z.number().int().min(-1000).max(1000),
  active: z.boolean(),
  rulesJson: z.string().max(32000),
});

const purgeConfirmSchema = z.object({
  confirm: z.literal("DELETE"),
});

async function sfForUser() {
  const { sf } = await requireAdminStorefrontRow("storefront.settings", { id: true, storeSlug: true, userId: true });
  return sf;
}

export async function upsertStorefrontRedirectAction(formData: FormData) {
  try {
    await requireTenantActor();
    const sf = await sfForUser();
    if (!sf) return { error: "Storefront not found." };
    const parsed = redirectUpsertSchema.safeParse({
      id: String(formData.get("id") ?? "").trim() || undefined,
      fromPath: String(formData.get("fromPath") ?? "").trim(),
      toPath: String(formData.get("toPath") ?? "").trim(),
      httpStatus: Number(formData.get("httpStatus") ?? "302"),
      active: formData.get("active") === "on",
    });
    if (!parsed.success) return { error: "Invalid redirect fields." };
    const { id, fromPath, toPath, httpStatus, active } = parsed.data;
    try {
      if (id) {
        const row = await prisma.storefrontRedirect.findFirst({ where: { id, storefrontId: sf.id } });
        if (!row) return { error: "Redirect not found." };
      }
      await upsertStorefrontRedirectForStorefront({
        storefrontId: sf.id,
        id: id || null,
        fromPath,
        toPath,
        httpStatus,
        active,
      });
    } catch (err) {
      return { error: err instanceof Error ? err.message : safeError(err) };
    }
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/advanced");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontRedirectAction(formData: FormData) {
  try {
    await requireTenantActor();
    const sf = await sfForUser();
    if (!sf) return { error: "Storefront not found." };
    const id = String(formData.get("id") ?? "");
    const row = await prisma.storefrontRedirect.findFirst({ where: { id, storefrontId: sf.id } });
    if (!row) return { error: "Not found." };
    await deleteStorefrontRedirectForStorefront(sf.id, id);
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/advanced");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function upsertStorefrontFulfillmentRuleAction(formData: FormData) {
  try {
    await requireTenantActor();
    const sf = await sfForUser();
    if (!sf) return { error: "Storefront not found." };
    const parsedForm = fulfillmentRuleSchema.safeParse({
      id: String(formData.get("id") ?? "").trim() || undefined,
      label: String(formData.get("label") ?? "").trim(),
      priority: Number(formData.get("priority") ?? "0"),
      active: formData.get("active") === "on",
      rulesJson: String(formData.get("rulesJson") ?? "").trim(),
    });
    if (!parsedForm.success) return { error: "Invalid fulfillment rule fields." };
    const { id, label, priority, active, rulesJson: rulesRaw } = parsedForm.data;
    const parsedRules = parseFulfillmentRulesJsonForSave(rulesRaw);
    if (!parsedRules.ok) return { error: parsedRules.error };
    const rulesJson = parsedRules.value;
    if (id) {
      const row = await prisma.storefrontFulfillmentRule.findFirst({ where: { id, storefrontId: sf.id } });
      if (!row) return { error: "Rule not found." };
      await prisma.storefrontFulfillmentRule.update({
        where: { id },
        data: { label, priority: Number.isFinite(priority) ? priority : 0, active, rulesJson: rulesJson as Prisma.InputJsonValue },
      });
    } else {
      await prisma.storefrontFulfillmentRule.create({
        data: { storefrontId: sf.id, label, priority: Number.isFinite(priority) ? priority : 0, active, rulesJson: rulesJson as Prisma.InputJsonValue },
      });
    }
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/advanced");
    revalidatePath("/dashboard/storefront/fulfillment");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontFulfillmentRuleAction(formData: FormData) {
  try {
    await requireTenantActor();
    const sf = await sfForUser();
    if (!sf) return { error: "Storefront not found." };
    const id = String(formData.get("id") ?? "");
    const row = await prisma.storefrontFulfillmentRule.findFirst({ where: { id, storefrontId: sf.id } });
    if (!row) return { error: "Not found." };
    await prisma.storefrontFulfillmentRule.delete({ where: { id } });
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/advanced");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createStorefrontTestOrderAction(formData: FormData) {
  try {
    const { userId } = await requireTenantActor();
    const skipEmail = formData.get("sendTestEmail") !== "on";
    const skipAnalytics = formData.get("countInAnalytics") !== "on";
    const res = await createStorefrontTestOrder({
      userId,
      sendTestEmail: !skipEmail,
      countInAnalytics: !skipAnalytics,
    });
    if ("error" in res) return { error: res.error };
    revalidatePath("/dashboard/storefront/advanced");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/order-hub");
    return { ok: true as const, token: res.token };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function purgeStorefrontTestOrdersAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const parsed = purgeConfirmSchema.safeParse({ confirm: String(formData.get("confirm") ?? "") });
    if (!parsed.success) return { error: 'Type DELETE in the confirmation field.' };
    const res = await purgeStorefrontTestOrdersForUser(user.id);
    if ("error" in res) return { error: res.error };
    revalidatePath("/dashboard/storefront/advanced");
    revalidatePath("/dashboard/orders");
    return { ok: true as const, removed: res.removed };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function upsertStorefrontRedirectFormAction(formData: FormData): Promise<void> {
  void (await upsertStorefrontRedirectAction(formData));
}

export async function deleteStorefrontRedirectFormAction(formData: FormData): Promise<void> {
  void (await deleteStorefrontRedirectAction(formData));
}

export async function upsertStorefrontFulfillmentRuleFormAction(formData: FormData): Promise<void> {
  void (await upsertStorefrontFulfillmentRuleAction(formData));
}

export async function deleteStorefrontFulfillmentRuleFormAction(formData: FormData): Promise<void> {
  void (await deleteStorefrontFulfillmentRuleAction(formData));
}

export async function createStorefrontTestOrderFormAction(formData: FormData): Promise<void> {
  void (await createStorefrontTestOrderAction(formData));
}

export async function purgeStorefrontTestOrdersFormAction(formData: FormData): Promise<void> {
  void (await purgeStorefrontTestOrdersAction(formData));
}
