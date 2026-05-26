import type { IntegrationStatus } from "@prisma/client";

export function integrationLaunchTitle(label: IntegrationLaunchLabel): string {
  switch (label) {
    case "live_ready":
      return "Live ready";
    case "credentials_required":
      return "Credentials required";
    case "partner_access_required":
      return "Partner access required";
    case "simulated_demo":
      return "Simulated demo";
    case "disabled":
      return "Disabled";
    case "error":
      return "Error";
    default:
      return label;
  }
}

export type IntegrationLaunchLabel =
  | "live_ready"
  | "credentials_required"
  | "partner_access_required"
  | "simulated_demo"
  | "disabled"
  | "error";

export function integrationLaunchLabel(args: {
  status: IntegrationStatus;
  connectionName?: string | null;
  lastError?: string | null;
  workspaceDemoMode?: boolean;
  partnerGate?: boolean;
  supportsLiveMode?: boolean;
  isPlaceholder?: boolean;
}): { label: IntegrationLaunchLabel; description: string } {
  const hay = `${args.connectionName ?? ""} ${args.lastError ?? ""}`.toLowerCase();
  const simulated =
    hay.includes("demo") ||
    hay.includes("simulated") ||
    Boolean(args.workspaceDemoMode && hay.includes("[demo]"));

  const blockedFromLive = args.supportsLiveMode === false || args.isPlaceholder === true;

  if (args.partnerGate && blockedFromLive) {
    return {
      label: "partner_access_required",
      description:
        "Partner approval may exist, but this provider is not yet certified for live traffic in KitchenOS.",
    };
  }

  if (args.partnerGate && args.status !== "CONNECTED") {
    return {
      label: "partner_access_required",
      description:
        "Uber partner credentials and approvals are required before live traffic.",
    };
  }

  if (simulated && args.status !== "CONNECTED") {
    return {
      label: "simulated_demo",
      description:
        "Dataset-only or placeholder connection — no live API calls.",
    };
  }

  if (blockedFromLive && args.status === "CONNECTED") {
    return {
      label: "simulated_demo",
      description: "Connection saved, but this provider still runs in placeholder/demo mode only.",
    };
  }

  switch (args.status) {
    case "CONNECTED":
      return simulated
        ? {
            label: "simulated_demo",
            description: "Marked as simulated — replace with real credentials for production.",
          }
        : {
            label: "live_ready",
            description: "Saved credentials and last checks OK — monitor sync/webhooks.",
          };
    case "DISABLED":
      return {
        label: "disabled",
        description: "Integration disabled — enable when you are ready to connect.",
      };
    case "ERROR":
      return {
        label: "error",
        description: args.lastError ?? "Fix credentials or webhook errors, then retry.",
      };
    case "NEEDS_AUTH":
    default:
      return {
        label: "credentials_required",
        description: "Add API keys / secrets and run test connection.",
      };
  }
}
