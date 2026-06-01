import { createHash, randomBytes } from "crypto";

import type { VendorPlanTier } from "@prisma/client";

import { extractRegistrationMeta, parseVendorDocuments } from "@/lib/marketplace/vendor-registration-types";
import {
  defaultVendorCabinetSettings,
  mergeCabinetSettingsIntoDocuments,
  parseVendorCabinetSettings,
  type VendorCabinetSettingsDocument,
  type VendorComplianceDocument,
  type VendorNotificationPrefs,
  type VendorProfileSettings,
  type VendorTeamMember,
  type VendorTeamRole,
  type VendorWebhookConfig,
} from "@/lib/marketplace/vendor-settings-types";
import { prisma } from "@/lib/prisma";

export type VendorSettingsModel = {
  vendorId: string;
  companyName: string;
  legalName: string;
  planTier: VendorPlanTier;
  commissionRate: number;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  settings: VendorCabinetSettingsDocument;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function loadVendorSettings(vendorId: string): Promise<VendorSettingsModel | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      companyName: true,
      legalName: true,
      planTier: true,
      commissionRate: true,
      documents: true,
    },
  });

  if (!vendor) return null;

  const docs = parseVendorDocuments(vendor.documents);
  const meta = extractRegistrationMeta(docs);
  const settings = parseVendorCabinetSettings(vendor.documents);
  const { apiKeyHash: _hash, ...publicSettings } = settings;

  return {
    vendorId: vendor.id,
    companyName: vendor.companyName,
    legalName: vendor.legalName,
    planTier: vendor.planTier,
    commissionRate: decimalToNumber(vendor.commissionRate),
    contactEmail: meta.contactEmail,
    contactPhone: meta.contactPhone,
    website: meta.website,
    settings: publicSettings,
  };
}

async function persistVendorSettings(
  vendorId: string,
  patch: Partial<VendorCabinetSettingsDocument>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { documents: true },
  });
  if (!vendor) return { ok: false as const, error: "Vendor not found." };

  const existing = parseVendorCabinetSettings(vendor.documents);
  const nextSettings: VendorCabinetSettingsDocument = {
    ...existing,
    ...patch,
    kind: "cabinet_settings",
    profile: patch.profile ?? existing.profile,
    team: patch.team ?? existing.team,
    notifications: patch.notifications ?? existing.notifications,
    webhooks: patch.webhooks ?? existing.webhooks,
    complianceDocuments: patch.complianceDocuments ?? existing.complianceDocuments,
    updatedAt: new Date().toISOString(),
  };
  const documents = mergeCabinetSettingsIntoDocuments(vendor.documents, nextSettings);

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { documents },
  });

  return { ok: true as const };
}

export async function updateVendorProfileSettings(
  vendorId: string,
  profile: VendorProfileSettings,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await loadVendorSettings(vendorId);
  if (!current) return { ok: false, error: "Vendor not found." };

  return persistVendorSettings(vendorId, {
    profile: {
      logoUrl: profile.logoUrl?.trim() || null,
      bannerUrl: profile.bannerUrl?.trim() || null,
      description: profile.description?.trim() || null,
      deliveryZones: profile.deliveryZones.map((zone) => zone.trim()).filter(Boolean),
    },
  });
}

export async function inviteVendorTeamMember(input: {
  vendorId: string;
  email: string;
  role: VendorTeamRole;
}): Promise<{ ok: true; member: VendorTeamMember } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Valid email is required." };

  const current = await loadVendorSettings(input.vendorId);
  if (!current) return { ok: false, error: "Vendor not found." };

  if (current.settings.team.some((member) => member.email === email)) {
    return { ok: false, error: "This teammate is already invited." };
  }

  const member: VendorTeamMember = {
    id: randomBytes(8).toString("hex"),
    email,
    role: input.role,
    invitedAt: new Date().toISOString(),
    status: "pending",
  };

  const result = await persistVendorSettings(input.vendorId, {
    team: [...current.settings.team, member],
  });

  if (!result.ok) return result;
  return { ok: true, member };
}

export async function removeVendorTeamMember(
  vendorId: string,
  memberId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await loadVendorSettings(vendorId);
  if (!current) return { ok: false, error: "Vendor not found." };

  return persistVendorSettings(vendorId, {
    team: current.settings.team.filter((member) => member.id !== memberId),
  });
}

export async function updateVendorNotificationPrefs(
  vendorId: string,
  notifications: VendorNotificationPrefs,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await loadVendorSettings(vendorId);
  if (!current) return { ok: false, error: "Vendor not found." };

  return persistVendorSettings(vendorId, { notifications });
}

export async function generateVendorApiKey(
  vendorId: string,
): Promise<{ ok: true; apiKey: string; preview: string } | { ok: false; error: string }> {
  const current = await loadVendorSettings(vendorId);
  if (!current) return { ok: false, error: "Vendor not found." };

  const raw = `vk_${randomBytes(24).toString("hex")}`;
  const preview = `${raw.slice(0, 7)}…${raw.slice(-4)}`;
  const hash = hashApiKey(raw);

  const result = await persistVendorSettings(vendorId, {
    apiKeyPreview: preview,
    apiKeyCreatedAt: new Date().toISOString(),
    apiKeyHash: hash,
  });

  if (!result.ok) return result;
  return { ok: true, apiKey: raw, preview };
}

export async function addVendorWebhook(input: {
  vendorId: string;
  url: string;
  events: string[];
}): Promise<{ ok: true; webhook: VendorWebhookConfig; secret: string } | { ok: false; error: string }> {
  const url = input.url.trim();
  if (!url.startsWith("https://")) {
    return { ok: false, error: "Webhook URL must use HTTPS." };
  }

  const current = await loadVendorSettings(input.vendorId);
  if (!current) return { ok: false, error: "Vendor not found." };

  const secret = `whsec_${randomBytes(16).toString("hex")}`;
  const webhook: VendorWebhookConfig = {
    id: randomBytes(8).toString("hex"),
    url,
    events: input.events.filter(Boolean),
    secretPreview: `…${secret.slice(-6)}`,
    createdAt: new Date().toISOString(),
    active: true,
  };

  const result = await persistVendorSettings(input.vendorId, {
    webhooks: [...current.settings.webhooks, webhook],
  });

  if (!result.ok) return result;
  return { ok: true, webhook, secret };
}

export async function removeVendorWebhook(
  vendorId: string,
  webhookId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await loadVendorSettings(vendorId);
  if (!current) return { ok: false, error: "Vendor not found." };

  return persistVendorSettings(vendorId, {
    webhooks: current.settings.webhooks.filter((hook) => hook.id !== webhookId),
  });
}

export async function addVendorComplianceDocument(
  vendorId: string,
  doc: VendorComplianceDocument,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await loadVendorSettings(vendorId);
  if (!current) return { ok: false, error: "Vendor not found." };

  return persistVendorSettings(vendorId, {
    complianceDocuments: [
      ...current.settings.complianceDocuments,
      { ...doc, uploadedAt: doc.uploadedAt || new Date().toISOString() },
    ],
  });
}

export async function requestVendorPlanUpgrade(
  vendorId: string,
  planTier: VendorPlanTier,
): Promise<{ ok: true; planTier: VendorPlanTier } | { ok: false; error: string }> {
  const { upgradePlan } = await import("@/services/marketplace/billing-integration-service");
  const result = await upgradePlan(vendorId, planTier);
  if (!result.ok) return result;
  return { ok: true, planTier: result.planTier };
}

export function validateVendorApiKey(documents: unknown, apiKey: string): boolean {
  const settings = parseVendorCabinetSettings(documents);
  if (!settings.apiKeyHash) return false;
  return hashApiKey(apiKey) === settings.apiKeyHash;
}
