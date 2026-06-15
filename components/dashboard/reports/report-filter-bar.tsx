import {
  ANALYTICS_CHANNEL_LABEL,
  ANALYTICS_CHANNEL_VALUES,
} from "@/lib/analytics/channel-attribution";
import { serialiseReportFilters } from "@/lib/reports/report-filters";
import type {
  ReportDefinition,
  ReportFilters,
} from "@/lib/reports/report-types";
import {
  FilterChipLink,
  FilterChipRow,
  FilterSearchShell,
} from "@/components/dashboard/filter-search-shell";

const QUICK_RANGES: { preset: string; label: string }[] = [
  { preset: "7d", label: "Last 7d" },
  { preset: "30d", label: "Last 30d" },
  { preset: "90d", label: "Last 90d" },
  { preset: "wtd", label: "WTD" },
  { preset: "mtd", label: "MTD" },
  { preset: "ytd", label: "YTD" },
];

export function ReportFilterBar({
  filters,
  basePath,
  definition,
  brands,
  locations,
}: {
  filters: ReportFilters;
  basePath: string;
  definition: ReportDefinition;
  brands: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}) {
  const baseSp = serialiseReportFilters(filters);
  function link(overrides: Record<string, string | null>): string {
    const sp = new URLSearchParams(baseSp);
    for (const [k, v] of Object.entries(overrides)) {
      if (v == null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete("preset");
    return `${basePath}?${sp.toString()}`;
  }
  function presetLink(preset: string): string {
    const sp = new URLSearchParams();
    sp.set("preset", preset);
    if (filters.brandId) sp.set("brandId", filters.brandId);
    if (filters.locationId) sp.set("locationId", filters.locationId);
    if (filters.channel) sp.set("channel", filters.channel);
    if (filters.fulfillmentType) sp.set("fulfillment", filters.fulfillmentType);
    return `${basePath}?${sp.toString()}`;
  }
  const supports = (k: string) => definition.supportedFilters.includes(k as never);

  return (
    <FilterSearchShell printHidden>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Range:</span>
        <FilterChipRow className="inline-flex">
          {QUICK_RANGES.map((r) => (
            <FilterChipLink key={r.preset} href={presetLink(r.preset)} active={false}>
              {r.label}
            </FilterChipLink>
          ))}
        </FilterChipRow>
        <span className="ml-2 text-muted-foreground">
          {filters.from.toISOString().slice(0, 10)} → {filters.to.toISOString().slice(0, 10)}
        </span>

        {supports("brandId") && brands.length > 0 && (
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

        {supports("locationId") && locations.length > 0 && (
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

        {supports("channel") && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="text-muted-foreground">Channel:</span>
            <FilterChipLink href={link({ channel: null })} active={filters.channel == null}>
              All
            </FilterChipLink>
            {ANALYTICS_CHANNEL_VALUES.map((c) => (
              <FilterChipLink
                key={c}
                href={link({ channel: c })}
                active={filters.channel === c}
              >
                {ANALYTICS_CHANNEL_LABEL[c]}
              </FilterChipLink>
            ))}
          </div>
        )}

        {supports("fulfillmentType") && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="text-muted-foreground">Fulfillment:</span>
            <FilterChipLink href={link({ fulfillment: null })} active={filters.fulfillmentType == null}>
              All
            </FilterChipLink>
            <FilterChipLink
              href={link({ fulfillment: "PICKUP" })}
              active={filters.fulfillmentType === "PICKUP"}
            >
              Pickup
            </FilterChipLink>
            <FilterChipLink
              href={link({ fulfillment: "DELIVERY" })}
              active={filters.fulfillmentType === "DELIVERY"}
            >
              Delivery
            </FilterChipLink>
          </div>
        )}
      </div>
    </FilterSearchShell>
  );
}
