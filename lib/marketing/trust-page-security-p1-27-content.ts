/**
 * Trust page security detail cards — webhook 59/59, uptime, residency, GDPR, PCI.
 *
 * @see docs/trust-page-security-p1-27.md
 * @see artifacts/webhook-signature-audit.json
 */

import { TRUST_PAGE_SECURITY_P1_27_WEBHOOK_AUDIT_ARTIFACT } from "@/lib/marketing/trust-page-security-p1-27-policy";

/** Static audit baseline — must match artifacts/webhook-signature-audit.json verifiedCount. */
export const TRUST_PAGE_WEBHOOK_SIGNATURE_VERIFIED_COUNT = 59 as const;

export const TRUST_PAGE_WEBHOOK_SIGNATURE_TOTAL_ROUTES = 59 as const;

export const TRUST_PAGE_WEBHOOK_SIGNATURE_AUDIT_OVERALL = "PASSED" as const;

export const TRUST_PAGE_WEBHOOK_AUDIT_ARTIFACT_PATH = TRUST_PAGE_SECURITY_P1_27_WEBHOOK_AUDIT_ARTIFACT;

export type TrustPageSecurityDetailTopic =
  | "webhook-security"
  | "uptime"
  | "data-residency"
  | "gdpr"
  | "pci";

export type TrustPageSecurityDetailCard = {
  id: TrustPageSecurityDetailTopic;
  title: string;
  statusLabel: string;
  summary: string;
  bullets: readonly string[];
  href?: string;
  hrefLabel?: string;
};

export const TRUST_PAGE_SECURITY_DETAIL_CARDS: readonly TrustPageSecurityDetailCard[] = [
  {
    id: "webhook-security",
    title: "Webhook security",
    statusLabel: `${TRUST_PAGE_WEBHOOK_SIGNATURE_VERIFIED_COUNT}/${TRUST_PAGE_WEBHOOK_SIGNATURE_TOTAL_ROUTES} verified`,
    summary:
      "Every inbound webhook route is signature-checked or bearer-gated in code — static audit PASSED with zero unverified ingress routes.",
    bullets: [
      "59 ingress routes across Shopify, WooCommerce, Stripe, DoorDash, Grubhub, and internal jobs",
      "HMAC, bearer secret, or provider-specific verification enforced before handler logic",
      "CI regression: webhook-signature-matrix vitest + static audit artifact on every merge",
      "Static scan only — does not replace live provider replay drills or pen testing",
    ],
    href: "/integrations",
    hrefLabel: "Integration capability matrix",
  },
  {
    id: "uptime",
    title: "Uptime & observability",
    statusLabel: "Health probes — no fabricated SLA",
    summary:
      "Platform reachability is exposed via /api/health and the public /status page. We do not publish fake 99.9% uptime percentages.",
    bullets: [
      "Live checks: database, app, queue mode, rate-limit adapter, optional Sentry server",
      "Public /status and /trust/status pages show honest engineering snapshots",
      "Integration fleet status from staging smoke artifacts — not contractual SLA",
      "External uptime monitor (e.g. Better Stack) is roadmap — see SOC2 controls timeline",
    ],
    href: "/status",
    hrefLabel: "Platform status page",
  },
  {
    id: "data-residency",
    title: "Data residency",
    statusLabel: "US-primary today",
    summary:
      "Production tenants run on US-primary Supabase Postgres and Vercel hosting unless a signed enterprise addendum states otherwise.",
    bullets: [
      "Default regions: managed Postgres (Supabase) + Vercel edge/server — US-primary stack",
      "EU-dedicated production region is roadmap (~15% readiness) — not available for self-serve today",
      "Cross-border transfers rely on subprocessors' DPAs and Standard Contractual Clauses (SCCs)",
      "Do not claim EU-only storage or data stays in the EU until Phase 5 exit criteria pass",
    ],
    href: "/legal/data-rights",
    hrefLabel: "Data rights & subprocessors",
  },
  {
    id: "gdpr",
    title: "GDPR & data subject rights",
    statusLabel: "Operator-assisted — not GDPR certified",
    summary:
      "OS Kitchen supports export and deletion workflows for workspace operators. Formal GDPR certification is not claimed.",
    bullets: [
      "Workspace owners can export orders, customers, products, and integration metadata",
      "Deletion requests require reviewed workflow — operator-assisted DSAR today",
      "EU operators processing EU customer PII need lawful basis + executed DPA with subprocessors",
      "Privacy template at /legal/privacy and /legal/data-rights — counsel review required for contracts",
    ],
    href: "/legal/privacy",
    hrefLabel: "Privacy notice template",
  },
  {
    id: "pci",
    title: "PCI & payment security",
    statusLabel: "Stripe PCI scope — OS Kitchen not merchant of record",
    summary:
      "Card data is processed by Stripe. OS Kitchen stores subscription and Connect identifiers — not primary account numbers (PAN).",
    bullets: [
      "Stripe Connect handles card-present and card-not-present payment flows",
      "OS Kitchen is not a PCI merchant of record or PCI DSS certified platform",
      "Offline POS PCI encryption is BETA — noop-v1 fallback under QSA review (see POS docs)",
      "Do not claim PCI compliance for OS Kitchen — reference Stripe's PCI attestation instead",
    ],
    href: "/trust/status",
    hrefLabel: "Service snapshot",
  },
] as const;

export function trustPageSecurityDetailById(
  id: TrustPageSecurityDetailTopic,
): TrustPageSecurityDetailCard | undefined {
  return TRUST_PAGE_SECURITY_DETAIL_CARDS.find((card) => card.id === id);
}
