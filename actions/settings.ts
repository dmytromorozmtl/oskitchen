"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { kitchenSettingsSchema } from "@/lib/schemas";
import { safeError } from "@/lib/security";

export async function updateKitchenSettings(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();

    const parsed = kitchenSettingsSchema.safeParse({
      businessType: formData.get("businessType") ?? undefined,
      businessName: formData.get("businessName") ?? undefined,
      logoUrl: formData.get("logoUrl") ?? undefined,
      pickupAddress: formData.get("pickupAddress") ?? undefined,
      deliveryEnabled: formData.get("deliveryEnabled") === "on",
      deliveryNotes: formData.get("deliveryNotes") ?? undefined,
      deliveryRadiusKm: formData.get("deliveryRadiusKm") || undefined,
      deliveryFee: formData.get("deliveryFee") || undefined,
      orderCutoffTime: formData.get("orderCutoffTime") ?? undefined,
      timezone: formData.get("timezone") ?? "UTC",
      kitchenWorkflowDefault: formData.get("kitchenWorkflowDefault") ?? undefined,
      notifyOrderConfirmation: formData.get("notifyOrderConfirmation") === "on",
      notifyPreorderReminder: formData.get("notifyPreorderReminder") === "on",
      notifyPickupReminder: formData.get("notifyPickupReminder") === "on",
      notifyDeliveryReminder: formData.get("notifyDeliveryReminder") === "on",
      locale: formData.get("locale") ?? "en",
    });

    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      return {
        error: Object.values(msg).flat()[0] ?? "Invalid settings",
      };
    }

    const d = parsed.data;

    await prisma.kitchenSettings.upsert({
      where: { userId: dataUserId },
      create: {
        userId: dataUserId,
        businessType: d.businessType ?? null,
        businessName: d.businessName,
        logoUrl: d.logoUrl,
        pickupAddress: d.pickupAddress,
        deliveryEnabled: d.deliveryEnabled,
        deliveryNotes: d.deliveryNotes,
        deliveryRadiusKm: d.deliveryRadiusKm ?? undefined,
        deliveryFee: d.deliveryFee != null ? d.deliveryFee : undefined,
        orderCutoffTime: d.orderCutoffTime,
        timezone: d.timezone,
        kitchenWorkflowDefault: d.kitchenWorkflowDefault,
        notifyOrderConfirmation: d.notifyOrderConfirmation,
        notifyPreorderReminder: d.notifyPreorderReminder,
        notifyPickupReminder: d.notifyPickupReminder,
        notifyDeliveryReminder: d.notifyDeliveryReminder,
        locale: d.locale,
      },
      update: {
        businessType: d.businessType,
        businessName: d.businessName,
        logoUrl: d.logoUrl,
        pickupAddress: d.pickupAddress,
        deliveryEnabled: d.deliveryEnabled,
        deliveryNotes: d.deliveryNotes,
        deliveryRadiusKm: d.deliveryRadiusKm ?? undefined,
        deliveryFee: d.deliveryFee != null ? d.deliveryFee : undefined,
        orderCutoffTime: d.orderCutoffTime,
        timezone: d.timezone,
        kitchenWorkflowDefault: d.kitchenWorkflowDefault,
        notifyOrderConfirmation: d.notifyOrderConfirmation,
        notifyPreorderReminder: d.notifyPreorderReminder,
        notifyPickupReminder: d.notifyPickupReminder,
        notifyDeliveryReminder: d.notifyDeliveryReminder,
        locale: d.locale,
      },
    });

    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        companyName: d.businessName ?? undefined,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return ok(undefined);
  } catch (error) {
    return { error: safeError(error) };
  }
}
