import type { BusinessType, IntegrationProvider } from "@prisma/client";

/** UX-facing channel lifecycle — not identical to `IntegrationStatus`. */
export type ChannelStatusType =
  | "LIVE"
  | "CONNECTED"
  | "NEEDS_CREDENTIALS"
  | "NEEDS_SETUP"
  | "PARTNER_ACCESS_REQUIRED"
  | "SIMULATED_DEMO"
  | "DISABLED"
  | "ERROR"
  | "COMING_SOON";

/** Internal grouping used in catalog code and filters. */
export type ChannelCategory =
  | "STOREFRONT"
  | "ECOMMERCE"
  | "DELIVERY_MARKETPLACE"
  | "DELIVERY_DISPATCH"
  | "POS"
  | "MANUAL_INTAKE"
  | "FORMS_IMPORTS"
  | "CATERING_EVENTS";

/** Command-center grouping (matches operator vocabulary). */
export type HubChannelCategory =
  | "NATIVE"
  | "STOREFRONT"
  | "ECOMMERCE"
  | "MARKETPLACE"
  | "POS"
  | "DELIVERY_DISPATCH"
  | "MANUAL_INTAKE"
  | "IMPORT"
  | "FORMS"
  | "EVENTS_CATERING"
  | "BAR_PRIVATE_EVENTS"
  | "CAFE_PICKUP"
  | "BAKERY_PREORDER";

export type ChannelCapability =
  | "orders"
  | "products"
  | "menus"
  | "webhooks"
  | "delivery"
  | "status_sync"
  | "payments"
  | "customer_sync"
  | "inventory_sync"
  | "markets_sync"
  | "menu_sync";

export type ChannelSetupType =
  | "NATIVE"
  | "OAUTH_OR_TOKEN"
  | "REST_CREDENTIALS"
  | "WEBHOOK_PLUS_API"
  | "MANUAL_ONLY"
  | "PARTNER_GATE"
  | "IMPORT_ONLY"
  | "PLACEHOLDER";

/** Honest build / partner posture for badges and sorting. */
export type SupportLevel =
  | "LIVE_READY"
  | "BUILDABLE_WITH_CREDENTIALS"
  | "PARTNER_REQUIRED"
  | "COMING_SOON"
  | "DEMO_ONLY"
  | "MANUAL_ONLY";

export type LiveReadiness = "PRODUCTION" | "TEST_OR_STAGING" | "NOT_APPLICABLE" | "BLOCKED";

export type ChannelSyncTypeLiteral = "ORDERS" | "PRODUCTS" | "CUSTOMERS" | "MENUS" | "STATUS" | "INVENTORY";

export type ChannelMappingTypeLiteral =
  | "PRODUCT_SKU"
  | "PRODUCT_TITLE"
  | "STATUS"
  | "FULFILLMENT"
  | "PAYMENT"
  | "CATEGORY";

export type ChannelDefinition = {
  providerKey: string;
  label: string;
  shortDescription: string;
  longDescription: string;
  category: ChannelCategory;
  statusType: ChannelStatusType;
  /** Empty = all operating modes. */
  supportedBusinessModes: readonly BusinessType[];
  capabilities: readonly ChannelCapability[];
  setupType: ChannelSetupType;
  requiresCredentials: boolean;
  requiresOAuth: boolean;
  requiresPartnerApproval: boolean;
  supportsWebhooks: boolean;
  supportsOrderImport: boolean;
  supportsProductSync: boolean;
  supportsMenuSync: boolean;
  supportsStatusSync: boolean;
  supportsDeliveryDispatch: boolean;
  supportsPayments: boolean;
  supportsLiveMode: boolean;
  isPlaceholder: boolean;
  docsUrl: string;
  /** In-app setup (existing integration pages stay under `/dashboard/integrations/*` where applicable). */
  setupRoute: string;
  /** Webhook path patterns — full URLs built with `SITE_URL` at runtime. */
  webhookPathHints: readonly string[];
  envRequirements: readonly string[];
  requiredPlan: "STARTER" | "PRO" | "ENTERPRISE" | null;
  /** Lucide icon name (resolved in UI). */
  icon:
    | "store"
    | "shoppingBag"
    | "bike"
    | "utensils"
    | "truck"
    | "fileSpreadsheet"
    | "mail"
    | "phone"
    | "form"
    | "plug"
    | "calendar"
    | "wine"
    | "croissant"
    | "coffee";
  /** Maps to persisted `IntegrationConnection.provider` when applicable. */
  mapsToIntegrationProvider: IntegrationProvider | null;
};

/** Canonical merged row for UI, docs, and setup wizards — extends catalog with operational metadata. */
export type ChannelRegistryEntry = ChannelDefinition & {
  supportLevel: SupportLevel;
  liveReadiness: LiveReadiness;
  hubCategory: HubChannelCategory;
  setupSteps: readonly string[];
  requiredCredentials: readonly string[];
  requiredEnvVars: readonly string[];
  webhookTopics: readonly string[];
  webhookRoutes: readonly string[];
  syncTypes: readonly ChannelSyncTypeLiteral[];
  mappingTypes: readonly ChannelMappingTypeLiteral[];
  docsLinks: readonly string[];
  color: string;
  isNative: boolean;
  supportsTestConnection: boolean;
  supportsManualSync: boolean;
  supportsOrderSync: boolean;
  supportsCustomerSync: boolean;
  supportsStatusPushback: boolean;
};
