import { APP_NAME } from "@/lib/constants";

export const PRODUCT_MARKETING_SLUGS = [
  "order-hub",
  "production",
  "packing",
  "routes",
  "product-mapping",
  "analytics",
] as const;

export type ProductMarketingSlug = (typeof PRODUCT_MARKETING_SLUGS)[number];

export function parseProductMarketingSlug(raw: string): ProductMarketingSlug | null {
  return PRODUCT_MARKETING_SLUGS.includes(raw as ProductMarketingSlug) ? (raw as ProductMarketingSlug) : null;
}

export const productMarketingPages: Record<
  ProductMarketingSlug,
  {
    title: string;
    headline: string;
    description: string;
    connectedModules: string[];
    exampleWorkflow: string;
    integrationNote: string;
    ctaHref: string;
    ctaLabel: string;
  }
> = {
  "order-hub": {
    title: `Order hub — ${APP_NAME}`,
    headline: "One queue for POS, storefront, imports, and shaped channel payloads",
    description:
      "Normalize intake, exceptions, and lifecycle states before production sees the ticket. Marketplace depth depends on your credentials and provider maturity — KitchenOS does not claim live Toast/DoorDash without your connection.",
    connectedModules: ["Production", "Packing", "Routes", "CRM", "Integration health"],
    exampleWorkflow: "Order arrives → triage mapping gaps → schedule fulfillment → hand to kitchen.",
    integrationNote: "WooCommerce/Shopify are setup-ready with credentials; delivery marketplaces are partner-gated or roadmap per channel.",
    ctaHref: "/signup",
    ctaLabel: "Start trial",
  },
  production: {
    title: `Production — ${APP_NAME}`,
    headline: "Station-aware production without pretending the POS is the source of truth",
    description:
      "Batch-friendly work items, kitchen views, and honest status when recipes or demand data are incomplete.",
    connectedModules: ["Order hub", "Menu & recipes", "Packing", "Labor"],
    exampleWorkflow: "Released order → kitchen work items → completion signals packing.",
    integrationNote: "Deep equipment or IoT integrations are not claimed; production runs on KitchenOS tasks and your configured menus.",
    ctaHref: "/signup",
    ctaLabel: "Start trial",
  },
  packing: {
    title: `Packing & labels — ${APP_NAME}`,
    headline: "Verify bags, lanes, and handoff with scanner-friendly flows where enabled",
    description:
      "Packing tasks and label paths tie to real order lines — no fabricated carrier integrations.",
    connectedModules: ["Production", "Routes", "Storefront policies"],
    exampleWorkflow: "Production complete → packing checklist → pickup or dispatch lane.",
    integrationNote: "Third-party label printers work through your browser/OS print path; proprietary hardware partnerships are not implied.",
    ctaHref: "/signup",
    ctaLabel: "Start trial",
  },
  routes: {
    title: `Routes & dispatch — ${APP_NAME}`,
    headline: "Plan manifests and driver handoff when delivery is in scope",
    description:
      "Pickup-first businesses can leave routing minimal; delivery needs addresses and honest geographies for Uber Direct or manual dispatch.",
    connectedModules: ["Order hub", "Packing", "CRM"],
    exampleWorkflow: "Packed orders → route plan → driver pickup → completion analytics.",
    integrationNote: "Uber Direct requires your credentials and supported geography; no silent live dispatch is claimed without configuration.",
    ctaHref: "/signup",
    ctaLabel: "Start trial",
  },
  "product-mapping": {
    title: `Product mapping — ${APP_NAME}`,
    headline: "Resolve external SKUs to kitchen catalog items with approval discipline",
    description:
      "Unmapped lines stay visible as operational blockers until a human maps them — no fake auto-mapping from marketplaces.",
    connectedModules: ["Sales channels", "Order hub", "Production"],
    exampleWorkflow: "Channel line → mapping proposal → approval → downstream work unlocks.",
    integrationNote: "Channel-specific behavior follows integration maturity (live, beta, setup-ready, partner-required, roadmap).",
    ctaHref: "/signup",
    ctaLabel: "Start trial",
  },
  analytics: {
    title: `Analytics — ${APP_NAME}`,
    headline: "Workspace-grounded reporting — not a black-box finance replacement",
    description:
      "Revenue snapshots, labor, costing confidence, and AvT foundations reflect data you have stored. Full accounting parity (e.g. R365-class) is explicitly out of scope for this release.",
    connectedModules: ["Orders", "Costing", "Labor", "Exports"],
    exampleWorkflow: "Operational completion → rollups → CSV exports where available.",
    integrationNote: "BI connectors and SOC2 attested warehouses are roadmap unless separately contracted.",
    ctaHref: "/signup",
    ctaLabel: "Start trial",
  },
};
