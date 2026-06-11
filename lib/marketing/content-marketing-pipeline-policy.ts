/**
 * Blueprint P1-81 — Content marketing pipeline (7 blog posts).
 *
 * @see docs/content-marketing-pipeline.md
 */

export const CONTENT_MARKETING_PIPELINE_POLICY_ID =
  "content-marketing-pipeline-p1-81-v1" as const;

export const CONTENT_MARKETING_PIPELINE_DOC = "docs/content-marketing-pipeline.md" as const;

export const CONTENT_MARKETING_PIPELINE_AUDIT_SCRIPT =
  "scripts/audit-content-marketing-pipeline.ts" as const;

export const CONTENT_MARKETING_PIPELINE_NPM_SCRIPT =
  "audit:content-marketing-pipeline" as const;

export const CONTENT_MARKETING_PIPELINE_UNIT_TEST =
  "tests/unit/content-marketing-pipeline.test.ts" as const;

export const CONTENT_MARKETING_PIPELINE_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const CONTENT_MARKETING_PIPELINE_POST_COUNT = 7 as const;

export const CONTENT_MARKETING_PIPELINE_BLOG_REGISTRY =
  "lib/marketing/blog-posts.ts" as const;

export type ContentMarketingPostStatus = "published" | "queued";

export type ContentMarketingIcpSegment =
  | "meal_prep"
  | "ghost_kitchen"
  | "commissary"
  | "cross_icp";

export type ContentMarketingFunnelStage = "awareness" | "consideration" | "comparison";

export type ContentMarketingPipelinePost = {
  id: string;
  slug: string;
  status: ContentMarketingPostStatus;
  icpSegment: ContentMarketingIcpSegment;
  funnelStage: ContentMarketingFunnelStage;
  primaryKeyword: string;
  targetPath: `/blog/${string}`;
  utmCampaign: string;
  pagePath: string;
  contentPath: string;
};

export const CONTENT_MARKETING_PIPELINE_POSTS: readonly ContentMarketingPipelinePost[] = [
  {
    id: "post-1-meal-prep-order-queue",
    slug: "meal-prep-order-queue-cut-packing-errors",
    status: "published",
    icpSegment: "meal_prep",
    funnelStage: "consideration",
    primaryKeyword: "meal prep order queue",
    targetPath: "/blog/meal-prep-order-queue-cut-packing-errors",
    utmCampaign: "blog_meal_prep_order_queue",
    pagePath: "app/blog/meal-prep-order-queue-cut-packing-errors/page.tsx",
    contentPath: "lib/marketing/blog-content/meal-prep-order-queue.tsx",
  },
  {
    id: "post-2-start-meal-prep",
    slug: "how-to-start-meal-prep-business",
    status: "published",
    icpSegment: "meal_prep",
    funnelStage: "awareness",
    primaryKeyword: "start meal prep business",
    targetPath: "/blog/how-to-start-meal-prep-business",
    utmCampaign: "blog_start_meal_prep",
    pagePath: "app/blog/how-to-start-meal-prep-business/page.tsx",
    contentPath: "lib/marketing/blog-content/meal-prep-guide.tsx",
  },
  {
    id: "post-3-pos-comparison",
    slug: "restaurant-pos-comparison-2026",
    status: "published",
    icpSegment: "cross_icp",
    funnelStage: "comparison",
    primaryKeyword: "restaurant pos comparison",
    targetPath: "/blog/restaurant-pos-comparison-2026",
    utmCampaign: "blog_pos_comparison_2026",
    pagePath: "app/blog/restaurant-pos-comparison-2026/page.tsx",
    contentPath: "lib/marketing/blog-content/pos-comparison-2026.tsx",
  },
  {
    id: "post-4-food-waste",
    slug: "reduce-food-waste-with-production-planning",
    status: "published",
    icpSegment: "cross_icp",
    funnelStage: "consideration",
    primaryKeyword: "reduce food waste restaurant",
    targetPath: "/blog/reduce-food-waste-with-production-planning",
    utmCampaign: "blog_food_waste_production",
    pagePath: "app/blog/reduce-food-waste-with-production-planning/page.tsx",
    contentPath: "lib/marketing/blog-content/food-waste-production.tsx",
  },
  {
    id: "post-5-choose-pos",
    slug: "how-to-choose-restaurant-pos-2026",
    status: "published",
    icpSegment: "cross_icp",
    funnelStage: "consideration",
    primaryKeyword: "choose restaurant pos",
    targetPath: "/blog/how-to-choose-restaurant-pos-2026",
    utmCampaign: "blog_choose_pos_2026",
    pagePath: "app/blog/how-to-choose-restaurant-pos-2026/page.tsx",
    contentPath: "lib/marketing/blog-content/choose-restaurant-pos-2026.tsx",
  },
  {
    id: "post-6-ghost-kitchen",
    slug: "ghost-kitchen-setup-complete-guide",
    status: "published",
    icpSegment: "ghost_kitchen",
    funnelStage: "awareness",
    primaryKeyword: "ghost kitchen setup",
    targetPath: "/blog/ghost-kitchen-setup-complete-guide",
    utmCampaign: "blog_ghost_kitchen_setup",
    pagePath: "app/blog/ghost-kitchen-setup-complete-guide/page.tsx",
    contentPath: "lib/marketing/blog-content/ghost-kitchen-setup-guide.tsx",
  },
  {
    id: "post-7-commissary-software",
    slug: "commissary-kitchen-software-guide",
    status: "published",
    icpSegment: "commissary",
    funnelStage: "consideration",
    primaryKeyword: "commissary kitchen software",
    targetPath: "/blog/commissary-kitchen-software-guide",
    utmCampaign: "blog_commissary_software",
    pagePath: "app/blog/commissary-kitchen-software-guide/page.tsx",
    contentPath: "lib/marketing/blog-content/commissary-kitchen-software-guide.tsx",
  },
] as const;

export const CONTENT_MARKETING_PIPELINE_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "without fake",
  "honest",
  "typical",
] as const;

export const CONTENT_MARKETING_PIPELINE_WIRING_PATHS = [
  CONTENT_MARKETING_PIPELINE_DOC,
  "lib/marketing/content-marketing-pipeline-policy.ts",
  "lib/marketing/content-marketing-pipeline-audit.ts",
  CONTENT_MARKETING_PIPELINE_UNIT_TEST,
  CONTENT_MARKETING_PIPELINE_BLOG_REGISTRY,
  ...CONTENT_MARKETING_PIPELINE_POSTS.flatMap((post) => [post.pagePath, post.contentPath]),
] as const;
