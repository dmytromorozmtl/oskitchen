import type { VendorPlanTier } from "@prisma/client";

export type VendorTeamRole = "ADMIN" | "MANAGER" | "FINANCE" | "SUPPORT";

export type VendorTeamMember = {
  id: string;
  email: string;
  role: VendorTeamRole;
  invitedAt: string;
  status: "pending" | "active";
};

export type VendorWebhookConfig = {
  id: string;
  url: string;
  events: string[];
  secretPreview: string;
  createdAt: string;
  active: boolean;
};

export type VendorNotificationPrefs = {
  newOrderEmail: boolean;
  lowStockEmail: boolean;
  payoutEmail: boolean;
  messageEmail: boolean;
};

export type VendorComplianceDocument = {
  fileName: string;
  fileUrl?: string | null;
  uploadedAt: string;
  category?: string | null;
};

export type VendorProfileSettings = {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  deliveryZones: string[];
};

export type VendorCabinetSettingsDocument = {
  kind: "cabinet_settings";
  profile: VendorProfileSettings;
  team: VendorTeamMember[];
  notifications: VendorNotificationPrefs;
  webhooks: VendorWebhookConfig[];
  apiKeyPreview?: string | null;
  apiKeyCreatedAt?: string | null;
  apiKeyHash?: string | null;
  complianceDocuments: VendorComplianceDocument[];
  updatedAt: string;
};

export const DEFAULT_VENDOR_NOTIFICATIONS: VendorNotificationPrefs = {
  newOrderEmail: true,
  lowStockEmail: true,
  payoutEmail: true,
  messageEmail: true,
};

export const DEFAULT_VENDOR_PROFILE: VendorProfileSettings = {
  logoUrl: null,
  bannerUrl: null,
  description: null,
  deliveryZones: [],
};

export const VENDOR_TEAM_ROLE_OPTIONS: Array<{ value: VendorTeamRole; label: string }> = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "FINANCE", label: "Finance" },
  { value: "SUPPORT", label: "Support" },
];

export const VENDOR_PLAN_OPTIONS: Array<{
  value: VendorPlanTier;
  label: string;
  commission: string;
  detail: string;
}> = [
  { value: "FREE", label: "Free", commission: "5%", detail: "Catalog listing and basic vendor cabinet." },
  {
    value: "GROWTH",
    label: "Growth",
    commission: "3.5%",
    detail: "Featured slots, analytics exports, priority support.",
  },
  {
    value: "ENTERPRISE",
    label: "Enterprise",
    commission: "2%",
    detail: "API access, custom zones, dedicated success manager.",
  },
];

export const VENDOR_WEBHOOK_EVENTS = [
  "new_order",
  "order_cancelled",
  "inventory_low",
  "payout_processed",
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function defaultVendorCabinetSettings(): VendorCabinetSettingsDocument {
  return {
    kind: "cabinet_settings",
    profile: { ...DEFAULT_VENDOR_PROFILE, deliveryZones: [] },
    team: [],
    notifications: { ...DEFAULT_VENDOR_NOTIFICATIONS },
    webhooks: [],
    apiKeyPreview: null,
    apiKeyCreatedAt: null,
    complianceDocuments: [],
    updatedAt: new Date().toISOString(),
  };
}

export function parseVendorCabinetSettings(raw: unknown): VendorCabinetSettingsDocument {
  if (!Array.isArray(raw)) return defaultVendorCabinetSettings();
  const entry = raw.find(
    (item): item is VendorCabinetSettingsDocument =>
      isPlainObject(item) && item.kind === "cabinet_settings",
  );
  if (!entry) return defaultVendorCabinetSettings();

  return {
    kind: "cabinet_settings",
    profile: {
      logoUrl: typeof entry.profile?.logoUrl === "string" ? entry.profile.logoUrl : null,
      bannerUrl: typeof entry.profile?.bannerUrl === "string" ? entry.profile.bannerUrl : null,
      description: typeof entry.profile?.description === "string" ? entry.profile.description : null,
      deliveryZones: Array.isArray(entry.profile?.deliveryZones)
        ? entry.profile.deliveryZones.filter((zone): zone is string => typeof zone === "string")
        : [],
    },
    team: Array.isArray(entry.team)
      ? entry.team
          .filter((member): member is VendorTeamMember => isPlainObject(member) && typeof member.email === "string")
          .map((member) => ({
            id: typeof member.id === "string" ? member.id : crypto.randomUUID(),
            email: member.email,
            role: (["ADMIN", "MANAGER", "FINANCE", "SUPPORT"] as const).includes(member.role as VendorTeamRole)
              ? (member.role as VendorTeamRole)
              : "SUPPORT",
            invitedAt: typeof member.invitedAt === "string" ? member.invitedAt : new Date().toISOString(),
            status: member.status === "active" ? "active" : "pending",
          }))
      : [],
    notifications: {
      newOrderEmail: entry.notifications?.newOrderEmail !== false,
      lowStockEmail: entry.notifications?.lowStockEmail !== false,
      payoutEmail: entry.notifications?.payoutEmail !== false,
      messageEmail: entry.notifications?.messageEmail !== false,
    },
    webhooks: Array.isArray(entry.webhooks)
      ? entry.webhooks
          .filter((hook): hook is VendorWebhookConfig => isPlainObject(hook) && typeof hook.url === "string")
          .map((hook) => ({
            id: typeof hook.id === "string" ? hook.id : crypto.randomUUID(),
            url: hook.url,
            events: Array.isArray(hook.events)
              ? hook.events.filter((event): event is string => typeof event === "string")
              : [],
            secretPreview: typeof hook.secretPreview === "string" ? hook.secretPreview : "****",
            createdAt: typeof hook.createdAt === "string" ? hook.createdAt : new Date().toISOString(),
            active: hook.active !== false,
          }))
      : [],
    apiKeyPreview: typeof entry.apiKeyPreview === "string" ? entry.apiKeyPreview : null,
    apiKeyCreatedAt: typeof entry.apiKeyCreatedAt === "string" ? entry.apiKeyCreatedAt : null,
    apiKeyHash: typeof entry.apiKeyHash === "string" ? entry.apiKeyHash : null,
    complianceDocuments: Array.isArray(entry.complianceDocuments)
      ? entry.complianceDocuments
          .filter((doc): doc is VendorComplianceDocument => isPlainObject(doc) && typeof doc.fileName === "string")
          .map((doc) => ({
            fileName: doc.fileName,
            fileUrl: typeof doc.fileUrl === "string" ? doc.fileUrl : null,
            uploadedAt: typeof doc.uploadedAt === "string" ? doc.uploadedAt : new Date().toISOString(),
            category: typeof doc.category === "string" ? doc.category : null,
          }))
      : [],
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
  };
}

export function mergeCabinetSettingsIntoDocuments(
  documents: unknown,
  settings: VendorCabinetSettingsDocument,
): unknown[] {
  const list = Array.isArray(documents) ? documents.filter((doc) => !isPlainObject(doc) || doc.kind !== "cabinet_settings") : [];
  return [...list, settings];
}
