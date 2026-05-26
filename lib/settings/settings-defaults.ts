/**
 * Default + schema definitions for `KitchenSettings.settingsCenterJson`.
 * Always merge user-provided values with the defaults at read-time so missing
 * keys never crash the UI. Keep this file pure (no Prisma, no React).
 */

export type WorkspaceIdentitySettings = {
  legalName: string | null;
  doingBusinessAs: string | null;
  businessNumber: string | null;
  taxIds: {
    gst: string | null;
    qst: string | null;
    vat: string | null;
    other: string | null;
  };
  supportEmail: string | null;
  supportPhone: string | null;
  website: string | null;
  socialLinks: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    x: string | null;
    linkedin: string | null;
  };
  invoiceFooter: string | null;
  operatingLanguage: string;
  defaultTaxRulesNote: string | null;
};

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAY_KEYS: readonly DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export type BusinessHourEntry = {
  open: string | null;
  close: string | null;
  closed: boolean;
};

export type BusinessHoursSettings = Record<DayKey, BusinessHourEntry>;

export type OperationsSettings = {
  prepLeadHours: number;
  productionCutoffMinutesBeforeFulfillment: number;
  sameDayOrdersEnabled: boolean;
  rushOrderSurchargePercent: number;
  defaultFulfillmentWindowMinutes: number;
  stations: string[];
  kitchenZones: string[];
  prepCapacityPerHour: number;
  qcRequiredForPacking: boolean;
  allergenProtocol: "standard" | "strict" | "custom";
};

export type OrderSettings = {
  autoConfirmManualOrders: boolean;
  requireApprovalForCateringOrders: boolean;
  minOrderValue: number;
  allowedPaymentModes: string[];
  cancellationWindowHours: number;
  refundWindowDays: number;
  fraudCheckEnabled: boolean;
  delayedOrderEscalationMinutes: number;
  preorderRequiresMenu: boolean;
};

export type ProductionSettings = {
  shifts: { label: string; start: string; end: string }[];
  batchSizingMode: "auto_group" | "manual" | "per_recipe";
  defaultBatchSize: number;
  autoPrintTickets: boolean;
  stationColorMap: Record<string, string>;
  productionSLAMinutes: number;
  notifyKitchenOnShortage: boolean;
};

export type PackingSettings = {
  stages: string[];
  qcRequired: boolean;
  labelTemplate: "default" | "compact" | "with_allergen_warning";
  printerProfile: string | null;
  scanToVerify: boolean;
  blockHandoffOnFailedQc: boolean;
};

export type DeliverySettings = {
  enabled: boolean;
  deliveryRadiusKm: number;
  baseFee: number;
  perKmFee: number;
  freeDeliveryThreshold: number;
  dispatchWindowMinutes: number;
  driverAssignmentMode: "manual" | "auto_nearest" | "round_robin";
  externalCourierPreference: "none" | "uber_direct" | "doordash_drive";
  smsCustomerOnDispatch: boolean;
};

export type RouteSettings = {
  optimizationMode: "shortest_distance" | "shortest_time" | "balanced_load";
  maxStopsPerRoute: number;
  driverStartLocationName: string | null;
  bufferMinutesBetweenStops: number;
};

export type CrmSettings = {
  vipLifetimeSpend: number;
  vipOrderCount: number;
  churnInactiveDays: number;
  loyaltyMode: "none" | "punch_card" | "points";
  loyaltyPointsPerCurrency: number;
  autoFollowUpEnabled: boolean;
  birthdayRewardEnabled: boolean;
  customerTags: string[];
};

export type AutomationSettings = {
  enabled: boolean;
  defaultRetryAttempts: number;
  retryBackoffSeconds: number;
  pauseOnFailure: boolean;
};

export type AiSettings = {
  assistantEnabled: boolean;
  summariesEnabled: boolean;
  forecastingEnabled: boolean;
  tokenCapPerDay: number;
  costAlertCents: number;
  promptPresets: { label: string; prompt: string }[];
};

export type BackupsSettings = {
  scheduledBackupsEnabled: boolean;
  retentionDays: number;
  includeAttachments: boolean;
  snapshotBeforeImports: boolean;
};

export type ComplianceSettings = {
  jurisdiction: "gdpr" | "pipeda" | "ccpa" | "other";
  dataRetentionDays: number;
  privacyPolicyUrl: string | null;
  termsOfServiceUrl: string | null;
  cookieConsentRequired: boolean;
  allergenDisclaimer: string | null;
  nutritionDisclaimer: string | null;
};

export type DeveloperSettings = {
  debugLogging: boolean;
  featureFlagPreviews: boolean;
  audit_traces: boolean;
};

export type AdvancedSettings = {
  workspaceArchived: boolean;
  /** Optional contact email used for ownership transfer requests. */
  transferContactEmail: string | null;
};

export type SettingsCenterPayload = {
  /** Bumped whenever the shape changes — read-time merge inspects this. */
  version: number;
  workspaceIdentity: WorkspaceIdentitySettings;
  businessHours: BusinessHoursSettings;
  operations: OperationsSettings;
  orders: OrderSettings;
  production: ProductionSettings;
  packing: PackingSettings;
  delivery: DeliverySettings;
  routes: RouteSettings;
  crm: CrmSettings;
  automation: AutomationSettings;
  ai: AiSettings;
  backups: BackupsSettings;
  compliance: ComplianceSettings;
  developer: DeveloperSettings;
  advanced: AdvancedSettings;
};

export const DEFAULT_SETTINGS_CENTER: SettingsCenterPayload = {
  version: 1,
  workspaceIdentity: {
    legalName: null,
    doingBusinessAs: null,
    businessNumber: null,
    taxIds: { gst: null, qst: null, vat: null, other: null },
    supportEmail: null,
    supportPhone: null,
    website: null,
    socialLinks: { instagram: null, facebook: null, tiktok: null, x: null, linkedin: null },
    invoiceFooter: null,
    operatingLanguage: "en",
    defaultTaxRulesNote: null,
  },
  businessHours: DAY_KEYS.reduce((acc, day) => {
    acc[day] = { open: "09:00", close: "17:00", closed: day === "sunday" };
    return acc;
  }, {} as BusinessHoursSettings),
  operations: {
    prepLeadHours: 24,
    productionCutoffMinutesBeforeFulfillment: 120,
    sameDayOrdersEnabled: false,
    rushOrderSurchargePercent: 0,
    defaultFulfillmentWindowMinutes: 30,
    stations: ["Cold prep", "Hot line", "Bakery", "Pack"],
    kitchenZones: ["Front", "Back"],
    prepCapacityPerHour: 50,
    qcRequiredForPacking: true,
    allergenProtocol: "standard",
  },
  orders: {
    autoConfirmManualOrders: false,
    requireApprovalForCateringOrders: true,
    minOrderValue: 0,
    allowedPaymentModes: ["pay_later", "manual_invoice"],
    cancellationWindowHours: 24,
    refundWindowDays: 7,
    fraudCheckEnabled: false,
    delayedOrderEscalationMinutes: 30,
    preorderRequiresMenu: true,
  },
  production: {
    shifts: [
      { label: "Morning", start: "06:00", end: "14:00" },
      { label: "Evening", start: "14:00", end: "22:00" },
    ],
    batchSizingMode: "auto_group",
    defaultBatchSize: 12,
    autoPrintTickets: false,
    stationColorMap: {},
    productionSLAMinutes: 45,
    notifyKitchenOnShortage: true,
  },
  packing: {
    stages: ["Stage", "QC", "Pack", "Hand-off"],
    qcRequired: true,
    labelTemplate: "default",
    printerProfile: null,
    scanToVerify: false,
    blockHandoffOnFailedQc: true,
  },
  delivery: {
    enabled: false,
    deliveryRadiusKm: 10,
    baseFee: 5,
    perKmFee: 1,
    freeDeliveryThreshold: 75,
    dispatchWindowMinutes: 30,
    driverAssignmentMode: "manual",
    externalCourierPreference: "none",
    smsCustomerOnDispatch: false,
  },
  routes: {
    optimizationMode: "balanced_load",
    maxStopsPerRoute: 12,
    driverStartLocationName: null,
    bufferMinutesBetweenStops: 5,
  },
  crm: {
    vipLifetimeSpend: 1000,
    vipOrderCount: 10,
    churnInactiveDays: 60,
    loyaltyMode: "none",
    loyaltyPointsPerCurrency: 1,
    autoFollowUpEnabled: false,
    birthdayRewardEnabled: false,
    customerTags: ["VIP", "Catering", "Wholesale"],
  },
  automation: {
    enabled: false,
    defaultRetryAttempts: 3,
    retryBackoffSeconds: 30,
    pauseOnFailure: false,
  },
  ai: {
    assistantEnabled: true,
    summariesEnabled: true,
    forecastingEnabled: false,
    tokenCapPerDay: 50_000,
    costAlertCents: 500,
    promptPresets: [],
  },
  backups: {
    scheduledBackupsEnabled: false,
    retentionDays: 30,
    includeAttachments: false,
    snapshotBeforeImports: true,
  },
  compliance: {
    jurisdiction: "pipeda",
    dataRetentionDays: 365,
    privacyPolicyUrl: null,
    termsOfServiceUrl: null,
    cookieConsentRequired: false,
    allergenDisclaimer: null,
    nutritionDisclaimer: null,
  },
  developer: {
    debugLogging: false,
    featureFlagPreviews: false,
    audit_traces: false,
  },
  advanced: {
    workspaceArchived: false,
    transferContactEmail: null,
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep-merge user JSON into defaults so missing or stale fields never crash the UI. */
export function mergeSettingsCenter(raw: unknown): SettingsCenterPayload {
  if (!isPlainObject(raw)) return DEFAULT_SETTINGS_CENTER;
  function merge<T>(defaults: T, incoming: unknown): T {
    if (Array.isArray(defaults)) {
      return (Array.isArray(incoming) ? incoming : defaults) as T;
    }
    if (isPlainObject(defaults)) {
      const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
      const src = isPlainObject(incoming) ? incoming : {};
      for (const key of Object.keys(defaults as Record<string, unknown>)) {
        out[key] = merge(
          (defaults as Record<string, unknown>)[key],
          src[key],
        );
      }
      return out as T;
    }
    if (incoming === null || incoming === undefined) return defaults;
    return incoming as T;
  }
  return merge(DEFAULT_SETTINGS_CENTER, raw);
}
