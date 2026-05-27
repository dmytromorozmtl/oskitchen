"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSettingsCenterMutation } from "@/lib/settings/require-settings-center-mutation";
import { prisma } from "@/lib/prisma";
import {
  DAY_KEYS,
  type BusinessHoursSettings,
  type SettingsCenterPayload,
} from "@/lib/settings/settings-defaults";
import {
  loadSettingsCenter,
  updateSettingsCenterSection,
  updateSettingsCenterSections,
} from "@/services/settings/settings-center-service";
import { getBusinessModePreset } from "@/lib/settings/business-mode-presets";
import {
  getOperatingModeForBusinessType,
  toPrismaOperatingMode,
} from "@/lib/operating-modes/resolver";
import type { BusinessType } from "@prisma/client";

const settingsRevalidatePaths = [
  "/dashboard/settings",
  "/dashboard/settings/workspace",
  "/dashboard/settings/operations",
  "/dashboard/settings/orders",
  "/dashboard/settings/production",
  "/dashboard/settings/packing",
  "/dashboard/settings/delivery",
  "/dashboard/settings/routes",
  "/dashboard/settings/crm",
  "/dashboard/settings/ai",
  "/dashboard/settings/automation",
  "/dashboard/settings/backups",
  "/dashboard/settings/compliance",
  "/dashboard/settings/developer",
  "/dashboard/settings/advanced",
];

function revalidateAll(): void {
  for (const p of settingsRevalidatePaths) revalidatePath(p);
}

export type ActionResult<T = void> =
  | { ok: true; value?: T }
  | { ok: false; error: string };

function ok<T>(value?: T): ActionResult<T> {
  return { ok: true, value };
}
function err(message: string): ActionResult<never> {
  return { ok: false, error: message };
}

// ---------- Workspace identity ----------
const WorkspaceIdentitySchema = z.object({
  legalName: z.string().trim().max(255).optional().nullable(),
  doingBusinessAs: z.string().trim().max(255).optional().nullable(),
  businessNumber: z.string().trim().max(80).optional().nullable(),
  taxIds: z.object({
    gst: z.string().trim().max(80).optional().nullable(),
    qst: z.string().trim().max(80).optional().nullable(),
    vat: z.string().trim().max(80).optional().nullable(),
    other: z.string().trim().max(80).optional().nullable(),
  }),
  supportEmail: z.string().trim().email().optional().or(z.literal("")).nullable(),
  supportPhone: z.string().trim().max(60).optional().nullable(),
  website: z.string().trim().max(500).optional().or(z.literal("")).nullable(),
  socialLinks: z.object({
    instagram: z.string().trim().max(255).optional().nullable(),
    facebook: z.string().trim().max(255).optional().nullable(),
    tiktok: z.string().trim().max(255).optional().nullable(),
    x: z.string().trim().max(255).optional().nullable(),
    linkedin: z.string().trim().max(255).optional().nullable(),
  }),
  invoiceFooter: z.string().trim().max(2_000).optional().nullable(),
  operatingLanguage: z.string().trim().min(2).max(8).default("en"),
  defaultTaxRulesNote: z.string().trim().max(2_000).optional().nullable(),
  // Also pulled to KitchenSettings scalar columns for back-compat:
  businessName: z.string().trim().max(255).optional().nullable(),
  currency: z.string().trim().min(2).max(8).optional().nullable(),
  timezone: z.string().trim().max(80).optional().nullable(),
  country: z.string().trim().max(120).optional().nullable(),
  locale: z.string().trim().min(2).max(8).optional().nullable(),
});
export type WorkspaceIdentityInput = z.infer<typeof WorkspaceIdentitySchema>;

export async function saveWorkspaceIdentity(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_workspace", "settings.workspace_identity.save");
  if (!gate.ok) return err(gate.error);
  const parsed = WorkspaceIdentitySchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "invalid_input");
  const v = parsed.data;
  const current = await loadSettingsCenter(gate.userId);
  const nextIdentity = {
    ...current.payload.workspaceIdentity,
    legalName: v.legalName ?? null,
    doingBusinessAs: v.doingBusinessAs ?? null,
    businessNumber: v.businessNumber ?? null,
    taxIds: {
      gst: v.taxIds.gst ?? null,
      qst: v.taxIds.qst ?? null,
      vat: v.taxIds.vat ?? null,
      other: v.taxIds.other ?? null,
    },
    supportEmail: v.supportEmail || null,
    supportPhone: v.supportPhone ?? null,
    website: v.website || null,
    socialLinks: {
      instagram: v.socialLinks.instagram ?? null,
      facebook: v.socialLinks.facebook ?? null,
      tiktok: v.socialLinks.tiktok ?? null,
      x: v.socialLinks.x ?? null,
      linkedin: v.socialLinks.linkedin ?? null,
    },
    invoiceFooter: v.invoiceFooter ?? null,
    operatingLanguage: v.operatingLanguage,
    defaultTaxRulesNote: v.defaultTaxRulesNote ?? null,
  };
  await updateSettingsCenterSection(gate.userId, "workspaceIdentity", nextIdentity);
  await prisma.kitchenSettings.upsert({
    where: { userId: gate.userId },
    create: {
      userId: gate.userId,
      businessName: v.businessName ?? v.legalName ?? null,
      currency: v.currency ?? "USD",
      timezone: v.timezone ?? "UTC",
      country: v.country ?? null,
      locale: v.locale ?? "en",
    },
    update: {
      businessName: v.businessName ?? v.legalName ?? undefined,
      currency: v.currency ?? undefined,
      timezone: v.timezone ?? undefined,
      country: v.country ?? null,
      locale: v.locale ?? undefined,
    },
  });
  revalidateAll();
  return ok();
}

// ---------- Business hours ----------
const BusinessHoursSchema = z.record(
  z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
    close: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
    closed: z.boolean(),
  }),
);

export async function saveBusinessHours(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_workspace", "settings.business_hours.save");
  if (!gate.ok) return err(gate.error);
  const parsed = BusinessHoursSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  const next: BusinessHoursSettings = { ...parsed.data } as BusinessHoursSettings;
  for (const day of DAY_KEYS) {
    if (!next[day]) next[day] = { open: null, close: null, closed: true };
  }
  await updateSettingsCenterSection(gate.userId, "businessHours", next);
  revalidateAll();
  return ok();
}

// ---------- Operations ----------
const OperationsSchema = z.object({
  prepLeadHours: z.coerce.number().min(0).max(720),
  productionCutoffMinutesBeforeFulfillment: z.coerce.number().min(0).max(10_000),
  sameDayOrdersEnabled: z.boolean(),
  rushOrderSurchargePercent: z.coerce.number().min(0).max(100),
  defaultFulfillmentWindowMinutes: z.coerce.number().min(5).max(720),
  stations: z.array(z.string().min(1).max(60)).max(40),
  kitchenZones: z.array(z.string().min(1).max(60)).max(40),
  prepCapacityPerHour: z.coerce.number().min(0).max(10_000),
  qcRequiredForPacking: z.boolean(),
  allergenProtocol: z.enum(["standard", "strict", "custom"]),
});

export async function saveOperationsSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_operations", "settings.operations.save");
  if (!gate.ok) return err(gate.error);
  const parsed = OperationsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "operations", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Order settings ----------
const OrderSettingsSchema = z.object({
  autoConfirmManualOrders: z.boolean(),
  requireApprovalForCateringOrders: z.boolean(),
  minOrderValue: z.coerce.number().min(0).max(100_000),
  allowedPaymentModes: z.array(z.string().min(1).max(40)).max(20),
  cancellationWindowHours: z.coerce.number().min(0).max(720),
  refundWindowDays: z.coerce.number().min(0).max(365),
  fraudCheckEnabled: z.boolean(),
  delayedOrderEscalationMinutes: z.coerce.number().min(0).max(720),
  preorderRequiresMenu: z.boolean(),
});

export async function saveOrderSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_orders", "settings.orders.save");
  if (!gate.ok) return err(gate.error);
  const parsed = OrderSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "orders", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Production ----------
const ProductionSettingsSchema = z.object({
  shifts: z.array(z.object({
    label: z.string().min(1).max(40),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  })).max(12),
  batchSizingMode: z.enum(["auto_group", "manual", "per_recipe"]),
  defaultBatchSize: z.coerce.number().min(1).max(10_000),
  autoPrintTickets: z.boolean(),
  stationColorMap: z.record(z.string(), z.string().max(20)),
  productionSLAMinutes: z.coerce.number().min(0).max(10_000),
  notifyKitchenOnShortage: z.boolean(),
});

export async function saveProductionSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_production", "settings.production.save");
  if (!gate.ok) return err(gate.error);
  const parsed = ProductionSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "production", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Packing ----------
const PackingSettingsSchema = z.object({
  stages: z.array(z.string().min(1).max(40)).max(20),
  qcRequired: z.boolean(),
  labelTemplate: z.enum(["default", "compact", "with_allergen_warning"]),
  printerProfile: z.string().max(120).nullable(),
  scanToVerify: z.boolean(),
  blockHandoffOnFailedQc: z.boolean(),
});

export async function savePackingSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_packing", "settings.packing.save");
  if (!gate.ok) return err(gate.error);
  const parsed = PackingSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "packing", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Delivery ----------
const DeliverySettingsSchema = z.object({
  enabled: z.boolean(),
  deliveryRadiusKm: z.coerce.number().min(0).max(10_000),
  baseFee: z.coerce.number().min(0).max(10_000),
  perKmFee: z.coerce.number().min(0).max(1_000),
  freeDeliveryThreshold: z.coerce.number().min(0).max(100_000),
  dispatchWindowMinutes: z.coerce.number().min(0).max(720),
  driverAssignmentMode: z.enum(["manual", "auto_nearest", "round_robin"]),
  externalCourierPreference: z.enum(["none", "uber_direct", "doordash_drive"]),
  smsCustomerOnDispatch: z.boolean(),
});

export async function saveDeliverySettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_delivery", "settings.delivery.save");
  if (!gate.ok) return err(gate.error);
  const parsed = DeliverySettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  const next = parsed.data;
  await updateSettingsCenterSection(gate.userId, "delivery", next);
  await prisma.kitchenSettings.update({
    where: { userId: gate.userId },
    data: {
      deliveryEnabled: next.enabled,
      deliveryRadiusKm: Math.round(next.deliveryRadiusKm),
      deliveryFee: next.baseFee,
    },
  }).catch(() => undefined);
  revalidateAll();
  return ok();
}

// ---------- Routes ----------
const RouteSettingsSchema = z.object({
  optimizationMode: z.enum(["shortest_distance", "shortest_time", "balanced_load"]),
  maxStopsPerRoute: z.coerce.number().min(1).max(200),
  driverStartLocationName: z.string().max(120).nullable(),
  bufferMinutesBetweenStops: z.coerce.number().min(0).max(120),
});

export async function saveRouteSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_routes", "settings.routes.save");
  if (!gate.ok) return err(gate.error);
  const parsed = RouteSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "routes", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- CRM ----------
const CrmSettingsSchema = z.object({
  vipLifetimeSpend: z.coerce.number().min(0).max(1_000_000),
  vipOrderCount: z.coerce.number().min(0).max(10_000),
  churnInactiveDays: z.coerce.number().min(1).max(3650),
  loyaltyMode: z.enum(["none", "punch_card", "points"]),
  loyaltyPointsPerCurrency: z.coerce.number().min(0).max(1_000),
  autoFollowUpEnabled: z.boolean(),
  birthdayRewardEnabled: z.boolean(),
  customerTags: z.array(z.string().min(1).max(40)).max(40),
});

export async function saveCrmSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_crm", "settings.crm.save");
  if (!gate.ok) return err(gate.error);
  const parsed = CrmSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "crm", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- AI ----------
const AiSettingsSchema = z.object({
  assistantEnabled: z.boolean(),
  summariesEnabled: z.boolean(),
  forecastingEnabled: z.boolean(),
  tokenCapPerDay: z.coerce.number().min(0).max(10_000_000),
  costAlertCents: z.coerce.number().min(0).max(10_000_000),
  promptPresets: z.array(z.object({
    label: z.string().min(1).max(80),
    prompt: z.string().min(1).max(4_000),
  })).max(20),
});

export async function saveAiSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_ai", "settings.ai.save");
  if (!gate.ok) return err(gate.error);
  const parsed = AiSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "ai", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Automation ----------
const AutomationSettingsSchema = z.object({
  enabled: z.boolean(),
  defaultRetryAttempts: z.coerce.number().min(0).max(20),
  retryBackoffSeconds: z.coerce.number().min(0).max(3_600),
  pauseOnFailure: z.boolean(),
});

export async function saveAutomationSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_automation", "settings.automation.save");
  if (!gate.ok) return err(gate.error);
  const parsed = AutomationSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "automation", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Backups ----------
const BackupsSettingsSchema = z.object({
  scheduledBackupsEnabled: z.boolean(),
  retentionDays: z.coerce.number().min(1).max(3650),
  includeAttachments: z.boolean(),
  snapshotBeforeImports: z.boolean(),
});

export async function saveBackupsSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_imports", "settings.backups.save");
  if (!gate.ok) return err(gate.error);
  const parsed = BackupsSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "backups", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Compliance ----------
const ComplianceSettingsSchema = z.object({
  jurisdiction: z.enum(["gdpr", "pipeda", "ccpa", "other"]),
  dataRetentionDays: z.coerce.number().min(0).max(3650),
  privacyPolicyUrl: z.string().max(500).nullable(),
  termsOfServiceUrl: z.string().max(500).nullable(),
  cookieConsentRequired: z.boolean(),
  allergenDisclaimer: z.string().max(4_000).nullable(),
  nutritionDisclaimer: z.string().max(4_000).nullable(),
});

export async function saveComplianceSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_compliance", "settings.compliance.save");
  if (!gate.ok) return err(gate.error);
  const parsed = ComplianceSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "compliance", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Developer ----------
const DeveloperSettingsSchema = z.object({
  debugLogging: z.boolean(),
  featureFlagPreviews: z.boolean(),
  audit_traces: z.boolean(),
});

export async function saveDeveloperSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_developer", "settings.developer.save");
  if (!gate.ok) return err(gate.error);
  const parsed = DeveloperSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "developer", parsed.data);
  revalidateAll();
  return ok();
}

// ---------- Advanced ----------
const AdvancedSettingsSchema = z.object({
  workspaceArchived: z.boolean(),
  transferContactEmail: z.string().email().nullable().or(z.literal("")),
});

export async function saveAdvancedSettings(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_advanced", "settings.advanced.save");
  if (!gate.ok) return err(gate.error);
  const parsed = AdvancedSettingsSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  await updateSettingsCenterSection(gate.userId, "advanced", {
    workspaceArchived: parsed.data.workspaceArchived,
    transferContactEmail: parsed.data.transferContactEmail || null,
  });
  revalidateAll();
  return ok();
}

// ---------- Business mode apply ----------
const ApplyBusinessModeSchema = z.object({
  type: z.enum([
    "MEAL_PREP",
    "CATERING",
    "GHOST_KITCHEN",
    "CLOUD_KITCHEN",
    "MULTI_BRAND",
    "BAKERY",
    "RESTAURANT",
    "CAFE",
    "BAR",
    "OTHER",
  ]),
});

export async function applyBusinessModePreset(input: unknown): Promise<ActionResult> {
  const gate = await requireSettingsCenterMutation("manage_workspace", "settings.business_mode.apply");
  if (!gate.ok) return err(gate.error);
  const parsed = ApplyBusinessModeSchema.safeParse(input);
  if (!parsed.success) return err("invalid_input");
  const preset = getBusinessModePreset(parsed.data.type as BusinessType);
  const operatingMode = getOperatingModeForBusinessType(parsed.data.type);
  await prisma.kitchenSettings.upsert({
    where: { userId: gate.userId },
    create: {
      userId: gate.userId,
      businessType: parsed.data.type as BusinessType,
      operatingMode: toPrismaOperatingMode(operatingMode),
    },
    update: {
      businessType: parsed.data.type as BusinessType,
      operatingMode: toPrismaOperatingMode(operatingMode),
    },
  });
  const current = await loadSettingsCenter(gate.userId);
  const patch: Partial<SettingsCenterPayload> = {
    operations: {
      ...current.payload.operations,
      sameDayOrdersEnabled: preset.defaults.sameDayOrders,
    },
    orders: {
      ...current.payload.orders,
      requireApprovalForCateringOrders: preset.defaults.requireApprovalForCateringOrders,
      preorderRequiresMenu: preset.defaults.preorderRequiresMenu,
    },
    delivery: {
      ...current.payload.delivery,
      enabled: preset.defaults.deliveryEnabled,
    },
  };
  await updateSettingsCenterSections(gate.userId, patch);
  revalidateAll();
  return ok();
}
