import {
  GraduationCap,
  Package,
  Refrigerator,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Wheat,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  getMarketplaceCategoryIconMeta,
  resolveMarketplaceCategoryIconMeta,
  type MarketplaceCategoryIconName,
} from "@/lib/marketplace/category-icons";
import { cn } from "@/lib/utils";

const ICON_COMPONENTS: Record<MarketplaceCategoryIconName, LucideIcon> = {
  package: Package,
  sparkles: Sparkles,
  "utensils-crossed": UtensilsCrossed,
  refrigerator: Refrigerator,
  wheat: Wheat,
  wrench: Wrench,
  shirt: Shirt,
  "graduation-cap": GraduationCap,
};

const SIZE_CLASS = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  tile: "h-6 w-6",
} as const;

function iconForSlug(slug: string): LucideIcon {
  const meta = resolveMarketplaceCategoryIconMeta(slug);
  if (!meta) return Package;
  return ICON_COMPONENTS[meta.icon];
}

export function MarketplaceCategoryIcon({
  slug,
  className,
  size = "md",
  label,
}: {
  slug: string;
  className?: string;
  size?: keyof typeof SIZE_CLASS;
  label?: string;
}) {
  const Icon = iconForSlug(slug);
  const meta = resolveMarketplaceCategoryIconMeta(slug);
  const ariaLabel = label ?? meta?.label;

  return (
    <Icon
      className={cn(SIZE_CLASS[size], "shrink-0", className)}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    />
  );
}

export function MarketplaceCategoryIconTile({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const meta = getMarketplaceCategoryIconMeta(slug);
  if (!meta) return null;

  const Icon = ICON_COMPONENTS[meta.icon];

  return (
    <span
      data-testid={`marketplace-category-icon-${slug}`}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl",
        meta.tileClassName,
        className,
      )}
      aria-hidden
    >
      <Icon className={SIZE_CLASS.tile} />
    </span>
  );
}
