export type KbArticle = {
  slug: string;
  title: string;
  fileName: string;
  moduleHref?: string;
};

/** Operator articles — files live in `docs/knowledge-base/`. */
export const KB_ARTICLES: KbArticle[] = [
  { slug: "getting-started", title: "Getting Started", fileName: "01-getting-started.md", moduleHref: "/dashboard/implementation/checklist" },
  { slug: "first-menu", title: "Creating Your First Menu", fileName: "02-creating-your-first-menu.md", moduleHref: "/dashboard/menus" },
  { slug: "products", title: "Adding Products", fileName: "03-adding-products.md", moduleHref: "/dashboard/menus" },
  { slug: "pos-setup", title: "Setting Up POS", fileName: "04-setting-up-pos.md", moduleHref: "/dashboard/pos" },
  { slug: "accepting-orders", title: "Accepting Orders", fileName: "05-accepting-orders.md", moduleHref: "/dashboard/orders" },
  { slug: "production-board", title: "Production Board", fileName: "06-production-board.md", moduleHref: "/dashboard/production" },
  { slug: "packing-labels", title: "Packing and Labels", fileName: "07-packing-and-labels.md", moduleHref: "/dashboard/packing" },
  { slug: "pickup-delivery", title: "Pickup and Delivery", fileName: "08-managing-pickup-delivery.md", moduleHref: "/dashboard/routes" },
  { slug: "stripe", title: "Connecting Stripe", fileName: "09-connecting-stripe.md", moduleHref: "/dashboard/billing" },
  { slug: "staff", title: "Adding Staff", fileName: "10-adding-staff.md", moduleHref: "/dashboard/staff" },
  { slug: "refunds", title: "Handling Refunds", fileName: "11-handling-refunds.md", moduleHref: "/dashboard/orders" },
  { slug: "storefront", title: "Storefront Setup", fileName: "12-storefront-setup.md", moduleHref: "/dashboard/storefront" },
  { slug: "inventory", title: "Inventory Basics", fileName: "13-inventory-basics.md", moduleHref: "/dashboard/inventory" },
  { slug: "food-cost", title: "Food Cost Tracking", fileName: "14-food-cost-tracking.md", moduleHref: "/dashboard/costing" },
  { slug: "weekly-preorder", title: "Weekly Preorder Flow", fileName: "15-weekly-preorder-flow.md", moduleHref: "/dashboard/meal-plans" },
  { slug: "kds", title: "KDS Basics", fileName: "16-kds-basics.md", moduleHref: "/dashboard/kitchen" },
  { slug: "reports", title: "Reports and Analytics", fileName: "17-reports-and-analytics.md", moduleHref: "/dashboard/reports" },
  { slug: "mobile-pos", title: "Mobile POS", fileName: "18-mobile-pos.md", moduleHref: "/dashboard/pos" },
  { slug: "troubleshooting", title: "Troubleshooting", fileName: "19-troubleshooting.md", moduleHref: "/dashboard/system-health" },
  { slug: "faq", title: "FAQ", fileName: "20-faq.md", moduleHref: "/dashboard/support" },
];

export function getKbArticle(slug: string): KbArticle | undefined {
  return KB_ARTICLES.find((a) => a.slug === slug);
}
