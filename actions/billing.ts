"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserProfile } from "@/lib/auth";
import { canAssignBillingMode } from "@/lib/auth/is-superadmin";
import {
  billingCapabilityToPermissionKey,
  canUseBilling,
  type BillingActorScope,
  type BillingCapability,
} from "@/lib/billing/billing-permissions";
import { FEATURE_FLAGS } from "@/lib/billing/entitlements";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { logBillingPermissionDenied } from "@/services/billing/billing-permission-audit";
import {
  clearEntitlementOverride,
  setEntitlementOverride,
} from "@/services/billing/entitlement-service";
import { adminAssignPlan } from "@/services/billing/subscription-service";

function scopeFrom(p: { role: string | null; email: string | null }): BillingActorScope {
  return { role: p.role, email: p.email };
}

async function gate(cap: BillingCapability) {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = scopeFrom({ role: profile.role ?? null, email: profile.email ?? null });
  const requiredPermission = billingCapabilityToPermissionKey(cap);
  const access = await requireMutationPermission(requiredPermission);
  if (!access.ok) {
    await logBillingPermissionDenied(access.actor, {
      requiredPermission,
      billingCapability: cap,
      operation: cap,
    });
    throw new Error(access.error);
  }
  if (!canUseBilling(scope, cap, { granted: actor.granted })) {
    await logBillingPermissionDenied(actor, {
      requiredPermission,
      billingCapability: cap,
      operation: cap,
    });
    throw new Error(`You do not have permission to ${cap}.`);
  }
  return { userId: actor.userId, profileId: profile.id };
}

async function gateBillingModeAssign() {
  const { userId } = await requireTenantActor();
  const profile = await requireUserProfile();
  const scope = scopeFrom({ role: profile.role ?? null, email: profile.email ?? null });
  if (!canAssignBillingMode(scope)) {
    throw new Error("Unauthorized: superadmin required to assign plan or billing mode.");
  }
  return { userId, profileId: profile.id };
}

const overrideSchema = z.object({
  featureKey: z.enum(FEATURE_FLAGS as unknown as [typeof FEATURE_FLAGS[number], ...typeof FEATURE_FLAGS[number][]]),
  value: z.enum(["true", "false"]),
  reason: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
});

export async function setEntitlementOverrideAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("billing.override.write");
  const parsed = overrideSchema.parse({
    featureKey: formData.get("featureKey"),
    value: formData.get("value") ?? "true",
    reason: (formData.get("reason") as string) || undefined,
    expiresAt: (formData.get("expiresAt") as string) || undefined,
  });
  await setEntitlementOverride({
    userId,
    featureKey: parsed.featureKey,
    value: parsed.value === "true",
    reason: parsed.reason ?? null,
    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    createdById: profileId,
  });
  revalidatePath("/dashboard/billing/entitlements");
  revalidatePath("/dashboard/billing");
}

const clearOverrideSchema = z.object({
  featureKey: z.enum(FEATURE_FLAGS as unknown as [typeof FEATURE_FLAGS[number], ...typeof FEATURE_FLAGS[number][]]),
});

export async function clearEntitlementOverrideAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("billing.override.write");
  const parsed = clearOverrideSchema.parse({ featureKey: formData.get("featureKey") });
  await clearEntitlementOverride({
    userId,
    featureKey: parsed.featureKey,
    performedById: profileId,
  });
  revalidatePath("/dashboard/billing/entitlements");
}

const modeSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "TEAM", "ENTERPRISE"]).optional(),
  billingMode: z.enum(["STRIPE", "MANUAL", "INTERNAL_FREE", "ENTERPRISE_CONTRACT", "DEV_DISABLED"]).optional(),
  statusDetail: z.enum(["ACTIVE", "TRIALING", "INTERNAL", "CANCELLED", "PAUSED"]).optional(),
});

export async function adminAssignPlanAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gateBillingModeAssign();
  const parsed = modeSchema.parse({
    plan: (formData.get("plan") as string) || undefined,
    billingMode: (formData.get("billingMode") as string) || undefined,
    statusDetail: (formData.get("statusDetail") as string) || undefined,
  });
  await adminAssignPlan({
    userId,
    performedById: profileId,
    plan: parsed.plan ?? null,
    billingMode: parsed.billingMode ?? null,
    statusDetail: parsed.statusDetail ?? null,
  });
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/billing/settings");
}
