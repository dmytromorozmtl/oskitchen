import {
  DEMO_PAGE_IMPROVEMENT_HEADLINE,
  DEMO_PAGE_IMPROVEMENT_ROUTE,
} from "@/lib/marketing/demo-page-improvement-policy";

export const DEMO_PAGE_IMPROVEMENT_EYEBROW =
  "Interactive sandbox · Guided video tour" as const;

export const DEMO_PAGE_IMPROVEMENT_SUBLINE =
  "Click through five operator stops before launching a temp workspace — or follow the 5-minute guided tour script for a sales-ready walkthrough. Demo channels stay simulated until you wire real credentials." as const;

/** Five interactive sandbox stops — maps to golden demo scenario routes. */
export const DEMO_PAGE_IMPROVEMENT_SANDBOX_STOPS = [
  {
    id: "today",
    label: "Today",
    route: "/dashboard/today",
    title: "Owner Command Center",
    description:
      "Daily briefing, playbooks, and Integration Health alerts — honest BETA/SKIPPED labels, not fake green.",
    highlight: "Start here after launch",
  },
  {
    id: "orders",
    label: "Orders",
    route: "/dashboard/orders",
    title: "Unified order hub",
    description:
      "Shopify, WooCommerce, storefront, and POS orders in one queue — channel badges and drill-in detail.",
    highlight: "50 sample orders seeded",
  },
  {
    id: "kitchen",
    label: "KDS",
    route: "/dashboard/kitchen",
    title: "Kitchen display + production",
    description:
      "Bump tickets, station routing, and prep checkpoints — typical rush-hour flow without hardware lock-in.",
    highlight: "Live KDS in sandbox",
  },
  {
    id: "pos",
    label: "POS",
    route: "/dashboard/pos",
    title: "Software-first checkout",
    description:
      "Open shift, ring items, capture payment — verify totals against your typical ticket mix.",
    highlight: "No terminal required",
  },
  {
    id: "integrations",
    label: "Health",
    route: "/dashboard/integration-health",
    title: "Integration Health",
    description:
      "PASS, SKIPPED, or FAILED per channel — recovery playbooks when webhooks drift before service.",
    highlight: "Honest status moat",
  },
] as const;

/** Five guided video tour segments — aligned with docs/demo-video-script-5min.md. */
export const DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_SEGMENTS = [
  {
    id: "hook",
    time: "0:00–0:30",
    title: "Hook — one OS for food ops",
    route: DEMO_PAGE_IMPROVEMENT_ROUTE,
  },
  {
    id: "today",
    time: "0:30–1:15",
    title: "Today + owner briefing",
    route: "/dashboard/today",
  },
  {
    id: "orders",
    time: "1:15–2:00",
    title: "Orders + Integration Health",
    route: "/dashboard/orders",
  },
  {
    id: "kitchen",
    time: "2:00–2:45",
    title: "Kitchen + KDS line",
    route: "/dashboard/kitchen",
  },
  {
    id: "close",
    time: "2:45–5:00",
    title: "POS, channels, pricing close",
    route: "/pricing",
  },
] as const;

export const DEMO_PAGE_IMPROVEMENT_VIDEO_SCRIPT_DOC = "docs/demo-video-script-5min.md" as const;

export const DEMO_PAGE_IMPROVEMENT_PRIMARY_CTA = {
  label: "Launch interactive sandbox",
  action: "launch_demo" as const,
} as const;

export const DEMO_PAGE_IMPROVEMENT_SECONDARY_CTA = {
  label: "Book a live walkthrough",
  href: "/book-demo?utm_source=demo&utm_medium=guided_tour&utm_campaign=demo-page-p1-83",
} as const;

export { DEMO_PAGE_IMPROVEMENT_HEADLINE, DEMO_PAGE_IMPROVEMENT_ROUTE };
