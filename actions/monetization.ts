"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

import { hashApiKey } from "@/lib/api-public/auth";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { isBillingBypassed } from "@/lib/billing/dev-bypass";
import { getBillingAccess } from "@/lib/billing/access";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { UserRole } from "@prisma/client";

export async function submitCancellationFeedbackForm(formData: FormData): Promise<void> {
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role !== UserRole.OWNER) return;

  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim() || null;
  if (!reason) return;

  const sub = await prisma.subscription.findUnique({ where: { userId: dataUserId } });
  const plan = sub?.plan ?? "STARTER";

  await prisma.cancellationFeedback.create({
    data: {
      userId: dataUserId,
      reason: reason.slice(0, 80),
      details,
      currentPlan: plan,
    },
  });
  revalidatePath("/dashboard/billing");
}

export async function saveBrandingSettingsForm(formData: FormData): Promise<void> {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (profile?.role !== UserRole.OWNER) return;

    const gate = await canUseFeature(user.id, "white_label");
    if (!gate.allowed) return;

    const brandColorHex = String(formData.get("brandColorHex") ?? "").trim() || null;
    const storefrontThemeKey =
      String(formData.get("storefrontThemeKey") ?? "").trim() || null;
    const customDomainHint =
      String(formData.get("customDomainHint") ?? "").trim() || null;
    const emailFooterBranding =
      String(formData.get("emailFooterBranding") ?? "").trim() || null;
    const hideKitchenOsBranding =
      String(formData.get("hideKitchenOsBranding") ?? "") === "on";

    const sub = await prisma.subscription.findUnique({
      where: { userId: dataUserId },
      select: { plan: true },
    });
    const allowHideBrand = sub?.plan === "ENTERPRISE";

    await prisma.kitchenSettings.update({
      where: { userId: dataUserId },
      data: {
        brandColorHex,
        storefrontThemeKey,
        customDomainHint,
        emailFooterBranding,
        hideKitchenOsBranding: allowHideBrand ? hideKitchenOsBranding : false,
      },
    });
    revalidatePath("/dashboard/settings/branding");
  } catch {
    /* settings row must exist */
  }
}

export async function createApiKeyForm(
  formData: FormData,
): Promise<{ ok: true; secret: string } | { error: string }> {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true, email: true },
    });
    const superOk = await isSuperAdminUser(user.id, profile?.email ?? user.email);
    if (profile?.role !== UserRole.OWNER && !superOk) {
      return { error: "Owner only." };
    }

    const gate = await canUseFeature(user.id, "api_access");
    if (!gate.allowed && !isBillingBypassed()) {
      return { error: "Enterprise plan required for API keys." };
    }

    const access = await getBillingAccess(user.id);
    if (!access.hasPaidSubscription && !access.devBypass && !isBillingBypassed()) {
      return { error: "Active subscription required." };
    }

    const name = String(formData.get("name") ?? "").trim().slice(0, 120);
    if (!name) return { error: "Name required." };

    const raw = `kos_${randomBytes(24).toString("base64url")}`;
    const prefix = raw.slice(0, 12);
    const keyHash = hashApiKey(raw);

    await prisma.apiKey.create({
      data: {
        userId: dataUserId,
        name,
        keyHash,
        prefix,
      },
    });

    revalidatePath("/dashboard/developer/api-keys");
    return { ok: true as const, secret: raw };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function revokeApiKeyById(id: string): Promise<void> {
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  if (!id) return;
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { role: true, email: true },
  });
  const superOk = await isSuperAdminUser(user.id, profile?.email ?? user.email);
  if (profile?.role !== UserRole.OWNER && !superOk) return;
  await prisma.apiKey.updateMany({
    where: { id, userId: dataUserId },
    data: { active: false, revokedAt: new Date() },
  });
  revalidatePath("/dashboard/developer/api-keys");
}

export const submitCancellationFeedbackFormAction = submitCancellationFeedbackForm;
export const saveBrandingSettingsFormAction = saveBrandingSettingsForm;
