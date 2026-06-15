/** Top-level HoReCa marketplace category slugs — keep aligned with `HORECA_CATEGORIES` seed data. */
export const HORECA_TOP_LEVEL_CATEGORY_SLUGS = [
  "packaging-disposables",
  "cleaning-sanitation",
  "kitchenware-tools",
  "equipment",
  "dry-goods",
  "services",
  "uniforms",
  "training",
] as const;

export type MarketplaceCategorySlug = (typeof HORECA_TOP_LEVEL_CATEGORY_SLUGS)[number];

export type MarketplaceCategoryIconName =
  | "package"
  | "sparkles"
  | "utensils-crossed"
  | "refrigerator"
  | "wheat"
  | "wrench"
  | "shirt"
  | "graduation-cap";

export type MarketplaceCategoryIconMeta = {
  slug: MarketplaceCategorySlug;
  label: string;
  icon: MarketplaceCategoryIconName;
  tileClassName: string;
};

export const MARKETPLACE_CATEGORY_ICON_META: readonly MarketplaceCategoryIconMeta[] = [
  {
    slug: "packaging-disposables",
    label: "Packaging & Disposables",
    icon: "package",
    tileClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    slug: "cleaning-sanitation",
    label: "Cleaning & Sanitation",
    icon: "sparkles",
    tileClassName: "bg-cyan-500/10 text-cyan-800 dark:text-cyan-300",
  },
  {
    slug: "kitchenware-tools",
    label: "Kitchenware & Tools",
    icon: "utensils-crossed",
    tileClassName: "bg-orange-500/10 text-orange-800 dark:text-orange-300",
  },
  {
    slug: "equipment",
    label: "Equipment",
    icon: "refrigerator",
    tileClassName: "bg-slate-500/10 text-slate-800 dark:text-slate-300",
  },
  {
    slug: "dry-goods",
    label: "Dry Goods & Ingredients",
    icon: "wheat",
    tileClassName: "bg-amber-500/10 text-amber-900 dark:text-amber-200",
  },
  {
    slug: "services",
    label: "Services",
    icon: "wrench",
    tileClassName: "bg-violet-500/10 text-violet-800 dark:text-violet-300",
  },
  {
    slug: "uniforms",
    label: "Uniforms & Workwear",
    icon: "shirt",
    tileClassName: "bg-rose-500/10 text-rose-800 dark:text-rose-300",
  },
  {
    slug: "training",
    label: "Training & Certification",
    icon: "graduation-cap",
    tileClassName: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  },
] as const;

const META_BY_SLUG = new Map<string, MarketplaceCategoryIconMeta>(
  MARKETPLACE_CATEGORY_ICON_META.map((meta) => [meta.slug, meta]),
);

export function isHoReCaTopLevelCategorySlug(slug: string): slug is MarketplaceCategorySlug {
  return (HORECA_TOP_LEVEL_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

export function getMarketplaceCategoryIconMeta(slug: string): MarketplaceCategoryIconMeta | null {
  return META_BY_SLUG.get(slug) ?? null;
}

export function resolveMarketplaceCategoryIconMeta(
  slug: string,
): MarketplaceCategoryIconMeta | null {
  if (isHoReCaTopLevelCategorySlug(slug)) {
    return getMarketplaceCategoryIconMeta(slug);
  }

  const parentSlug = HORECA_TOP_LEVEL_CATEGORY_SLUGS.find((topLevel) => slug.startsWith(`${topLevel}-`));
  return parentSlug ? getMarketplaceCategoryIconMeta(parentSlug) : null;
}
