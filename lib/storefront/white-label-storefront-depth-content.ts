import type { WhiteLabelDepthCapability } from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";

/** Static ChowNow parity capability matrix — workspace service overlays live maturity. */
export const WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES: Omit<
  WhiteLabelDepthCapability,
  "maturity" | "detail"
>[] = [
  {
    id: "branded_logo",
    pillar: "branded_theme_tokens",
    label: "Custom logo & favicon",
    chowNowLabel: "Branded header logo",
    manageHref: "/dashboard/storefront/theme",
  },
  {
    id: "brand_colors",
    pillar: "branded_theme_tokens",
    label: "Brand color palette",
    chowNowLabel: "Theme colors & typography",
    manageHref: "/dashboard/storefront/theme",
  },
  {
    id: "layout_presets",
    pillar: "branded_theme_tokens",
    label: "Layout & font presets",
    chowNowLabel: "Mobile-friendly menu layout",
    manageHref: "/dashboard/storefront/theme",
  },
  {
    id: "custom_domain",
    pillar: "custom_domain_routing",
    label: "Custom domain routing",
    chowNowLabel: "Order on your own domain",
    manageHref: "/dashboard/storefront/domains",
  },
  {
    id: "subdomain_path",
    pillar: "custom_domain_routing",
    label: "Branded path URL",
    chowNowLabel: "Hosted ordering link",
    manageHref: "/dashboard/storefront",
  },
  {
    id: "direct_ordering",
    pillar: "commission_free_direct_ordering",
    label: "First-party checkout",
    chowNowLabel: "Commission-free direct ordering",
    manageHref: "/dashboard/storefront/ordering",
  },
  {
    id: "owned_channel",
    pillar: "commission_free_direct_ordering",
    label: "Own-your-channel upsell",
    chowNowLabel: "No marketplace middleman",
    manageHref: "/own-your-channel",
  },
  {
    id: "catering_pages",
    pillar: "catering_group_pages",
    label: "Catering & group forms",
    chowNowLabel: "Catering & large-order pages",
    manageHref: "/dashboard/storefront/forms",
  },
  {
    id: "marketing_campaigns",
    pillar: "catering_group_pages",
    label: "Email campaigns",
    chowNowLabel: "Guest marketing tools",
    manageHref: "/dashboard/storefront/marketing",
  },
  {
    id: "branded_pwa",
    pillar: "branded_pwa_install",
    label: "Branded PWA manifest",
    chowNowLabel: "Branded mobile ordering app",
    manageHref: "/branding",
  },
  {
    id: "hide_platform_branding",
    pillar: "branded_pwa_install",
    label: "Hide OS Kitchen branding",
    chowNowLabel: "White-label app icon & splash",
    manageHref: "/dashboard/settings/white-label",
  },
];
