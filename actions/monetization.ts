"use server";


import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

import { hashApiKey } from "@/lib/api-public/auth";
import { requireBillingActor } from "@/lib/billing/require-billing-actor";
import { isBillingBypassed } from "@/lib/billing/dev-bypass";
import { getBillingAccess } from "@/lib/billing/access";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { logIntegrationPermissionDenied } from "@/services/integrations/integration-permission-audit";
import { logSettingsPermissionDenied } from "@/services/settings/settings-permission-audit";

async function requireApiKeyManageAccess(operation: string) {
  const access = await requireMutationPermission("integrations.manage");
  if (!access.ok) {
    await logIntegrationPermissionDenied(access.actor, {
      requiredPermission: "integrations.manage",
      operation,
    });
    return { ok: false as const, error: access.error };
  }
  return { ok: true as const, actor: access.actor };
}

async function requireBrandingSettingsAccess(operation: string) {
  const access = await requireMutationPermission("workspace.settings");
  if (!access.ok) {
    await logSettingsPermissionDenied(access.actor, {
      requiredPermission: "workspace.settings",
      operation,
    });
    return { ok: false as const };
  }
  return { ok: true as const };
}

export async function submitCancellationFeedbackForm(formData: FormData): Promise<void> {
  const access = await requireBillingActor("billing.cancel", {
    operation: "billing.cancellation_feedback",
  });
  if (!access.ok) return;
  const { userId: dataUserId } = access;

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
    const manage = await requireBrandingSettingsAccess("monetization.branding.save");
    if (!manage.ok) return;

    const { sessionUser: user, dataUserId } = await requireTenantActor();

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
    const manage = await requireApiKeyManageAccess("monetization.api_key.create");
    if (!manage.ok) return { error: manage.error };

    const { sessionUser: user, dataUserId } = await requireTenantActor();

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
  if (!id) return;

  const manage = await requireApiKeyManageAccess("monetization.api_key.revoke");
  if (!manage.ok) return;

  const { dataUserId } = await requireTenantActor();
  await prisma.apiKey.updateMany({
    where: { id, userId: dataUserId },
    data: { active: false, revokedAt: new Date() },
  });
  revalidatePath("/dashboard/developer/api-keys");
}

export const submitCancellationFeedbackFormAction = submitCancellationFeedbackForm;
export const saveBrandingSettingsFormAction = saveBrandingSettingsForm;
