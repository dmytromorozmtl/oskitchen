import type { AuditExportFormat, AuditExportStatus, AuditLogSeverity, AuditLogSource } from "@prisma/client";

export type { AuditExportFormat, AuditExportStatus, AuditLogSeverity, AuditLogSource };

/** High-level grouping for tabs, filters, and compliance reports. */
export type AuditCategory =
  | "AUTH"
  | "SETTINGS"
  | "STAFF"
  | "PERMISSIONS"
  | "ORDERS"
  | "CUSTOMERS"
  | "MENUS"
  | "PRODUCTS"
  | "PRODUCT_MAPPING"
  | "SALES_CHANNELS"
  | "WEBHOOKS"
  | "PRODUCTION"
  | "PACKING"
  | "ROUTES"
  | "INVENTORY"
  | "PURCHASING"
  | "COSTING"
  | "CATERING"
  | "MEAL_PLANS"
  | "NOTIFICATIONS"
  | "BILLING"
  | "IMPORT_EXPORT"
  | "REPORTS"
  | "AI_COPILOT"
  | "AUTOMATIONS"
  | "GO_LIVE"
  | "IMPLEMENTATION"
  | "TRAINING"
  | "SECURITY"
  | "DEVELOPER"
  | "PLATFORM"
  | "SYSTEM";

export type AuditActor = {
  userId?: string | null;
  staffId?: string | null;
  email?: string | null;
  role?: string | null;
};

export type AuditEntity = {
  type: string;
  id?: string | null;
  label?: string | null;
};

export type AuditRequestContext = {
  route?: string | null;
  method?: string | null;
  requestId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export type AuditLogInput = {
  organizationId?: string | null;
  workspaceId?: string | null;
  actor: AuditActor;
  action: string;
  category: AuditCategory | string;
  source: AuditLogSource;
  severity?: AuditLogSeverity;
  entity: AuditEntity;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  request?: AuditRequestContext;
  /** When true, email/phone in metadata may be masked for non-admin viewers (stored redacted). */
  maskPiiInMetadata?: boolean;
};

export type AuditListFilters = {
  workspaceId?: string;
  from?: Date;
  to?: Date;
  action?: string;
  category?: string;
  source?: AuditLogSource;
  severity?: AuditLogSeverity;
  actorUserId?: string;
  actorEmail?: string;
  entityType?: string;
  entityId?: string;
  requestId?: string;
  route?: string;
  keyword?: string;
  redactionApplied?: boolean;
  onlyCritical?: boolean;
  /** When true, surface failed / error-class events (heuristic on action name + severity). */
  onlyFailed?: boolean;
  /** Tab preset: narrows category/source ranges */
  tab?: "activity" | "security" | "data" | "integrations" | "imports" | "billing" | "ai" | "exports" | "storefront" | "all";
};
