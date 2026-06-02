export type PlatformDifferentiatorItem = {
  title: string;
  description: string;
  badge?: string;
};

export type PlatformDifferentiatorBlock = {
  tag: string;
  title: string;
  description: string;
  items: readonly PlatformDifferentiatorItem[];
  footnote: string;
};

/** Shared AI moats block — aligns with docs/ai-moats-honest-positioning.md */
export const MARKETING_AI_MOATS_BLOCK: PlatformDifferentiatorBlock = {
  tag: "AI modules",
  title: "7 proprietary AI modules in production",
  description:
    "Each module ships in the codebase at qualified maturity — pilot proof in progress, not magic for every workflow or tenant.",
  items: [
    {
      title: "AI Restaurant Brain",
      description:
        "Deterministic daily briefing on Today Command Center from hub, KDS, and inventory signals.",
      badge: "Pilot ready",
    },
    {
      title: "Digital Twin",
      description: "Station load simulation from live order flow — planning view, not a physical IoT mirror.",
      badge: "BETA",
    },
    {
      title: "Universal Menu Engine",
      description: "Cross-channel menu structure with sync hooks — channel maturity varies per integration.",
      badge: "BETA",
    },
    {
      title: "Food Cost AI",
      description: "Recipe costing and margin alerts when recipes and yields are configured accurately.",
      badge: "Pilot ready",
    },
    {
      title: "AI Purchasing",
      description: "EOQ-style reorder suggestions with buyer approval gate — deterministic math, not autopilot POs.",
      badge: "BETA",
    },
    {
      title: "Kitchen Camera AI",
      description: "Camera-ready station view with detection module slots — synthetic preview by default.",
      badge: "BETA",
    },
    {
      title: "Benchmark Network",
      description: "Anonymized cohort comparisons — illustrative until cohort N grows beyond early pilots.",
      badge: "BETA",
    },
  ],
  footnote:
    "Not autonomous AGI, guaranteed margin lift, or live computer vision without per-module evidence in your workspace.",
};

/** Shared B2B marketplace block — aligns with docs/sales-safe-claims-registry.md */
export const MARKETING_B2B_MARKETPLACE_BLOCK: PlatformDifferentiatorBlock = {
  tag: "B2B marketplace",
  title: "HoReCa buyer marketplace (BETA scaffold)",
  description:
    "Catalog → cart → checkout → purchase order path for commissary buyers — engineering shipped; vendor seeding and pilot tenants required.",
  items: [
    {
      title: "Buyer catalog",
      description:
        "Browse vendor SKUs by HoReCa category when vendors are onboarded in your workspace — not a live national vendor network yet.",
    },
    {
      title: "Cart & checkout",
      description:
        "Checkout creates purchase orders with approval gates where configured — Stripe Connect vendor onboarding in test scope.",
    },
    {
      title: "Ops handoff",
      description:
        "POs flow into inventory and purchasing workflows on the same spine as POS and channel orders when configured.",
    },
  ],
  footnote:
    "Say scaffold live in engineering — 0 signed marketplace customers at pre-scale. Not Amazon Business or Sysco parity.",
};
