import {
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE,
  INTEGRATION_HEALTH_MARKETING_ROUTE,
} from "@/lib/marketing/integration-health-marketing-policy";

export const INTEGRATION_HEALTH_MARKETING_EXPLAINER_EYEBROW =
  "Explainer — how Integration Health works" as const;

export const INTEGRATION_HEALTH_MARKETING_EXPLAINER_SUBLINE =
  "Incumbent POS dashboards assume channels are live. OS Kitchen shows PASS, SKIPPED, or FAILED per integration — then alerts and playbooks when something breaks." as const;

/** Three-step explainer concept for marketing landing sections. */
export const INTEGRATION_HEALTH_MARKETING_EXPLAINER_STEPS = [
  {
    id: "see_status",
    step: "1",
    title: "See honest status",
    description:
      "Every channel gets a health score and maturity label — Healthy, Watch, SKIPPED, or FAILED. No blanket “connected” badge.",
    icon: "activity",
  },
  {
    id: "get_alerted",
    step: "2",
    title: "Get alerted early",
    description:
      "Predictive alerts surface webhook failures and sync drift before rush hour — surfaced on Today and Integration Health Center.",
    icon: "bell",
  },
  {
    id: "recover_fast",
    step: "3",
    title: "Recover with playbooks",
    description:
      "Recovery playbooks link from alerts to operator steps — re-auth credentials, replay webhooks, or escalate to support.",
    icon: "book",
  },
] as const;

export const INTEGRATION_HEALTH_MARKETING_EXPLAINER_CTA = {
  label: "Explore Integration Health Center",
  href: INTEGRATION_HEALTH_MARKETING_ROUTE,
} as const;

export {
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE,
  INTEGRATION_HEALTH_MARKETING_ROUTE,
};
