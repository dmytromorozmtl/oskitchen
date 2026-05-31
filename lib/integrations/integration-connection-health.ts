import { buildCapabilityRows } from "@/lib/capabilities/capability-matrix";
import type { CapabilityStatus } from "@/lib/capabilities/capability-status";
import { getServerEnv } from "@/lib/env";

export type IntegrationTruthLabel =
  | "CONFIGURED"
  | "VERIFIED"
  | "PLACEHOLDER"
  | "NEEDS_AUTH"
  | "ERROR";

export type IntegrationHealthPresentation = {
  truthLabel: IntegrationTruthLabel;
  capabilityStatus: CapabilityStatus | null;
  headline: string;
  detail: string;
  showGreenOk: boolean;
};

const PROVIDER_CAPABILITY: Record<string, string> = {
  woocommerce: "woocommerce",
  shopify: "shopify",
  uber_eats: "uber_eats",
  uber_direct: "uber_direct",
  doordash: "doordash",
  stripe: "stripe_checkout",
};

function normalizeProvider(provider: string): string {
  return provider.trim().toLowerCase().replace(/-/g, "_");
}

/** Honest UI label — never show green OK for roadmap/placeholder integrations. */
export function describeIntegrationConnectionHealth(input: {
  provider: string;
  connectionStatus: string;
  hasCredentials: boolean;
  lastHealthCheckOk?: boolean;
}): IntegrationHealthPresentation {
  const env = getServerEnv();
  const capId = PROVIDER_CAPABILITY[normalizeProvider(input.provider)];
  const cap = capId ? buildCapabilityRows(env).find((r) => r.id === capId) : null;
  const capabilityStatus = cap?.status ?? null;

  if (input.connectionStatus === "ERROR") {
    return {
      truthLabel: "ERROR",
      capabilityStatus,
      headline: "Connection error",
      detail: cap?.gaps ?? "Fix credentials or webhook configuration.",
      showGreenOk: false,
    };
  }

  if (input.connectionStatus === "NEEDS_AUTH" || !input.hasCredentials) {
    return {
      truthLabel: "NEEDS_AUTH",
      capabilityStatus,
      headline: "Needs configuration",
      detail: "Credentials missing or expired.",
      showGreenOk: false,
    };
  }

  if (capabilityStatus === "ROADMAP" || capabilityStatus === "NOT_AVAILABLE") {
    return {
      truthLabel: "PLACEHOLDER",
      capabilityStatus,
      headline: "Placeholder / roadmap",
      detail: cap?.gaps ?? "Not production-certified in OS Kitchen.",
      showGreenOk: false,
    };
  }

  if (capabilityStatus === "PARTNER_ACCESS_REQUIRED") {
    return {
      truthLabel: "PLACEHOLDER",
      capabilityStatus,
      headline: "Partner access required",
      detail: cap?.gaps ?? "Requires vendor partnership before go-live.",
      showGreenOk: false,
    };
  }

  if (input.lastHealthCheckOk === true) {
    return {
      truthLabel: "VERIFIED",
      capabilityStatus,
      headline: capabilityStatus === "BETA" ? "Configured (BETA)" : "Verified",
      detail: cap?.works ?? "Last manual health check passed.",
      showGreenOk: capabilityStatus !== "BETA",
    };
  }

  return {
    truthLabel: "CONFIGURED",
    capabilityStatus,
    headline: capabilityStatus === "BETA" ? "Configured (BETA)" : "Configured",
    detail: cap?.works ?? "Connected — run a health check to verify.",
    showGreenOk: false,
  };
}
