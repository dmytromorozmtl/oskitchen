import type { ServerEnv } from "@/lib/env";

import type { CapabilityStatus } from "./capability-status";

export type CapabilityRow = {
  id: string;
  label: string;
  status: CapabilityStatus;
  works: string;
  gaps: string;
};

function stripeStatus(env: ServerEnv): CapabilityStatus {
  const ok =
    Boolean(env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(env.STRIPE_WEBHOOK_SECRET?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
  return ok ? "BETA" : "NOT_AVAILABLE";
}

function resendStatus(env: ServerEnv): CapabilityStatus {
  return Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM_EMAIL?.trim()) ? "SETUP_READY" : "NOT_AVAILABLE";
}

function mapsStatus(env: ServerEnv): CapabilityStatus {
  return Boolean(env.GOOGLE_MAPS_API_KEY?.trim()) ? "SETUP_READY" : "NOT_AVAILABLE";
}

function openAiStatus(env: ServerEnv): CapabilityStatus {
  return Boolean(env.OPENAI_API_KEY?.trim()) ? "BETA" : "ROADMAP";
}

/** Single source of truth for product + infrastructure capabilities. */
export function buildCapabilityRows(env: ServerEnv): CapabilityRow[] {
  return [
    {
      id: "woocommerce",
      label: "WooCommerce order import",
      status: "BETA",
      works: "Signed webhooks, catalog sync hooks, normalized external orders when configured.",
      gaps: "High-volume sites should enable WEBHOOK_ASYNC_QUEUE + cron worker — see webhook architecture doc.",
    },
    {
      id: "shopify",
      label: "Shopify order import",
      status: "BETA",
      works:
        "Signed webhooks for orders/products; tenant routing via shop domain. Async queue supported when WEBHOOK_ASYNC_QUEUE=true (same worker as WooCommerce).",
      gaps: "End-to-end production certification is tenant-specific — validate HMAC, topics, and idempotency per shop.",
    },
    {
      id: "uber_eats",
      label: "Uber Eats marketplace",
      status: "PARTNER_ACCESS_REQUIRED",
      works: "Adapter + staging paths exist for evaluation; not a certified production Uber integration.",
      gaps: "Requires Uber partnership, legal review, and live signing contract before marketing as available.",
    },
    {
      id: "uber_direct",
      label: "Uber Direct dispatch",
      status: "ROADMAP",
      works: "Routing placeholders and documentation only.",
      gaps: "No live courier dispatch — do not promise Uber-branded delivery without Uber Direct onboarding.",
    },
    {
      id: "doordash",
      label: "DoorDash",
      status: "ROADMAP",
      works: "Preparation-only integration page; no live quote, delivery, or import.",
      gaps: "Treat any UI mention as placeholder until a signed integration program exists.",
    },
    {
      id: "grubhub",
      label: "Grubhub",
      status: "ROADMAP",
      works: "Preparation-only integration page; no live menu sync or order ingestion.",
      gaps: "Credentials do not unlock live provider traffic — placeholder-only by design.",
    },
    {
      id: "stripe_checkout",
      label: "Stripe Checkout (billing & storefront)",
      status: stripeStatus(env),
      works: "Server SDK paths for subscriptions and storefront checkout when keys + webhook secret exist.",
      gaps: "LIVE requires real production charges, reconciliation, and monitoring — not auto-certified here.",
    },
    {
      id: "stripe_terminal",
      label: "Stripe Terminal (hardware)",
      status: "ROADMAP",
      works: "OS Kitchen POS uses first-party flows — not Stripe Terminal SDK.",
      gaps: "No Stripe reader certification in-repo; external terminal mode refers to OS Kitchen counter UX only.",
    },
    {
      id: "stripe_async_billing",
      label: "Stripe billing webhooks (async / outbox)",
      status: "DESIGN_READY",
      works:
        "Production today uses synchronous Stripe webhook handling with existing idempotency guards where implemented.",
      gaps:
        "Async billing ingestion requires an approved outbox + idempotency migration — documented only in this release pass; do not claim async Stripe until shipped.",
    },
    {
      id: "resend",
      label: "Resend email",
      status: resendStatus(env),
      works: "Transactional templates when API key + from address configured.",
      gaps: "Deliverability (SPF/DKIM) and bounce handling are operator responsibility.",
    },
    {
      id: "sms",
      label: "SMS notifications",
      status: "NOT_AVAILABLE",
      works: "Channel enum placeholder only.",
      gaps: "No production SMS provider wired — disable any marketing claim of SMS alerts.",
    },
    {
      id: "google_maps",
      label: "Google Maps",
      status: mapsStatus(env),
      works: "Embeds when server key present.",
      gaps: "Quota, billing, and key restrictions live in Google Cloud console.",
    },
    {
      id: "openai",
      label: "OpenAI",
      status: openAiStatus(env),
      works: "Optional model-backed assist when key present; deterministic fallbacks otherwise.",
      gaps: "Enterprise DPA / data processing terms are separate from OS Kitchen software readiness.",
    },
    {
      id: "pos_offline",
      label: "POS offline mode",
      status: "NOT_AVAILABLE",
      works: "—",
      gaps: "No offline checkout queue — POS requires connectivity for sale finalization.",
    },
    {
      id: "native_storefront",
      label: "Native storefront",
      status: "BETA",
      works: "Preorder surfaces, themes, Stripe-backed checkout when configured.",
      gaps: "Large catalog performance and SEO should be validated per deployment.",
    },
    {
      id: "custom_domain",
      label: "Custom domain / vanity host",
      status: "SETUP_READY",
      works: "Middleware rewrite paths when DNS + env secrets configured.",
      gaps: "Certificate and DNS ownership are operator-side responsibilities.",
    },
    {
      id: "csv_import_export",
      label: "CSV import / export",
      status: "PARTIAL",
      works: "Moderate-size CSV flows via import center and exports.",
      gaps: "Huge files need object storage + background workers — see background jobs doc.",
    },
    {
      id: "api_keys",
      label: "Workspace API keys",
      status: "BETA",
      works: "Developer surface issues keys for authenticated automation where implemented.",
      gaps: "Public API rate limits and audit coverage continue to harden — see security doc.",
    },
    {
      id: "webhook_replay",
      label: "Webhook replay",
      status: "BETA",
      works:
        "Audited replay for WooCommerce/Shopify when async queue or inline path applies; platform operators need platform:integrations:repair.",
      gaps:
        "Replay can duplicate commerce side effects if partner idempotency keys are absent — treat as break-glass. Stripe billing webhooks remain synchronous until async outbox ships (see capability matrix).",
    },
    {
      id: "sso",
      label: "SSO (SAML/OIDC)",
      status: "ROADMAP",
      works: "—",
      gaps: "Enterprise roadmap — trust page must not imply SSO is live.",
    },
    {
      id: "scim",
      label: "SCIM directory sync",
      status: "ROADMAP",
      works: "—",
      gaps: "Not implemented.",
    },
    {
      id: "soc2",
      label: "SOC 2 certification",
      status: "ROADMAP",
      works: "Operational and security foundations documented.",
      gaps: "No formal SOC2 attestation is claimed by OS Kitchen in product copy.",
    },
    {
      id: "dpa_data_rights",
      label: "DPA / export / delete workflows",
      status: "PARTIAL",
      works: "Legal templates + policy gating via LEGAL_POLICIES_PUBLISHED; data-rights pages describe process.",
      gaps: "Legal counsel must approve production copy; automated self-serve DSR pipeline is partial.",
    },
  ];
}
