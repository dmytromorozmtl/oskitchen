/**
 * Blueprint P1-28 — SEO blog articles (6 keyword-targeted posts).
 *
 * @see docs/seo-blog-articles-p1-28.md
 */

export const SEO_BLOG_ARTICLES_P1_28_POLICY_ID = "seo-blog-articles-p1-28-v1" as const;

export const SEO_BLOG_ARTICLES_P1_28_DOC = "docs/seo-blog-articles-p1-28.md" as const;

export const SEO_BLOG_ARTICLES_P1_28_AUDIT_SCRIPT =
  "scripts/audit-seo-blog-articles-p1-28.ts" as const;

export const SEO_BLOG_ARTICLES_P1_28_NPM_SCRIPT = "audit:seo-blog-articles" as const;

export const SEO_BLOG_ARTICLES_P1_28_CHECK_NPM_SCRIPT = "check:seo-blog-articles" as const;

export const SEO_BLOG_ARTICLES_P1_28_UNIT_TEST =
  "tests/unit/seo-blog-articles-p1-28.test.ts" as const;

export const SEO_BLOG_ARTICLES_P1_28_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const SEO_BLOG_ARTICLES_P1_28_POST_COUNT = 6 as const;

export type SeoBlogArticleP128 = {
  id: string;
  slug: string;
  primaryKeyword: string;
  targetPath: `/blog/${string}`;
  pagePath: string;
  contentPath: string;
  contentExport: string;
};

export const SEO_BLOG_ARTICLES_P1_28_POSTS: readonly SeoBlogArticleP128[] = [
  {
    id: "p1-28-ghost-kitchen-software-2026",
    slug: "ghost-kitchen-software-2026",
    primaryKeyword: "ghost kitchen software 2026",
    targetPath: "/blog/ghost-kitchen-software-2026",
    pagePath: "app/blog/ghost-kitchen-software-2026/page.tsx",
    contentPath: "lib/marketing/blog-content/ghost-kitchen-software-2026.tsx",
    contentExport: "GhostKitchenSoftware2026Content",
  },
  {
    id: "p1-28-meal-prep-subscription-management",
    slug: "meal-prep-subscription-management",
    primaryKeyword: "meal prep subscription management",
    targetPath: "/blog/meal-prep-subscription-management",
    pagePath: "app/blog/meal-prep-subscription-management/page.tsx",
    contentPath: "lib/marketing/blog-content/meal-prep-subscription-management.tsx",
    contentExport: "MealPrepSubscriptionManagementContent",
  },
  {
    id: "p1-28-restaurant-pos-integration-health",
    slug: "restaurant-pos-integration-health",
    primaryKeyword: "restaurant pos integration health",
    targetPath: "/blog/restaurant-pos-integration-health",
    pagePath: "app/blog/restaurant-pos-integration-health/page.tsx",
    contentPath: "lib/marketing/blog-content/restaurant-pos-integration-health.tsx",
    contentExport: "RestaurantPosIntegrationHealthContent",
  },
  {
    id: "p1-28-shopify-orders-to-kds",
    slug: "shopify-orders-to-kds",
    primaryKeyword: "shopify orders to kds",
    targetPath: "/blog/shopify-orders-to-kds",
    pagePath: "app/blog/shopify-orders-to-kds/page.tsx",
    contentPath: "lib/marketing/blog-content/shopify-orders-to-kds.tsx",
    contentExport: "ShopifyOrdersToKdsContent",
  },
  {
    id: "p1-28-woocommerce-kds-restaurant-integration",
    slug: "woocommerce-kds-restaurant-integration",
    primaryKeyword: "woocommerce kds restaurant integration",
    targetPath: "/blog/woocommerce-kds-restaurant-integration",
    pagePath: "app/blog/woocommerce-kds-restaurant-integration/page.tsx",
    contentPath: "lib/marketing/blog-content/woocommerce-kds-restaurant-integration.tsx",
    contentExport: "WooCommerceKdsRestaurantIntegrationContent",
  },
  {
    id: "p1-28-multi-channel-delivery-order-hub",
    slug: "multi-channel-delivery-order-hub",
    primaryKeyword: "multi channel delivery order hub",
    targetPath: "/blog/multi-channel-delivery-order-hub",
    pagePath: "app/blog/multi-channel-delivery-order-hub/page.tsx",
    contentPath: "lib/marketing/blog-content/multi-channel-delivery-order-hub.tsx",
    contentExport: "MultiChannelDeliveryOrderHubContent",
  },
] as const;

export const SEO_BLOG_ARTICLES_P1_28_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "honest",
  "typical",
  "without fake",
] as const;

export const SEO_BLOG_ARTICLES_P1_28_WIRING_PATHS = [
  SEO_BLOG_ARTICLES_P1_28_DOC,
  "lib/marketing/seo-blog-articles-p1-28-policy.ts",
  "lib/marketing/seo-blog-articles-p1-28-audit.ts",
  SEO_BLOG_ARTICLES_P1_28_UNIT_TEST,
  "lib/marketing/blog-posts.ts",
  ...SEO_BLOG_ARTICLES_P1_28_POSTS.flatMap((post) => [post.pagePath, post.contentPath]),
] as const;
