/**
 * Blueprint P1-29 — Interactive demo sandbox content (simulated workspace + Integration Health).
 */

import { DEMO_PAGE_P1_29_HEADLINE } from "@/lib/marketing/demo-page-p1-29-policy";

export const DEMO_PAGE_P1_29_EYEBROW = "Interactive sandbox · Integration Health" as const;

export const DEMO_PAGE_P1_29_SUBLINE =
  "Click through a simulated workspace before launching the temp demo — Integration Health shows PASS, SKIPPED, and FAILED per channel with recovery playbooks. All data is simulated; verify LIVE status in your own pilot." as const;

export type DemoSandboxChannelStatus = "PASS" | "SKIPPED" | "FAILED";

export type DemoSandboxIntegrationChannel = {
  id: string;
  label: string;
  status: DemoSandboxChannelStatus;
  code: string | null;
  lastSync: string;
  detail: string;
  playbook: string;
};

/** Six simulated Integration Health channels — honest SKIPPED/FAILED examples included. */
export const DEMO_PAGE_P1_29_INTEGRATION_CHANNELS: readonly DemoSandboxIntegrationChannel[] = [
  {
    id: "doordash",
    label: "DoorDash",
    status: "FAILED",
    code: "AUTH_DEGRADED",
    lastSync: "14h ago",
    detail: "OAuth token expired — last successful catalog sync 14 hours ago.",
    playbook: "Re-authenticate DoorDash partner credentials",
  },
  {
    id: "shopify",
    label: "Shopify",
    status: "PASS",
    code: null,
    lastSync: "2m ago",
    detail: "Webhook HMAC verified — orders routing to KDS in sandbox.",
    playbook: "Run test order from dev storefront",
  },
  {
    id: "woocommerce",
    label: "WooCommerce",
    status: "PASS",
    code: null,
    lastSync: "5m ago",
    detail: "Signed webhooks healthy — typical meal-prep preorder flow.",
    playbook: "Review SKU → kitchen item mapping",
  },
  {
    id: "ubereats",
    label: "Uber Eats",
    status: "SKIPPED",
    code: "PARTNER_CREDS_MISSING",
    lastSync: "Never",
    detail: "No fake green badge — partner credentials not configured in sandbox.",
    playbook: "Connect partner credentials when pilot scope allows",
  },
  {
    id: "storefront",
    label: "Owned storefront",
    status: "PASS",
    code: null,
    lastSync: "1m ago",
    detail: "QR and web checkout orders appear in unified queue.",
    playbook: "Open storefront menu preview",
  },
  {
    id: "pos",
    label: "In-store POS",
    status: "PASS",
    code: null,
    lastSync: "Live",
    detail: "Software-first checkout — shift open, tickets sync to KDS.",
    playbook: "Open shift in POS sandbox",
  },
] as const;

export type DemoSandboxWorkspaceStop = {
  id: string;
  label: string;
  route: string;
  previewTitle: string;
  previewDetail: string;
};

/** Five workspace stops — Integration Health is the default interactive panel. */
export const DEMO_PAGE_P1_29_WORKSPACE_STOPS: readonly DemoSandboxWorkspaceStop[] = [
  {
    id: "today",
    label: "Today",
    route: "/dashboard/today",
    previewTitle: "Owner Command Center",
    previewDetail: "Daily briefing with Integration Health alerts — honest BETA/SKIPPED labels.",
  },
  {
    id: "orders",
    label: "Orders",
    route: "/dashboard/orders",
    previewTitle: "Unified order hub",
    previewDetail: "50 sample orders across Shopify, WooCommerce, storefront, and POS.",
  },
  {
    id: "kitchen",
    label: "KDS",
    route: "/dashboard/kitchen",
    previewTitle: "Kitchen display",
    previewDetail: "Bump tickets, station routing, expo handoff — typical rush flow.",
  },
  {
    id: "pos",
    label: "POS",
    route: "/dashboard/pos",
    previewTitle: "Software-first checkout",
    previewDetail: "Open shift, ring items, capture payment — verify against your ticket mix.",
  },
  {
    id: "integration-health",
    label: "Health",
    route: "/dashboard/integration-health",
    previewTitle: "Integration Health Center",
    previewDetail: "PASS, SKIPPED, or FAILED per channel — click any row for playbook.",
  },
] as const;

export const DEMO_PAGE_P1_29_DEFAULT_CHANNEL_ID = "doordash" as const;

export const DEMO_PAGE_P1_29_DEFAULT_STOP_ID = "integration-health" as const;

export const DEMO_PAGE_P1_29_DISCLAIMER =
  "Sandbox data is simulated for exploration — not your workspace. Launch the temp demo for a full 2-hour workspace with seeded orders. DoorDash/Uber Eats may show SKIPPED until partner credentials are wired." as const;

export { DEMO_PAGE_P1_29_HEADLINE };
