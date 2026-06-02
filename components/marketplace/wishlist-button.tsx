"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  isMarketplaceWishlistSlug,
  toggleMarketplaceWishlistSlug,
} from "@/lib/marketplace/wishlist";
import { cn } from "@/lib/utils";

export type WishlistButtonProps = {
  slug: string;
  productName?: string;
  variant?: "outline" | "ghost" | "icon";
  size?: "default" | "sm" | "icon";
  showLabel?: boolean;
  className?: string;
  onToggle?: (wishlisted: boolean) => void;
};

export function WishlistButton({
  slug,
  productName,
  variant = "outline",
  size = "default",
  showLabel = true,
  className,
  onToggle,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isMarketplaceWishlistSlug(slug));
  }, [slug]);

  function toggle() {
    const result = toggleMarketplaceWishlistSlug(slug);
    setWishlisted(result.wishlisted);
    onToggle?.(result.wishlisted);
    toast.success(result.wishlisted ? "Saved to wish list" : "Removed from wish list");
  }

  const label = productName ?? "product";
  const ariaLabel = wishlisted ? `Remove ${label} from wish list` : `Save ${label} to wish list`;

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("rounded-full", className)}
        aria-label={ariaLabel}
        aria-pressed={wishlisted}
        data-testid={`wishlist-button-${slug}`}
        onClick={toggle}
      >
        <Heart className={cn("h-4 w-4", wishlisted && "fill-rose-500 text-rose-500")} />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant === "ghost" ? "ghost" : "outline"}
      size={size === "icon" ? "icon" : size}
      className={cn("rounded-full gap-2", className)}
      aria-label={showLabel ? undefined : ariaLabel}
      aria-pressed={wishlisted}
      data-testid={`wishlist-button-${slug}`}
      onClick={toggle}
    >
      <Heart className={cn("h-4 w-4", wishlisted && "fill-rose-500 text-rose-500")} />
      {showLabel ? (wishlisted ? "Saved" : "Wish list") : null}
    </Button>
  );
}
