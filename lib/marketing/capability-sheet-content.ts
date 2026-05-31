/** Public capability sheet — sales-safe; aligned with CAPABILITY_SIGNOFF_SALES.md */

export type CapabilityStatus = 'live' | 'beta' | 'setup' | 'partial' | 'roadmap' | 'unavailable';

export type CapabilityRow = {
  name: string;
  status: CapabilityStatus;
  summary: string;
};

export const CAPABILITY_SHEET_COPY = {
  metaTitle: 'OS Kitchen Capabilities — What We Ship Today',
  metaDescription:
    'Honest capability matrix for OS Kitchen: live pilot features, beta disclosures, and out-of-scope items. For sales and technical evaluation.',
  eyebrow: 'Capability sheet',
  headline: 'What OS Kitchen ships today — and what we do not claim',
  subheadline:
    'Use this page in procurement and pilot conversations. Status labels match engineering sign-off; marketing and sales copy must not exceed this matrix.',
  disclaimer:
    'OS Kitchen is in paid pilot for meal prep, preorder, and daily-service operators. General availability gates apply before self-serve enterprise SLAs.',
  updated: 'May 2026',
} as const;

export const STATUS_LABELS: Record<CapabilityStatus, string> = {
  live: 'Live (pilot)',
  beta: 'Beta',
  setup: 'Setup-ready',
  partial: 'Partial',
  roadmap: 'Roadmap',
  unavailable: 'Not available',
};

export const APPROVED_CAPABILITIES: CapabilityRow[] = [
  {
    name: 'Orders → production → packing',
    status: 'live',
    summary: 'Core kitchen workflow for preorder and daily service.',
  },
  {
    name: 'CRM & customer profiles',
    status: 'live',
    summary: 'Segments and follow-ups for operator-led sales.',
  },
  {
    name: 'Native preorder storefront',
    status: 'beta',
    summary: 'Branded menu and checkout when Stripe is configured.',
  },
  {
    name: 'Counter POS (web)',
    status: 'beta',
    summary: 'Online counter sales — requires network; not Stripe Terminal hardware.',
  },
  {
    name: 'Kitchen display (KDS)',
    status: 'live',
    summary: 'Real-time tickets, bump, and expo workflows.',
  },
  {
    name: 'WooCommerce / Shopify import',
    status: 'beta',
    summary: 'Per-site credentials and signed webhooks — tenant setup required.',
  },
  {
    name: 'Stripe Checkout',
    status: 'beta',
    summary: 'SaaS billing and storefront payments when keys and webhooks are set.',
  },
  {
    name: 'Email (Resend)',
    status: 'setup',
    summary: 'Transactional email when API key and DNS are configured.',
  },
  {
    name: 'Custom storefront domain',
    status: 'setup',
    summary: 'Customer-owned DNS and TLS.',
  },
];

export const BETA_DISCLOSURES: CapabilityRow[] = [
  {
    name: 'Webhook replay',
    status: 'beta',
    summary: 'Break-glass operator replay — not “safe to replay anytime.”',
  },
  {
    name: 'OpenAI Copilot',
    status: 'beta',
    summary: 'Assistive only — no guaranteed accuracy claims.',
  },
  {
    name: 'Catering deposits',
    status: 'beta',
    summary: 'Stripe deposit links in order flow when configured.',
  },
  {
    name: 'Costing actual vs theoretical',
    status: 'beta',
    summary: 'Variance views for operators monitoring food cost.',
  },
];

export const NOT_AVAILABLE: CapabilityRow[] = [
  {
    name: 'Offline POS',
    status: 'unavailable',
    summary: 'POS requires connectivity for sale finalization.',
  },
  {
    name: 'Stripe Terminal / card readers',
    status: 'unavailable',
    summary: 'In-browser counter checkout only on 2026 roadmap scope.',
  },
  {
    name: 'SMS guest notifications',
    status: 'unavailable',
    summary: 'Email and in-app today.',
  },
  {
    name: 'Native Uber Eats / DoorDash sync',
    status: 'unavailable',
    summary: 'Partner-gated; consolidate via Woo/Shopify or manual orders.',
  },
  {
    name: 'SSO / SCIM',
    status: 'roadmap',
    summary: 'Enterprise Q4 2026 with design partner.',
  },
  {
    name: 'SOC 2 attestation',
    status: 'unavailable',
    summary: 'Security program documented; formal attestation not claimed.',
  },
];
