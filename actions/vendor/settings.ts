"use server";

import { revalidatePath } from "next/cache";

import type { VendorPlanTier } from "@prisma/client";
import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import type {
  VendorNotificationPrefs,
  VendorProfileSettings,
  VendorTeamRole,
} from "@/lib/marketplace/vendor-settings-types";
import {
  addVendorComplianceDocument,
  addVendorWebhook,
  generateVendorApiKey,
  inviteVendorTeamMember,
  removeVendorTeamMember,
  removeVendorWebhook,
  requestVendorPlanUpgrade,
  updateVendorNotificationPrefs,
  updateVendorProfileSettings,
} from "@/services/marketplace/vendor-settings-service";

async function requireVendorSettingsWrite() {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };
  if (!access.canManageSettings) {
    return { ok: false as const, error: "You do not have permission to manage vendor settings." };
  }
  return { ok: true as const, access };
}

function revalidateVendorSettings() {
  revalidatePath("/vendor/settings");
  revalidatePath("/vendor/dashboard");
}

export async function updateVendorProfileSettingsAction(profile: VendorProfileSettings) {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await updateVendorProfileSettings(gate.access.vendorId, profile);
  if (result.ok) revalidateVendorSettings();
  return result;
}

export async function inviteVendorTeamMemberAction(input: { email: string; role: VendorTeamRole }) {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await inviteVendorTeamMember({
    vendorId: gate.access.vendorId,
    email: input.email,
    role: input.role,
  });
  if (result.ok) revalidateVendorSettings();
  return result;
}

export async function removeVendorTeamMemberAction(memberId: string) {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await removeVendorTeamMember(gate.access.vendorId, memberId);
  if (result.ok) revalidateVendorSettings();
  return result;
}

export async function updateVendorNotificationPrefsAction(notifications: VendorNotificationPrefs) {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await updateVendorNotificationPrefs(gate.access.vendorId, notifications);
  if (result.ok) revalidateVendorSettings();
  return result;
}

export async function generateVendorApiKeyAction() {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await generateVendorApiKey(gate.access.vendorId);
  if (result.ok) revalidateVendorSettings();
  return result;
}

export async function addVendorWebhookAction(input: { url: string; events: string[] }) {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await addVendorWebhook({ vendorId: gate.access.vendorId, ...input });
  if (result.ok) revalidateVendorSettings();
  return result;
}

export async function removeVendorWebhookAction(webhookId: string) {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await removeVendorWebhook(gate.access.vendorId, webhookId);
  if (result.ok) revalidateVendorSettings();
  return result;
}

export async function addVendorComplianceDocumentAction(input: {
  fileName: string;
  fileUrl?: string | null;
  category?: string | null;
}) {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await addVendorComplianceDocument(gate.access.vendorId, {
    fileName: input.fileName,
    fileUrl: input.fileUrl ?? null,
    category: input.category ?? null,
    uploadedAt: new Date().toISOString(),
  });
  if (result.ok) revalidateVendorSettings();
  return result;
}

export async function requestVendorPlanUpgradeAction(planTier: VendorPlanTier) {
  const gate = await requireVendorSettingsWrite();
  if (!gate.ok) return gate;

  const result = await requestVendorPlanUpgrade(gate.access.vendorId, planTier);
  if (result.ok) revalidateVendorSettings();
  return result;
}
