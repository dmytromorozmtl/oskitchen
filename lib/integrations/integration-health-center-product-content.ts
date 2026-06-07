import type { IntegrationHealthCenterProductFeatureId } from "@/lib/integrations/integration-health-center-product-absolute-final-policy";

export type IntegrationHealthCenterProductFeature = {
  id: IntegrationHealthCenterProductFeatureId;
  title: string;
  description: string;
  dashboardPath: string;
};

export const INTEGRATION_HEALTH_CENTER_PRODUCT_HEADLINE =
  "Honest integration ops — score, alerts, and recovery before rush hour";

export const INTEGRATION_HEALTH_CENTER_PRODUCT_DESCRIPTION =
  "Integration Health Center shows what is actually connected in your workspace: maturity tiers, webhook backlog, recovery playbooks, and hardware fleet posture — with SKIPPED and BETA labels instead of fake green badges.";

export const INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES: IntegrationHealthCenterProductFeature[] =
  [
    {
      id: "health_score",
      title: "0–100 health score",
      description:
        "Per-connection and workspace rollup from sync freshness, webhook failures, latency, and credential status — transparent bands: Healthy ≥80, Watch 55–79, Critical <55.",
      dashboardPath: "/dashboard/integration-health",
    },
    {
      id: "predictive_alerts",
      title: "Predictive alerts",
      description:
        "Six alert codes — critical score, declining trend, stale sync, webhook failures, latency spike, auth degraded — surfaced on Today and Integration Health Center.",
      dashboardPath: "/dashboard/integration-health",
    },
    {
      id: "recovery_playbooks",
      title: "Recovery playbooks",
      description:
        "Alert-to-playbook mapping with auto steps (health check, inventory pull) and manual operator steps. Success rate tracked per connection — not a guarantee of uptime.",
      dashboardPath: "/dashboard/error-recovery",
    },
    {
      id: "maturity_matrix",
      title: "Honest maturity matrix",
      description:
        "Every channel labeled LIVE, BETA, SETUP_READY, PARTNER_ACCESS_REQUIRED, or ROADMAP — aligned with feature maturity matrix and sales-safe claims registry.",
      dashboardPath: "/dashboard/integration-health",
    },
    {
      id: "live_proof_smoke",
      title: "Live proof & smoke artifacts",
      description:
        "Woo/Shopify live proof slices and smoke artifact viewer — PASS, SKIPPED, or FAILED with reason. No investor-grade uptime claim without captured pilot data.",
      dashboardPath: "/dashboard/sales-channels/health",
    },
    {
      id: "hardware_device_fleet",
      title: "Hardware device fleet",
      description:
        "Registers, POS terminals, and Stripe readers in one fleet view — online/offline posture and manage links. Not proprietary Clover-style hub telemetry.",
      dashboardPath: "/dashboard/integration-health",
    },
  ];

export const INTEGRATION_HEALTH_CENTER_CONNECTED_MODULES = [
  "Order hub",
  "Sales channels",
  "Webhooks",
  "Product mapping",
  "Today Command Center",
  "Error recovery",
] as const;

export const INTEGRATION_HEALTH_CENTER_EXAMPLE_WORKFLOW =
  "Shopify webhook fails silently → alert fires on Integration Health Center → recovery playbook suggests credential check and webhook queue review → operator resolves before Monday reconciliation.";

export const INTEGRATION_HEALTH_CENTER_INTEGRATION_NOTE =
  "Live marketplace ops (DoorDash, Uber Eats) remain partner-gated or SKIPPED until your credentials and pilot scope allow. A health score and playbook do not imply guaranteed cross-channel uptime.";

export const INTEGRATION_HEALTH_CENTER_CTA = {
  href: "/signup",
  label: "Start trial",
  dashboardHref: "/dashboard/integration-health",
  dashboardLabel: "Open Integration Health Center",
} as const;
