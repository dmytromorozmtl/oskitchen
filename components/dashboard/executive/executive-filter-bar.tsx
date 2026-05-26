import Link from "next/link";

import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { serialiseFilters } from "@/lib/analytics/filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_RANGES: { days: number; label: string }[] = [
  { days: 7, label: "Last 7d" },
  { days: 30, label: "Last 30d" },
  { days: 90, label: "Last 90d" },
];

export function ExecutiveFilterBar({
  filters,
  basePath,
  brands,
  locations,
}: {
  filters: AnalyticsFilters;
  basePath: string;
  brands: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}) {
  const baseSp = serialiseFilters(filters);
  function link(overrides: Record<string, string | null>): string {
    const sp = new URLSearchParams(baseSp);
    for (const [k, v] of Object.entries(overrides)) {
      if (v == null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    return `${basePath}?${sp.toString()}`;
  }
  function rangeLink(days: number): string {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    const sp = new URLSearchParams(baseSp);
    sp.set("from", from.toISOString().slice(0, 10));
    sp.set("to", to.toISOString().slice(0, 10));
    return `${basePath}?${sp.toString()}`;
  }

  return (
    <Card className="border-border/80 shadow-sm print:hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Filters</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Range:</span>
        {QUICK_RANGES.map((r) => (
          <Link
            key={r.days}
            href={rangeLink(r.days)}
            className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/80"
          >
            {r.label}
          </Link>
        ))}
        <span className="ml-2 text-muted-foreground">
          {filters.from.toISOString().slice(0, 10)} → {filters.to.toISOString().slice(0, 10)}
        </span>

        {brands.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="text-muted-foreground">Brand:</span>
            <Link href={link({ brandId: null })} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              All
            </Link>
            {brands.map((b) => (
              <Link
                key={b.id}
                href={link({ brandId: b.id })}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  filters.brandId === b.id ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {b.name}
              </Link>
            ))}
          </div>
        )}

        {locations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="text-muted-foreground">Location:</span>
            <Link href={link({ locationId: null })} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              All
            </Link>
            {locations.map((l) => (
              <Link
                key={l.id}
                href={link({ locationId: l.id })}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  filters.locationId === l.id ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {l.name}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
