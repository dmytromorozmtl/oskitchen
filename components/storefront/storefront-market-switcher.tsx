"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { StorefrontMarket } from "@/lib/storefront/markets";
import { cn } from "@/lib/utils";

export function StorefrontMarketSwitcher({
  storeSlug,
  markets,
  activeMarketId,
}: {
  storeSlug: string;
  markets: StorefrontMarket[];
  activeMarketId: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (markets.length <= 1) return null;

  function hrefFor(market: StorefrontMarket) {
    const slug = market.storeSlug?.trim() || storeSlug;
    const pathOnSlug = pathname.startsWith(`/s/${storeSlug}`)
      ? pathname.replace(`/s/${storeSlug}`, `/s/${slug}`)
      : `/s/${slug}/menu`;
    const p = new URLSearchParams(searchParams.toString());
    p.set("market", market.id);
    const q = p.toString();
    return q ? `${pathOnSlug}?${q}` : pathOnSlug;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Market</span>
      {markets.map((m) => (
        <Link
          key={m.id}
          href={hrefFor(m)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            m.id === activeMarketId
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {m.name}
        </Link>
      ))}
    </div>
  );
}
