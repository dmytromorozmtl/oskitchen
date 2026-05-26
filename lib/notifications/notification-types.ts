export const NOTIFICATION_CATEGORIES = [
  "GUEST_TRANSACTIONAL",
  "GUEST_REMINDER",
  "INTERNAL_ALERT",
  "STAFF_TASK",
  "SYSTEM",
  "BILLING",
  "IMPLEMENTATION",
  "GO_LIVE",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
  GUEST_TRANSACTIONAL: "Guest · transactional",
  GUEST_REMINDER: "Guest · reminder",
  INTERNAL_ALERT: "Internal alert",
  STAFF_TASK: "Staff task",
  SYSTEM: "System",
  BILLING: "Billing",
  IMPLEMENTATION: "Implementation",
  GO_LIVE: "Go-live",
};

/** Templates whose audience must be a consenting subscriber, not just a guest with an active order. */
export const MARKETING_CATEGORIES: NotificationCategory[] = ["GUEST_REMINDER"];

export const NOTIFICATION_CHANNELS = ["EMAIL", "IN_APP", "SMS_PLACEHOLDER"] as const;
export type NotificationChannelKey = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CHANNEL_LABEL: Record<NotificationChannelKey, string> = {
  EMAIL: "Email",
  IN_APP: "In-app",
  SMS_PLACEHOLDER: "SMS (placeholder)",
};

export const PROVIDER_MODES = [
  "DISABLED",
  "RESEND",
  "DEVELOPMENT_LOG_ONLY",
  "MANUAL_PREVIEW",
] as const;
export type ProviderMode = (typeof PROVIDER_MODES)[number];

export const PROVIDER_MODE_LABEL: Record<ProviderMode, string> = {
  DISABLED: "Disabled (no key)",
  RESEND: "Resend configured",
  DEVELOPMENT_LOG_ONLY: "Development · log-only",
  MANUAL_PREVIEW: "Manual · preview-only",
};

export type NotificationAudience =
  | "CUSTOMER"
  | "WORKSPACE_OWNER"
  | "WORKSPACE_ADMINS"
  | "STAFF"
  | "KITCHEN_LEADS"
  | "DRIVERS"
  | "CATERING_SALES"
  | "SUPERADMIN_ONLY";

export const AUDIENCE_LABEL: Record<NotificationAudience, string> = {
  CUSTOMER: "Customer / guest",
  WORKSPACE_OWNER: "Workspace owner",
  WORKSPACE_ADMINS: "Owners + admins",
  STAFF: "All staff",
  KITCHEN_LEADS: "Kitchen leads",
  DRIVERS: "Drivers",
  CATERING_SALES: "Catering sales",
  SUPERADMIN_ONLY: "Superadmin only",
};
