"use client";

import { useTransition } from "react";
import { Store } from "lucide-react";
import { toast } from "sonner";

import { toggleMarketplaceVendorFavoriteAction } from "@/actions/marketplace/vendors";
import { MarketplaceVendorCardView } from "@/components/marketplace/marketplace-vendor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { MarketplaceVendorCard } from "@/services/marketplace/marketplace-vendors-service";

export function MarketplaceVendorsListClient({
  vendors,
  favorites,
  initialQuery,
}: {
  vendors: MarketplaceVendorCard[];
  favorites: MarketplaceVendorCard[];
  initialQuery?: string;
}) {
  const [pending, startTransition] = useTransition();

  function toggleFavorite(vendorId: string) {
    startTransition(async () => {
      const result = await toggleMarketplaceVendorFavoriteAction(vendorId);
      if (result.ok) {
        toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-8">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const q = String(data.get("q") ?? "").trim();
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          window.location.href = `/dashboard/marketplace/vendors${params.toString() ? `?${params}` : ""}`;
        }}
      >
        <Input
          name="q"
          defaultValue={initialQuery ?? ""}
          placeholder="Search vendors…"
          className="max-w-md rounded-full"
        />
      </form>

      {favorites.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Favorites</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {favorites.map((vendor) => (
              <MarketplaceVendorCardView
                key={`fav-${vendor.id}`}
                vendor={vendor}
                pendingFavorite={pending}
                onToggleFavorite={() => toggleFavorite(vendor.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">My vendors</h2>
        {vendors.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No vendors in this list yet"
            description="Place marketplace orders or favorite approved vendors to see them here."
            primaryLabel="Browse catalog"
            primaryHref="/dashboard/marketplace/catalog"
            variant="inline"
            showDemoLink={false}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {vendors.map((vendor) => (
              <MarketplaceVendorCardView
                key={vendor.id}
                vendor={vendor}
                pendingFavorite={pending}
                onToggleFavorite={() => toggleFavorite(vendor.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
