import type {
  ChannelDefinition,
  ChannelMappingTypeLiteral,
  ChannelRegistryEntry,
  ChannelSyncTypeLiteral,
  HubChannelCategory,
  LiveReadiness,
  SupportLevel,
} from "@/lib/channels/channel-types";
import { channelHasCapability } from "@/lib/channels/channel-capabilities";

const DEFAULT_SETUP: readonly string[] = [
  "Overview",
  "Requirements",
  "Credentials / access",
  "Test connection",
  "Webhooks",
  "Sync settings",
  "Mapping",
  "Finish",
];

const SHOPIFY_WEBHOOK_TOPICS = [
  "orders/create",
  "orders/updated",
  "products/update",
  "app/uninstalled",
] as const;

function hubCategory(def: ChannelDefinition): HubChannelCategory {
  switch (def.providerKey) {
    case "kitchenos-storefront":
      return "STOREFRONT";
    case "manual-orders":
      return "MANUAL_INTAKE";
    case "woocommerce":
    case "shopify":
      return "ECOMMERCE";
    case "uber-eats":
    case "doordash":
      return "MARKETPLACE";
    case "uber-direct":
      return "DELIVERY_DISPATCH";
    case "square":
    case "toast":
    case "clover":
    case "lightspeed":
      return "POS";
    case "csv-import":
      return "IMPORT";
    case "google-forms":
      return "FORMS";
    case "email-orders":
      return "MANUAL_INTAKE";
    case "catering-inquiries":
      return "EVENTS_CATERING";
    case "bar-event-inquiries":
      return "BAR_PRIVATE_EVENTS";
    case "bakery-preorder":
      return "BAKERY_PREORDER";
    case "cafe-pickup":
      return "CAFE_PICKUP";
    default:
      return "NATIVE";
  }
}

function supportLevel(def: ChannelDefinition): SupportLevel {
  if (def.providerKey === "manual-orders") return "MANUAL_ONLY";
  if (def.providerKey === "email-orders" && def.isPlaceholder) return "DEMO_ONLY";
  if (def.isPlaceholder && def.statusType === "COMING_SOON") return "COMING_SOON";
  if (def.requiresPartnerApproval) return "PARTNER_REQUIRED";
  if (def.requiresCredentials && def.supportsLiveMode && !def.isPlaceholder) {
    return "BUILDABLE_WITH_CREDENTIALS";
  }
  if (def.setupType === "NATIVE" && !def.requiresCredentials) return "LIVE_READY";
  if (def.setupType === "IMPORT_ONLY") return "LIVE_READY";
  return "LIVE_READY";
}

function liveReadiness(def: ChannelDefinition, level: SupportLevel): LiveReadiness {
  if (level === "COMING_SOON" || level === "PARTNER_REQUIRED") return "BLOCKED";
  if (level === "DEMO_ONLY") return "NOT_APPLICABLE";
  if (def.isPlaceholder && !def.supportsLiveMode) return "BLOCKED";
  return "PRODUCTION";
}

function credentialHints(def: ChannelDefinition): readonly string[] {
  switch (def.providerKey) {
    case "woocommerce":
      return ["Consumer key", "Consumer secret", "Webhook signing secret (recommended)"];
    case "shopify":
      return ["Admin API access token", "Webhook signing secret", "Shop domain"];
    case "uber-eats":
      return ["Partner-issued client credentials", "Store / eater identifiers", "Webhook signing secret"];
    case "uber-direct":
      return ["Customer ID", "Client ID", "Client secret (Uber Direct program)"];
    default:
      if (def.requiresOAuth) return ["OAuth application", "Refresh token storage"];
      if (def.requiresCredentials) return ["API credentials (encrypted at rest)"];
      return [];
  }
}

function syncTypesFor(def: ChannelDefinition): readonly ChannelSyncTypeLiteral[] {
  const out: ChannelSyncTypeLiteral[] = [];
  if (def.supportsOrderImport) out.push("ORDERS");
  if (def.supportsProductSync) out.push("PRODUCTS");
  if (channelHasCapability(def.capabilities, "customer_sync")) out.push("CUSTOMERS");
  if (def.supportsMenuSync) out.push("MENUS");
  if (def.supportsStatusSync) out.push("STATUS");
  if (channelHasCapability(def.capabilities, "inventory_sync")) out.push("INVENTORY");
  return out;
}

function mappingTypesFor(def: ChannelDefinition): readonly ChannelMappingTypeLiteral[] {
  const m = new Set<ChannelMappingTypeLiteral>();
  if (def.supportsProductSync) {
    m.add("PRODUCT_SKU");
    m.add("PRODUCT_TITLE");
    m.add("CATEGORY");
  }
  if (def.supportsStatusSync) m.add("STATUS");
  if (def.supportsOrderImport) {
    m.add("FULFILLMENT");
    m.add("PAYMENT");
  }
  return [...m];
}

function colorFor(def: ChannelDefinition): string {
  switch (def.providerKey) {
    case "kitchenos-storefront":
      return "emerald";
    case "manual-orders":
      return "sky";
    case "woocommerce":
      return "violet";
    case "shopify":
      return "lime";
    case "uber-eats":
      return "green";
    case "uber-direct":
      return "zinc";
    case "doordash":
      return "red";
    case "csv-import":
      return "amber";
    default:
      return "slate";
  }
}

function webhookTopics(def: ChannelDefinition): readonly string[] {
  if (def.providerKey === "shopify") return [...SHOPIFY_WEBHOOK_TOPICS];
  if (def.providerKey === "woocommerce") return ["order.*", "product.* (as configured in Woo)"];
  if (def.providerKey === "uber-eats") return ["orders.notification"];
  if (def.providerKey === "uber-direct") return ["delivery.status"];
  return [];
}

export function enrichChannelRegistryEntry(def: ChannelDefinition): ChannelRegistryEntry {
  const sl = supportLevel(def);
  const lr = liveReadiness(def, sl);
  const isNative =
    def.setupType === "NATIVE" ||
    def.setupType === "MANUAL_ONLY" ||
    def.setupType === "IMPORT_ONLY";

  const supportsTestConnection =
    def.providerKey === "woocommerce" ||
    def.providerKey === "shopify" ||
    def.providerKey === "kitchenos-storefront" ||
    def.providerKey === "manual-orders" ||
    def.providerKey === "csv-import" ||
    def.providerKey === "uber-eats" ||
    def.providerKey === "uber-direct";

  const supportsManualSync =
    def.providerKey === "woocommerce" ||
    def.providerKey === "shopify" ||
    def.providerKey === "csv-import";

  return {
    ...def,
    supportLevel: sl,
    liveReadiness: lr,
    hubCategory: hubCategory(def),
    setupSteps: DEFAULT_SETUP,
    requiredCredentials: credentialHints(def),
    requiredEnvVars: [...def.envRequirements],
    webhookTopics: webhookTopics(def),
    webhookRoutes: [...def.webhookPathHints],
    syncTypes: syncTypesFor(def),
    mappingTypes: mappingTypesFor(def),
    docsLinks: def.docsUrl ? [def.docsUrl] : [],
    color: colorFor(def),
    isNative,
    supportsTestConnection,
    supportsManualSync,
    supportsOrderSync: def.supportsOrderImport,
    supportsCustomerSync: channelHasCapability(def.capabilities, "customer_sync"),
    supportsStatusPushback: def.supportsStatusSync,
  };
}
