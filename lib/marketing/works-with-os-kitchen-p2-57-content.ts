import {
  INTEGRATION_REGISTRY,
  LIVE_INTEGRATION_IDS,
  type IntegrationRegistryEntry,
} from "@/lib/integrations/integration-registry";
import { WORKS_WITH_OS_KITCHEN_P2_57_LOGO_DIR } from "@/lib/marketing/works-with-os-kitchen-p2-57-policy";

export type WorksWithIntegrationCategory =
  | "delivery"
  | "commerce"
  | "accounting"
  | "labor"
  | "marketing"
  | "payments"
  | "reservations";

export type WorksWithIntegrationCard = {
  id: string;
  name: string;
  category: WorksWithIntegrationCategory;
  status: "LIVE";
  setupRoute: string;
  logoPath: `/integrations/logos/${string}.svg`;
  logoAlt: string;
  capability: string;
};

const CATEGORY_BY_ID: Record<string, WorksWithIntegrationCategory> = {
  doordash: "delivery",
  skip: "delivery",
  grubhub: "delivery",
  "uber-eats": "delivery",
  woocommerce: "commerce",
  shopify: "commerce",
  quickbooks: "accounting",
  xero: "accounting",
  "7shifts": "labor",
  homebase: "labor",
  klaviyo: "marketing",
  mailchimp: "marketing",
  stripe: "payments",
  "square-payments": "payments",
  moneris: "payments",
  resy: "reservations",
  opentable: "reservations",
};

const CAPABILITY_BY_ID: Record<string, string> = {
  doordash: "Order webhook → KDS · menu sync scaffold",
  skip: "Skip / Just Eat order import · webhook path",
  grubhub: "Grubhub marketplace orders · webhook scaffold",
  woocommerce: "Store webhook → KitchenTask · inventory sync",
  shopify: "HMAC webhooks · catalog + order sync",
  "uber-eats": "Uber Eats order hub · partner-gated creds",
  quickbooks: "Accounting connector · chart sync scaffold",
  xero: "Xero ledger connector scaffold",
  "7shifts": "Labor schedule import scaffold",
  homebase: "Homebase time + schedule scaffold",
  klaviyo: "Customer marketing events export",
  mailchimp: "Audience sync · campaign hooks",
  stripe: "Payments + Terminal · webhook events",
  "square-payments": "Square Payments OAuth scaffold",
  moneris: "Moneris payment connector scaffold",
  resy: "Resy reservation webhook scaffold",
  opentable: "OpenTable reservation webhook scaffold",
};

function toCard(entry: IntegrationRegistryEntry): WorksWithIntegrationCard {
  return {
    id: entry.id,
    name: entry.name,
    category: CATEGORY_BY_ID[entry.id] ?? "commerce",
    status: "LIVE",
    setupRoute: entry.setupRoute,
    logoPath: `/integrations/logos/${entry.id}.svg`,
    logoAlt: `${entry.name} logo`,
    capability: CAPABILITY_BY_ID[entry.id] ?? "Integration scaffold LIVE in registry",
  };
}

/** Canonical 17 LIVE integrations for /works-with-os-kitchen (registry truth). */
export const WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS: readonly WorksWithIntegrationCard[] =
  LIVE_INTEGRATION_IDS.map((id) => {
    const entry = INTEGRATION_REGISTRY.find((row) => row.id === id);
    if (!entry || entry.status !== "LIVE") {
      throw new Error(`Missing LIVE registry entry for ${id}`);
    }
    return toCard(entry);
  });

export const WORKS_WITH_OS_KITCHEN_CATEGORY_LABELS: Record<WorksWithIntegrationCategory, string> =
  {
    delivery: "Delivery marketplaces",
    commerce: "Commerce platforms",
    accounting: "Accounting",
    labor: "Labor & scheduling",
    marketing: "Marketing automation",
    payments: "Payments",
    reservations: "Reservations",
  };

export const WORKS_WITH_OS_KITCHEN_HEADLINE =
  "Works with OS Kitchen — 17 LIVE integrations" as const;

export const WORKS_WITH_OS_KITCHEN_SUBTITLE =
  "Every tile shows registry LIVE status, brand mark, and honest setup path. Workspace credentials still required — we do not show a blanket connected badge." as const;

export const WORKS_WITH_OS_KITCHEN_HONESTY_NOTE =
  "LIVE means scaffold + smoke proof in integration registry — not that your workspace is connected. Connect each channel from Integration Health Center after signup." as const;

export function worksWithLogoPublicPath(integrationId: string): string {
  return `${WORKS_WITH_OS_KITCHEN_P2_57_LOGO_DIR}/${integrationId}.svg`;
}

export function groupWorksWithIntegrationsByCategory(): Record<
  WorksWithIntegrationCategory,
  WorksWithIntegrationCard[]
> {
  const groups: Record<WorksWithIntegrationCategory, WorksWithIntegrationCard[]> = {
    delivery: [],
    commerce: [],
    accounting: [],
    labor: [],
    marketing: [],
    payments: [],
    reservations: [],
  };
  for (const card of WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS) {
    groups[card.category].push(card);
  }
  return groups;
}
