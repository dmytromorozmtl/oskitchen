export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'meal-prep-order-queue-cut-packing-errors',
    title: 'How Meal Prep Kitchens Cut Packing Errors with One Order Queue',
    description:
      'Stop losing margin to mis-picks and missed cutoffs: unify storefront, POS, and catering into one production-ready order queue.',
    date: '2026-05-24',
    readTime: '11 min read',
    category: 'Meal Prep',
  },
  {
    slug: 'how-to-start-meal-prep-business',
    title: 'How to Start a Meal Prep Business in 2026 — Complete Guide',
    description:
      'Step-by-step guide to launching a profitable meal prep business: licensing, kitchen setup, menu planning, pricing, and software.',
    date: '2026-05-19',
    readTime: '18 min read',
    category: 'Meal Prep',
  },
  {
    slug: 'restaurant-pos-comparison-2026',
    title: 'Restaurant POS Comparison 2026: Toast vs Square vs OS Kitchen',
    description:
      'Honest comparison of restaurant POS systems: features, pricing, hardware, and which platform fits your restaurant type.',
    date: '2026-05-19',
    readTime: '12 min read',
    category: 'Restaurant',
  },
  {
    slug: 'reduce-food-waste-with-production-planning',
    title: 'How to Reduce Food Waste with Production Planning',
    description:
      'Food waste costs kitchens 4–10% of revenue. Learn how production planning software cuts waste and improves margins.',
    date: '2026-05-19',
    readTime: '10 min read',
    category: 'Operations',
  },
  {
    slug: 'how-to-choose-restaurant-pos-2026',
    title: 'How to Choose Restaurant POS Software in 2026',
    description:
      'A practical framework for evaluating restaurant POS: payments, KDS, table service, TCO, and when an operations OS beats terminal bundles.',
    date: '2026-05-23',
    readTime: '14 min read',
    category: 'Restaurant',
  },
  {
    slug: 'ghost-kitchen-setup-complete-guide',
    title: 'Ghost Kitchen Setup: Complete Guide for 2026',
    description:
      'Launch a delivery-only or multi-brand ghost kitchen: licensing, brand architecture, aggregator strategy, and production line design.',
    date: '2026-05-23',
    readTime: '16 min read',
    category: 'Ghost Kitchen',
  },
  {
    slug: 'commissary-kitchen-software-guide',
    title: 'Commissary Kitchen Software: Complete Guide for 2026',
    description:
      'How shared commissaries route tenant orders, schedule batch production, and optionally supply B2B catalog — honest BETA labels included.',
    date: '2026-06-09',
    readTime: '12 min read',
    category: 'Commissary',
  },
  {
    slug: 'ghost-kitchen-software-2026',
    title: 'Ghost Kitchen Software in 2026: What to Evaluate Before You Buy',
    description:
      'Score ghost kitchen platforms on order hub, KDS routing, and integration health — not only virtual brand templates.',
    date: '2026-06-13',
    readTime: '9 min read',
    category: 'Ghost Kitchen',
  },
  {
    slug: 'meal-prep-subscription-management',
    title: 'Meal Prep Subscription Management: Billing, Menus, and Fulfillment',
    description:
      'Recurring billing, weekly menu locks, production batching, and pickup slots — one honest stack for subscription meal prep.',
    date: '2026-06-13',
    readTime: '10 min read',
    category: 'Meal Prep',
  },
  {
    slug: 'restaurant-pos-integration-health',
    title: 'Restaurant POS Integration Health: Why Orders Silently Fail',
    description:
      'OAuth expiry, menu drift, and webhook retries — how operators catch integration failures before closeout.',
    date: '2026-06-13',
    readTime: '8 min read',
    category: 'Integrations',
  },
  {
    slug: 'shopify-orders-to-kds',
    title: 'Shopify Orders to KDS: An Honest Integration Checklist',
    description:
      'Webhook HMAC, variant mapping, scheduled fire times, and health monitoring for ecommerce → kitchen display.',
    date: '2026-06-13',
    readTime: '7 min read',
    category: 'Integrations',
  },
  {
    slug: 'woocommerce-kds-restaurant-integration',
    title: 'WooCommerce KDS Restaurant Integration: Setup and Pitfalls',
    description:
      'Connect WordPress storefront orders to kitchen production — signatures, SKU maps, and refund sync.',
    date: '2026-06-13',
    readTime: '7 min read',
    category: 'Integrations',
  },
  {
    slug: 'multi-channel-delivery-order-hub',
    title: 'Multi-Channel Delivery Order Hub: One KDS for Every Tablet',
    description:
      'Consolidate marketplace, owned, and phone orders into one production queue — without fake ROI promises.',
    date: '2026-06-13',
    readTime: '8 min read',
    category: 'Ghost Kitchen',
  },
];

export function blogPostBySlug(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
