/**
 * P2-55 — SEO blog articles: 5 posts (meal prep, ghost kitchen, restaurant POS).
 *
 * @see docs/seo-blog-articles-p2-55.md
 */

export const SEO_BLOG_ARTICLES_P2_55_POLICY_ID = "seo-blog-articles-p2-55-v1" as const;

export const SEO_BLOG_ARTICLES_P2_55_DOC = "docs/seo-blog-articles-p2-55.md" as const;

export const SEO_BLOG_ARTICLES_P2_55_ARTIFACT = "artifacts/seo-blog-articles-p2-55.json" as const;

export const SEO_BLOG_ARTICLES_P2_55_AUDIT_MODULE =
  "lib/marketing/seo-blog-articles-p2-55-audit.ts" as const;

export const SEO_BLOG_ARTICLES_P2_55_CHECK_NPM_SCRIPT = "check:seo-blog-articles-p2-55" as const;

export const SEO_BLOG_ARTICLES_P2_55_CI_NPM_SCRIPT = "test:ci:seo-blog-articles-p2-55" as const;

export const SEO_BLOG_ARTICLES_P2_55_UNIT_TEST =
  "tests/unit/seo-blog-articles-p2-55.test.ts" as const;

export const SEO_BLOG_ARTICLES_P2_55_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const SEO_BLOG_ARTICLES_P2_55_POST_COUNT = 5 as const;

export const SEO_BLOG_ARTICLES_P2_55_UPSTREAM_POLICY_ID = "seo-blog-articles-p1-28-v1" as const;

export type SeoBlogArticleP255IcpTopic = "meal_prep" | "ghost_kitchen" | "restaurant_pos";

export type SeoBlogArticleP255 = {
  id: string;
  slug: string;
  icpTopic: SeoBlogArticleP255IcpTopic;
  primaryKeyword: string;
  targetPath: `/blog/${string}`;
  pagePath: string;
  contentPath: string;
  contentExport: string;
  icpLandingHint: string;
};

/** Gap P2-55 canonical five-post SEO bundle. */
export const SEO_BLOG_ARTICLES_P2_55_POSTS: readonly SeoBlogArticleP255[] = [
  {
    id: "p2-55-meal-prep-business-guide",
    slug: "how-to-start-meal-prep-business",
    icpTopic: "meal_prep",
    primaryKeyword: "how to start a meal prep business",
    targetPath: "/blog/how-to-start-meal-prep-business",
    pagePath: "app/blog/how-to-start-meal-prep-business/page.tsx",
    contentPath: "lib/marketing/blog-content/meal-prep-guide.tsx",
    contentExport: "MealPrepGuideContent",
    icpLandingHint: "/solutions/meal-prep",
  },
  {
    id: "p2-55-meal-prep-order-queue",
    slug: "meal-prep-order-queue-cut-packing-errors",
    icpTopic: "meal_prep",
    primaryKeyword: "meal prep order queue packing errors",
    targetPath: "/blog/meal-prep-order-queue-cut-packing-errors",
    pagePath: "app/blog/meal-prep-order-queue-cut-packing-errors/page.tsx",
    contentPath: "lib/marketing/blog-content/meal-prep-order-queue.tsx",
    contentExport: "MealPrepOrderQueueContent",
    icpLandingHint: "/solutions/meal-prep",
  },
  {
    id: "p2-55-ghost-kitchen-setup",
    slug: "ghost-kitchen-setup-complete-guide",
    icpTopic: "ghost_kitchen",
    primaryKeyword: "ghost kitchen setup guide",
    targetPath: "/blog/ghost-kitchen-setup-complete-guide",
    pagePath: "app/blog/ghost-kitchen-setup-complete-guide/page.tsx",
    contentPath: "lib/marketing/blog-content/ghost-kitchen-setup-guide.tsx",
    contentExport: "GhostKitchenSetupGuideContent",
    icpLandingHint: "/solutions/ghost-kitchens",
  },
  {
    id: "p2-55-ghost-kitchen-software",
    slug: "ghost-kitchen-software-2026",
    icpTopic: "ghost_kitchen",
    primaryKeyword: "ghost kitchen software 2026",
    targetPath: "/blog/ghost-kitchen-software-2026",
    pagePath: "app/blog/ghost-kitchen-software-2026/page.tsx",
    contentPath: "lib/marketing/blog-content/ghost-kitchen-software-2026.tsx",
    contentExport: "GhostKitchenSoftware2026Content",
    icpLandingHint: "/ghost-kitchen-software",
  },
  {
    id: "p2-55-restaurant-pos-comparison",
    slug: "restaurant-pos-comparison-2026",
    icpTopic: "restaurant_pos",
    primaryKeyword: "restaurant pos comparison 2026",
    targetPath: "/blog/restaurant-pos-comparison-2026",
    pagePath: "app/blog/restaurant-pos-comparison-2026/page.tsx",
    contentPath: "lib/marketing/blog-content/pos-comparison-2026.tsx",
    contentExport: "PosComparison2026Content",
    icpLandingHint: "/compare/restaurant-pos",
  },
] as const;

export const SEO_BLOG_ARTICLES_P2_55_ICP_TOPICS: readonly SeoBlogArticleP255IcpTopic[] = [
  "meal_prep",
  "ghost_kitchen",
  "restaurant_pos",
] as const;

export const SEO_BLOG_ARTICLES_P2_55_HONESTY_MARKERS = [
  "honest",
  "verify",
  "BETA",
  "typical",
  "not guaranteed",
] as const;

export const SEO_BLOG_ARTICLES_P2_55_WIRING_PATHS = [
  SEO_BLOG_ARTICLES_P2_55_DOC,
  SEO_BLOG_ARTICLES_P2_55_ARTIFACT,
  SEO_BLOG_ARTICLES_P2_55_AUDIT_MODULE,
  SEO_BLOG_ARTICLES_P2_55_UNIT_TEST,
  "lib/marketing/blog-posts.ts",
  "components/marketing/blog-article-shell.tsx",
  "app/blog/page.tsx",
  ...SEO_BLOG_ARTICLES_P2_55_POSTS.flatMap((post) => [post.pagePath, post.contentPath]),
] as const;
