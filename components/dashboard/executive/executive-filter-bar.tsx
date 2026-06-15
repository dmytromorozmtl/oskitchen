import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { serialiseFilters } from "@/lib/analytics/filters";
import {
  FilterChipLink,
  FilterChipRow,
  FilterSearchShell,
} from "@/components/dashboard/filter-search-shell";

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
    <FilterSearchShell printHidden>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Range:</span>
        <FilterChipRow className="inline-flex">
          {QUICK_RANGES.map((r) => (
            <FilterChipLink key={r.days} href={rangeLink(r.days)} active={false}>
              {r.label}
            </FilterChipLink>
          ))}
        </FilterChipRow>
        <span className="ml-2 text-muted-foreground">
          {filters.from.toISOString().slice(0, 10)} → {filters.to.toISOString().slice(0, 10)}
        </span>

        {brands.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="text-muted-foreground">Brand:</span>
            <FilterChipLink href={link({ brandId: null })} active={filters.brandId == null}>
              All
            </FilterChipLink>
            {brands.map((b) => (
              <FilterChipLink
                key={b.id}
                href={link({ brandId: b.id })}
                active={filters.brandId === b.id}
              >
                {b.name}
              </FilterChipLink>
            ))}
          </div>
        )}

        {locations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="text-muted-foreground">Location:</span>
            <FilterChipLink href={link({ locationId: null })} active={filters.locationId == null}>
              All
            </FilterChipLink>
            {locations.map((l) => (
              <FilterChipLink
                key={l.id}
                href={link({ locationId: l.id })}
                active={filters.locationId === l.id}
              >
                {l.name}
              </FilterChipLink>
            ))}
          </div>
        )}
      </div>
    </FilterSearchShell>
  );
}
