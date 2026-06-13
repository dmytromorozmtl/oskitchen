import {
  INTEGRATION_HEALTH_CENTER_CONNECTED_MODULES,
  INTEGRATION_HEALTH_CENTER_EXAMPLE_WORKFLOW,
  INTEGRATION_HEALTH_CENTER_INTEGRATION_NOTE,
  INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES,
} from "@/lib/integrations/integration-health-center-product-content";

import {
  INTEGRATION_HEALTH_CENTER_SALES_HOOK,
  INTEGRATION_HEALTH_CENTER_SALES_HOOK_SUBTITLE,
} from "@/lib/marketing/integration-health-sales-p1-24-content";

export const INTEGRATION_HEALTH_CENTER_MARKETING_PATH = "/integration-health-center" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_META = {
  title: "See Why Your DoorDash Integration Failed — Integration Health Center | OS Kitchen",
  description:
    "See exactly why your DoorDash integration failed — auth errors, webhook signatures, stale menu sync, and SKIPPED labels with recovery playbooks. Honest integration monitoring. 14-day free trial.",
  keywords: [
    "restaurant integration monitoring",
    "integration health dashboard",
    "webhook monitoring restaurant",
    "shopify woocommerce sync health",
    "restaurant POS integration status",
  ],
  utmCampaign: "integration_health_center_marketing",
} as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_BADGE =
  "Main differentiator — honest integration ops" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_H1 = INTEGRATION_HEALTH_CENTER_SALES_HOOK;

export const INTEGRATION_HEALTH_CENTER_MARKETING_SUBTITLE =
  INTEGRATION_HEALTH_CENTER_SALES_HOOK_SUBTITLE;

export const INTEGRATION_HEALTH_CENTER_MARKETING_PAIN_POINTS = [
  {
    title: "Silent webhook failures",
    description:
      "Orders stop flowing while the POS tile stays green — operators discover the gap mid-service, not before prep.",
  },
  {
    title: "Sales oversells integrations",
    description:
      "Demo workspaces hide missing partner credentials — production rush hour exposes BETA and SKIPPED channels without warning.",
  },
  {
    title: "No recovery playbook",
    description:
      "When Shopify sync degrades, teams grep logs and Slack — no alert-to-playbook path tied to Today Command Center.",
  },
] as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_COMPARISON = {
  title: "How Integration Health Center compares",
  competitorALabel: "Incumbent POS tiles",
  competitorBLabel: "Generic monitoring SaaS",
  rows: [
    { feature: "Per-channel health score", kitchenos: "✅", competitorA: "Limited", competitorB: "✅" },
    { feature: "SKIPPED / BETA honesty labels", kitchenos: "✅", competitorA: "❌", competitorB: "Varies" },
    { feature: "Recovery playbooks in-app", kitchenos: "✅", competitorA: "❌", competitorB: "Add-on" },
    { feature: "Today Command Center alerts", kitchenos: "✅", competitorA: "Limited", competitorB: "❌" },
    { feature: "Hardware fleet posture", kitchenos: "✅ Pilot", competitorA: "Varies", competitorB: "❌" },
    { feature: "14-day trial", kitchenos: "✅", competitorA: "Varies", competitorB: "Varies" },
  ],
} as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_FAQ = [
  {
    question: "Does a high health score guarantee uptime?",
    answer:
      "No — scores are operational signals from sync freshness, webhook failures, and credential checks. They are not guaranteed uptime or SLA commitments.",
  },
  {
    question: "What does SKIPPED mean on a channel?",
    answer:
      "Partner credentials are missing or smoke proof has not run — we label SKIPPED instead of showing fake green connected badges.",
  },
  {
    question: "Are DoorDash and Uber Eats live for everyone?",
    answer:
      "No — marketplace delivery live ops remain partner-gated or SKIPPED until your credentials and pilot scope allow. Health Center reflects that honestly.",
  },
  {
    question: "How is this different from the product page?",
    answer:
      "This marketing page explains the moat for prospects. The product page at /product/integration-health-center covers module details; the live dashboard is at /dashboard/integration-health after signup.",
  },
] as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_LIMITATIONS = [
  "Health scores are workspace signals — not third-party SLA guarantees or investor-grade uptime claims.",
  "Live marketplace ops (DoorDash/Uber) remain partner-gated or SKIPPED until credentialed in pilot.",
  "Hardware fleet view covers registered devices — not proprietary Clover-style hub telemetry parity.",
  "Recovery playbooks track success rates — they do not auto-fix partner outages without operator action.",
] as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_CTA = {
  title: "Prove integration state before you bet rush hour on a webhook",
  subtitle:
    "Start a 14-day trial. Connect WooCommerce or Shopify test shops and review honest maturity labels in Integration Health Center.",
  signupHref: "/signup?redirect=/dashboard/integration-health",
  bookDemoHref: "/book-demo",
  productHref: "/product/integration-health-center",
} as const;

export function integrationHealthCenterMarketingCtaHref(
  base: "/signup" | "/book-demo" | "/demo" | "/pricing",
): string {
  const params = new URLSearchParams({
    utm_source: "landing",
    utm_medium: "seo",
    utm_campaign: INTEGRATION_HEALTH_CENTER_MARKETING_META.utmCampaign,
  });
  if (base === "/signup") {
    params.set("redirect", "/dashboard/integration-health");
  }
  return `${base}?${params.toString()}`;
}

export function getIntegrationHealthCenterMarketingFeatures() {
  return INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES;
}

export {
  INTEGRATION_HEALTH_CENTER_CONNECTED_MODULES,
  INTEGRATION_HEALTH_CENTER_EXAMPLE_WORKFLOW,
  INTEGRATION_HEALTH_CENTER_INTEGRATION_NOTE,
};
