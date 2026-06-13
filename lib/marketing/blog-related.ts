import { BLOG_POSTS, type BlogPostMeta } from "@/lib/marketing/blog-posts";

/** Related articles for internal linking (SEO + operator journey). */
export function relatedBlogPosts(currentSlug: string, limit = 3): BlogPostMeta[] {
  const current = BLOG_POSTS.find((p) => p.slug === currentSlug);
  if (!current) return BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, limit);

  const sameCategory = BLOG_POSTS.filter(
    (p) => p.slug !== currentSlug && p.category === current.category,
  );
  const rest = BLOG_POSTS.filter(
    (p) => p.slug !== currentSlug && p.category !== current.category,
  );

  return [...sameCategory, ...rest].slice(0, limit);
}

/** Curated guides surfaced from solution / product pages. */
export const SOLUTION_GUIDE_LINKS: Partial<
  Record<string, Array<{ href: string; title: string; description: string }>>
> = {
  "meal-prep": [
    {
      href: "/blog/meal-prep-order-queue-cut-packing-errors",
      title: "Cut packing errors with one order queue",
      description: "Weekly preorder kitchens: unify storefront, POS, and catering into one production queue.",
    },
    {
      href: "/blog/meal-prep-subscription-management",
      title: "Meal prep subscription management",
      description: "Billing cadence, menu cycles, and production batching for subscribers.",
    },
    {
      href: "/blog/how-to-start-meal-prep-business",
      title: "Start a meal prep business (2026)",
      description: "Licensing, kitchen setup, menu planning, and software stack.",
    },
    {
      href: "/roi-calculator",
      title: "Meal prep ROI calculator",
      description: "Estimate labor and waste savings before your pilot.",
    },
  ],
  "ghost-kitchens": [
    {
      href: "/blog/ghost-kitchen-setup-complete-guide",
      title: "Ghost kitchen setup guide",
      description: "Licensing, brands, aggregators, and production line design.",
    },
    {
      href: "/blog/ghost-kitchen-software-2026",
      title: "Ghost kitchen software 2026",
      description: "Evaluation checklist: order hub, KDS, and integration health.",
    },
    {
      href: "/blog/multi-channel-delivery-order-hub",
      title: "Multi-channel delivery order hub",
      description: "One production queue for every marketplace tablet.",
    },
  ],
  restaurants: [
    {
      href: "/blog/restaurant-pos-comparison-2026",
      title: "Restaurant POS comparison 2026",
      description: "Toast vs Square vs OS Kitchen for full-service and fast-casual.",
    },
    {
      href: "/blog/how-to-choose-restaurant-pos-2026",
      title: "How to choose restaurant POS",
      description: "Evaluation framework: payments, KDS, TCO, and operations depth.",
    },
  ],
};
