/**
 * Streamlined Woo/Shopify pilot setup steps — Evolution Era 17 Workstream H Cycle 34.
 */

import type { ConnectionCertificationRecord } from "@/lib/integrations/channel-certification-types";

export type ChannelPilotProvider = "woocommerce" | "shopify";

export type ChannelPilotSetupStepId =
  | "save_credentials"
  | "test_connection"
  | "configure_webhooks"
  | "verify_webhook"
  | "run_certification";

export type ChannelPilotSetupStepDef = {
  id: ChannelPilotSetupStepId;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
};

export const CHANNEL_PILOT_SETUP_WOO_STEPS: readonly ChannelPilotSetupStepDef[] = [
  {
    id: "save_credentials",
    title: "Save credentials",
    description: "HTTPS store URL, REST consumer key/secret, webhook signing secret.",
    actionLabel: "Complete connection form below",
  },
  {
    id: "test_connection",
    title: "Test connection",
    description: "Use Tools → Test connection after saving.",
    actionLabel: "Run test connection",
  },
  {
    id: "configure_webhooks",
    title: "Configure Woo webhooks",
    description: "Copy webhook URL into Woo admin; topics order.* and product.*.",
    actionLabel: "Copy webhook URL below",
  },
  {
    id: "verify_webhook",
    title: "Verify webhook delivery",
    description: "Place a test order; confirm signatureValid on Sales channels → Webhooks.",
    actionLabel: "Open webhook log",
    actionHref: "/dashboard/sales-channels/webhooks",
  },
  {
    id: "run_certification",
    title: "Run certification checks",
    description: "In-app certification panel — pilot sign-off when PARTIAL is documented.",
    actionLabel: "Run certification checks",
  },
] as const;

export const CHANNEL_PILOT_SETUP_SHOPIFY_STEPS: readonly ChannelPilotSetupStepDef[] = [
  {
    id: "save_credentials",
    title: "Save credentials",
    description: "Shop domain (*.myshopify.com), Admin API token, webhook signing secret.",
    actionLabel: "Complete connection form below",
  },
  {
    id: "test_connection",
    title: "Test connection",
    description: "Use Tools → Test connection after saving.",
    actionLabel: "Run test connection",
  },
  {
    id: "configure_webhooks",
    title: "Register Shopify webhooks",
    description: "orders-create, orders-updated, products-update — use endpoints listed below.",
    actionLabel: "Review webhook endpoints below",
  },
  {
    id: "verify_webhook",
    title: "Verify webhook delivery",
    description: "Place a test order on dev store; confirm valid signature in webhook log.",
    actionLabel: "Open webhook log",
    actionHref: "/dashboard/sales-channels/webhooks",
  },
  {
    id: "run_certification",
    title: "Run certification checks",
    description: "In-app certification panel — pilot sign-off when PARTIAL is documented.",
    actionLabel: "Run certification checks",
  },
] as const;

export type ChannelPilotSetupStepStatus = {
  id: ChannelPilotSetupStepId;
  complete: boolean;
};

export type ChannelPilotSetupProgress = {
  steps: ChannelPilotSetupStepStatus[];
  completedCount: number;
  totalCount: number;
  currentStepId: ChannelPilotSetupStepId | null;
  pilotReady: boolean;
};

export type ChannelPilotSetupInput = {
  provider: ChannelPilotProvider;
  hasConnection: boolean;
  hasCredentials: boolean;
  hasWebhookSecret: boolean;
  hasStoreIdentity: boolean;
  certification: ConnectionCertificationRecord | null;
};

function certCheckPassed(
  certification: ConnectionCertificationRecord | null,
  id: string,
): boolean {
  if (!certification) return false;
  const hit = certification.checks.find((c) => c.id === id);
  return hit?.status === "pass";
}

export function stepsForProvider(provider: ChannelPilotProvider): readonly ChannelPilotSetupStepDef[] {
  return provider === "woocommerce"
    ? CHANNEL_PILOT_SETUP_WOO_STEPS
    : CHANNEL_PILOT_SETUP_SHOPIFY_STEPS;
}

export function evaluateChannelPilotSetupProgress(
  input: ChannelPilotSetupInput,
): ChannelPilotSetupProgress {
  const saveComplete =
    input.hasConnection &&
    input.hasCredentials &&
    input.hasWebhookSecret &&
    input.hasStoreIdentity;

  const testComplete = certCheckPassed(input.certification, "rest_api_reachable");

  const webhooksConfigured = saveComplete && input.hasWebhookSecret;

  const verifyComplete = certCheckPassed(input.certification, "recent_valid_webhooks");

  const certComplete =
    input.certification != null &&
    (input.certification.overall === "PASS" || input.certification.overall === "PARTIAL");

  const statuses: ChannelPilotSetupStepStatus[] = [
    { id: "save_credentials", complete: saveComplete },
    { id: "test_connection", complete: testComplete },
    { id: "configure_webhooks", complete: webhooksConfigured },
    { id: "verify_webhook", complete: verifyComplete },
    { id: "run_certification", complete: certComplete },
  ];

  const completedCount = statuses.filter((s) => s.complete).length;
  const currentStepId =
    statuses.find((s) => !s.complete)?.id ?? null;

  return {
    steps: statuses,
    completedCount,
    totalCount: statuses.length,
    currentStepId,
    pilotReady: completedCount === statuses.length,
  };
}

/** Legacy playbook had 9 operator steps — pilot wizard consolidates to 5 UI steps. */
export const CHANNEL_PILOT_SETUP_LEGACY_STEP_COUNT = 9;
export const CHANNEL_PILOT_SETUP_STREAMLINED_STEP_COUNT = 5;

export function pilotSetupStepReductionPercent(): number {
  return Math.round(
    (1 - CHANNEL_PILOT_SETUP_STREAMLINED_STEP_COUNT / CHANNEL_PILOT_SETUP_LEGACY_STEP_COUNT) *
      100,
  );
}
