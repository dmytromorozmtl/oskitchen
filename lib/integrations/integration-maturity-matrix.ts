import type { ResolvedChannel } from "@/lib/channels/channel-runtime";
import type { ServerEnv } from "@/lib/env";
import type { IntegrationMaturityTier } from "@/lib/integrations/integration-maturity-types";

export type InfrastructureIntegrationRow = {
  id: string;
  label: string;
  maturity: IntegrationMaturityTier;
  authState: string;
  worksSummary: string;
  gapsSummary: string;
  webhookSupport: string;
  syncDirection: string;
  setupHref: string;
  docsHref: string;
};

/** Map channel runtime status → honest product tier (never upgrade to LIVE without E2E proof). */
export function maturityTierFromResolvedChannel(row: ResolvedChannel): IntegrationMaturityTier {
  switch (row.effectiveStatus) {
    case "LIVE":
    case "CONNECTED":
      return row.isPlaceholder ? "ROADMAP" : "LIVE";
    case "SIMULATED_DEMO":
      return "BETA";
    case "NEEDS_CREDENTIALS":
    case "NEEDS_SETUP":
      return "SETUP_READY";
    case "PARTNER_ACCESS_REQUIRED":
      return "PARTNER_ACCESS_REQUIRED";
    case "ERROR":
      return "PARTIAL";
    case "DISABLED":
      return "NOT_AVAILABLE";
    case "COMING_SOON":
      return "ROADMAP";
    default:
      return "DEV_ONLY";
  }
}

export function infrastructureMaturityRows(env: ServerEnv): InfrastructureIntegrationRow[] {
  const stripeSecret = Boolean(env.STRIPE_SECRET_KEY?.trim());
  const stripeWebhook = Boolean(env.STRIPE_WEBHOOK_SECRET?.trim());
  const stripePub = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
  const stripeRow: InfrastructureIntegrationRow =
    stripeSecret && stripeWebhook && stripePub
      ? {
          id: "stripe",
          label: "Stripe (billing & storefront checkout)",
          maturity: "BETA",
          authState: "API keys present",
          worksSummary: "Server can create Checkout sessions when product code paths are hit; verify in staging.",
          gapsSummary:
            "LIVE requires successful real charges + webhooks in production and monitored reconciliation — not auto-detected here.",
          webhookSupport: stripeWebhook ? "Endpoint configured (verify delivery in Dashboard → Billing)" : "None",
          syncDirection: "Outbound + webhooks",
          setupHref: "/dashboard/billing",
          docsHref: "/help/getting-started",
        }
      : {
          id: "stripe",
          label: "Stripe (billing & storefront checkout)",
          maturity: "NOT_AVAILABLE",
          authState: "Keys missing or incomplete",
          worksSummary: "Billing and card flows stay disabled until keys + webhook secret are configured.",
          gapsSummary: "Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
          webhookSupport: stripeWebhook ? "Secret set" : "Not configured",
          syncDirection: "—",
          setupHref: "/dashboard/billing",
          docsHref: "/help/getting-started",
        };

  const resend = Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM_EMAIL?.trim());
  const resendRow: InfrastructureIntegrationRow = {
    id: "resend",
    label: "Resend (transactional email)",
    maturity: resend ? "SETUP_READY" : "NOT_AVAILABLE",
    authState: resend ? "API key + from address" : "Not configured",
    worksSummary: resend ? "Outbound email can send from configured domain." : "No outbound provider configured.",
    gapsSummary: resend ? "Prove deliverability (SPF/DKIM) in production." : "Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    webhookSupport: "Provider webhooks (optional) — see Resend docs",
    syncDirection: "Outbound",
    setupHref: "/dashboard/settings",
    docsHref: "/help/getting-started",
  };

  const maps = Boolean(env.GOOGLE_MAPS_API_KEY?.trim());
  const mapsRow: InfrastructureIntegrationRow = {
    id: "google-maps",
    label: "Google Maps (embedded routes)",
    maturity: maps ? "SETUP_READY" : "NOT_AVAILABLE",
    authState: maps ? "Server API key" : "Missing GOOGLE_MAPS_API_KEY",
    worksSummary: maps ? "Embeds and static map helpers can render when used by route pages." : "External map links still work where implemented.",
    gapsSummary: "Billing/quota and key restrictions are your Google Cloud responsibility.",
    webhookSupport: "N/A",
    syncDirection: "Read-only",
    setupHref: "/dashboard/routes/settings",
    docsHref: "/help/getting-started",
  };

  const openai = Boolean(env.OPENAI_API_KEY?.trim());
  const openaiRow: InfrastructureIntegrationRow = {
    id: "openai",
    label: "OpenAI (copilot / insights)",
    maturity: openai ? "BETA" : "ROADMAP",
    authState: openai ? "API key present" : "Not configured",
    worksSummary: openai ? "Deterministic + optional model-backed features behind server checks." : "Copilot runs in limited/deterministic mode only.",
    gapsSummary: "Enterprise customers may require data processing terms and key rotation — separate from this matrix.",
    webhookSupport: "N/A",
    syncDirection: "Outbound",
    setupHref: "/dashboard/copilot/settings",
    docsHref: "/help/getting-started",
  };

  const posRow: InfrastructureIntegrationRow = {
    id: "kitchenos-pos",
    label: "KitchenOS POS",
    maturity: "LIVE",
    authState: "Workspace-native (no third-party POS OAuth)",
    worksSummary: "Registers, shifts, terminal, transactions, and receipts inside KitchenOS.",
    gapsSummary:
      "Requires network connectivity — offline checkout queue is not implemented. Does not replace Toast/Square hardware ecosystems — see roadmap row for external POS.",
    webhookSupport: "N/A (first-party)",
    syncDirection: "Internal",
    setupHref: "/dashboard/pos",
    docsHref: "/help/getting-started",
  };

  const csvRow: InfrastructureIntegrationRow = {
    id: "csv-import",
    label: "CSV import",
    maturity: "PARTIAL",
    authState: "File upload via Import center",
    worksSummary: "Batch catalog or order intake through controlled import flows for moderate file sizes.",
    gapsSummary:
      "Very large files may hit serverless timeouts without dedicated object storage + background workers — see docs/BACKGROUND_IMPORT_EXPORT_JOBS.md.",
    webhookSupport: "N/A",
    syncDirection: "Inbound file",
    setupHref: "/dashboard/import-center",
    docsHref: "/help/getting-started",
  };

  const externalPosRow: InfrastructureIntegrationRow = {
    id: "external-pos-connectors",
    label: "External POS (Toast / Square / Clover / Lightspeed)",
    maturity: "ROADMAP",
    authState: "Not shipped as native connectors in this repo snapshot",
    worksSummary: "KitchenOS ingests commerce via storefront, manual orders, and supported e-commerce channels.",
    gapsSummary:
      "Deep two-way sync with legacy POS is a partner-heavy roadmap item — do not sell as available without an explicit integration contract.",
    webhookSupport: "Varies by vendor when built",
    syncDirection: "Future: TBD",
    setupHref: "/dashboard/sales-channels",
    docsHref: "/help/getting-started",
  };

  return [stripeRow, resendRow, mapsRow, openaiRow, posRow, csvRow, externalPosRow];
}
