export const OWN_YOUR_CHANNEL_UPSELL_PATH = "/own-your-channel" as const;

export const OWN_YOUR_CHANNEL_UPSELL_META = {
  title: "Own Your Channel — Marketplace to Storefront | OS Kitchen",
  description:
    "Shift repeat customers from 25% marketplace commission to an owned storefront with payment processing only. Honest pilot scope — delivery marketplaces remain partner-gated.",
  utmCampaign: "own_your_channel_upsell",
} as const;

export type OwnYourChannelUpsellStepId = "assess" | "compare" | "launch";

export type OwnYourChannelUpsellStep = {
  id: OwnYourChannelUpsellStepId;
  title: string;
  headline: string;
  description: string;
  bullets: readonly string[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export const OWN_YOUR_CHANNEL_UPSELL_STEPS: OwnYourChannelUpsellStep[] = [
  {
    id: "assess",
    title: "Assess",
    headline: "Know what marketplaces actually cost you",
    description:
      "Most operators discover commission drag in monthly settlements — not on the POS tile. Start with directional benchmarks, then reconcile reported fees in Delivery Commissions.",
    bullets: [
      "Per-order rollups for DoorDash, Uber Eats, Grubhub, Uber Direct",
      "Reported vs estimated benchmark labels — no fake green",
      "Effective commission rate across your delivery mix",
    ],
    primaryCta: {
      label: "Open delivery commissions",
      href: "/dashboard/analytics/delivery-commissions",
    },
    secondaryCta: {
      label: "Run commission calculator",
      href: "/commission-comparison",
    },
  },
  {
    id: "compare",
    title: "Compare",
    headline: "Marketplace commission vs owned storefront",
    description:
      "Model the same order volume on an owned channel: payment processing only (~2.9% directional benchmark), plus OS Kitchen subscription — not another 25% marketplace take.",
    bullets: [
      "Side-by-side monthly commission vs processing-only fees",
      "Channel mix normalization for realistic blended rates",
      "Annual delta is illustrative — not a guaranteed savings claim",
    ],
    primaryCta: {
      label: "Compare commissions",
      href: "/commission-comparison",
    },
    secondaryCta: {
      label: "View pricing",
      href: "/pricing",
    },
  },
  {
    id: "launch",
    title: "Launch",
    headline: "Publish your owned channel",
    description:
      "Connect menu, storefront, and order hub — keep marketplace imports for discovery while repeat customers order direct. Delivery marketplace live ops stay partner-gated until credentialed.",
    bullets: [
      "White-label storefront + order hub in one workspace (BETA labels where applicable)",
      "WooCommerce / Shopify bridge when configured — not fake live badges",
      "Integration Health Center shows SKIPPED until partner creds exist",
    ],
    primaryCta: {
      label: "Set up storefront",
      href: "/dashboard/storefront",
    },
    secondaryCta: {
      label: "Start free trial",
      href: "/signup?redirect=/dashboard/storefront",
    },
  },
] as const;

export const OWN_YOUR_CHANNEL_UPSELL_HONESTY_NOTE =
  "Own-your-channel is a positioning story — not a promise that all delivery volume moves off marketplaces overnight. Reconcile fees against settlement statements; label BETA/SKIPPED integrations honestly in sales materials." as const;

export const OWN_YOUR_CHANNEL_LAUNCH_CHECKLIST = [
  { id: "menu", label: "Publish menu linked to storefront", href: "/dashboard/menus" },
  { id: "storefront", label: "Enable and publish storefront", href: "/dashboard/storefront" },
  { id: "order-hub", label: "Verify orders land in order hub", href: "/dashboard/orders" },
  { id: "health", label: "Review Integration Health Center", href: "/dashboard/integration-health" },
] as const;

export function ownYourChannelUpsellCtaHref(base: "/signup" | "/book-demo"): string {
  const params = new URLSearchParams({
    utm_source: "upsell",
    utm_medium: "own_channel",
    utm_campaign: OWN_YOUR_CHANNEL_UPSELL_META.utmCampaign,
  });
  if (base === "/signup") {
    params.set("redirect", "/dashboard/storefront");
  }
  return `${base}?${params.toString()}`;
}

export function getOwnYourChannelStep(id: OwnYourChannelUpsellStepId): OwnYourChannelUpsellStep {
  const step = OWN_YOUR_CHANNEL_UPSELL_STEPS.find((s) => s.id === id);
  if (!step) {
    return OWN_YOUR_CHANNEL_UPSELL_STEPS[0]!;
  }
  return step;
}
