/**
 * Third-party integration registry (delivery, accounting connectors).
 * Channel marketplace cards live in `lib/channels/channel-registry.ts`.
 */

export type IntegrationRegistryEntry = {
  id: string;
  name: string;
  status: "LIVE" | "BETA" | "PLACEHOLDER";
  requiredEnv: string[];
  setupRoute: string;
};

export const INTEGRATION_REGISTRY: IntegrationRegistryEntry[] = [
  {
    id: "doordash",
    name: "DoorDash",
    status: "PLACEHOLDER",
    requiredEnv: ["DOORDASH_API_KEY", "DOORDASH_MERCHANT_ID"],
    setupRoute: "/dashboard/integrations/doordash",
  },
  {
    id: "grubhub",
    name: "Grubhub",
    status: "PLACEHOLDER",
    requiredEnv: ["GRUBHUB_API_KEY", "GRUBHUB_MERCHANT_ID"],
    setupRoute: "/dashboard/integrations/grubhub",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    status: "BETA",
    requiredEnv: ["QUICKBOOKS_CLIENT_ID"],
    setupRoute: "/dashboard/integrations/quickbooks",
  },
  {
    id: "xero",
    name: "Xero",
    status: "BETA",
    requiredEnv: ["XERO_CLIENT_ID"],
    setupRoute: "/dashboard/integrations/xero",
  },
  {
    id: "7shifts",
    name: "7shifts",
    status: "BETA",
    requiredEnv: ["SEVENSHIFTS_API_KEY"],
    setupRoute: "/dashboard/integrations/7shifts",
  },
  {
    id: "homebase",
    name: "Homebase",
    status: "BETA",
    requiredEnv: ["HOMEBASE_API_KEY"],
    setupRoute: "/dashboard/integrations/homebase",
  },
  {
    id: "uber-direct",
    name: "Uber Direct",
    status: "PLACEHOLDER",
    requiredEnv: ["UBER_DIRECT_CUSTOMER_ID"],
    setupRoute: "/dashboard/routes/uber-direct",
  },
];

export function getIntegrationById(id: string): IntegrationRegistryEntry | undefined {
  return INTEGRATION_REGISTRY.find((e) => e.id === id);
}
