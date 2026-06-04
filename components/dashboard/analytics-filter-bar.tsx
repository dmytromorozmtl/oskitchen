import Link from "next/link";

import {
  ANALYTICS_CHANNEL_LABEL,
  ANALYTICS_CHANNEL_VALUES,
} from "@/lib/analytics/channel-attribution";
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

export function AnalyticsFilterBar({
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
  function link(overrides: Partial<{
    days: number;
    channel: string | null;
    brandId: string | null;
    locationId: string | null;
    fulfillment: string | null;
    mealPlanOnly: string | null;
    cateringOnly: string | null;
  }>) {
    const sp = new URLSearchParams(baseSp);
    if (overrides.days != null) {
      const to = new Date();
      const from = new Date(to.getTime() - overrides.days * 24 * 60 * 60 * 1000);
      sp.set("from", from.toISOString().slice(0, 10));
      sp.set("to", to.toISOString().slice(0, 10));
    }
    if (overrides.channel !== undefined) {
      if (overrides.channel) sp.set("channel", overrides.channel);
      else sp.delete("channel");
    }
    if (overrides.brandId !== undefined) {
      if (overrides.brandId) sp.set("brandId", overrides.brandId);
      else sp.delete("brandId");
    }
    if (overrides.locationId !== undefined) {
      if (overrides.locationId) sp.set("locationId", overrides.locationId);
      else sp.delete("locationId");
    }
    if (overrides.fulfillment !== undefined) {
      if (overrides.fulfillment) sp.set("fulfillment", overrides.fulfillment);
      else sp.delete("fulfillment");
    }
    if (overrides.mealPlanOnly !== undefined) {
      if (overrides.mealPlanOnly) sp.set("mealPlanOnly", overrides.mealPlanOnly);
      else sp.delete("mealPlanOnly");
    }
    if (overrides.cateringOnly !== undefined) {
      if (overrides.cateringOnly) sp.set("cateringOnly", overrides.cateringOnly);
      else sp.delete("cateringOnly");
    }
    return `${basePath}?${sp.toString()}`;
  }

  return (
    <FilterSearchShell
      description={`${filters.from.toISOString().slice(0, 10)} → ${filters.to.toISOString().slice(0, 10)}`}
    >
      <div className="space-y-2">
        <FilterChipRow>
          {QUICK_RANGES.map((r) => (
            <FilterChipLink key={r.days} href={link({ days: r.days })} active={false}>
              {r.label}
            </FilterChipLink>
          ))}
        </FilterChipRow>
        <FilterChipRow>
          <FilterChipLink href={link({ channel: null })} active={filters.channel == null}>
            All channels
          </FilterChipLink>
          {ANALYTICS_CHANNEL_VALUES.map((channel) => (
            <FilterChipLink
              key={channel}
              href={link({ channel })}
              active={filters.channel === channel}
            >
              {ANALYTICS_CHANNEL_LABEL[channel]}
            </FilterChipLink>
          ))}
        </FilterChipRow>
        {brands.length > 0 ? (
          <FilterChipRow>
            <FilterChipLink href={link({ brandId: null })} active={filters.brandId == null}>
              All brands
            </FilterChipLink>
            {brands.slice(0, 6).map((b) => (
              <FilterChipLink
                key={b.id}
                href={link({ brandId: b.id })}
                active={filters.brandId === b.id}
              >
                {b.name}
              </FilterChipLink>
            ))}
          </FilterChipRow>
        ) : null}
        {locations.length > 0 ? (
          <FilterChipRow>
            <FilterChipLink href={link({ locationId: null })} active={filters.locationId == null}>
              All locations
            </FilterChipLink>
            {locations.slice(0, 6).map((l) => (
              <FilterChipLink
                key={l.id}
                href={link({ locationId: l.id })}
                active={filters.locationId === l.id}
              >
                {l.name}
              </FilterChipLink>
            ))}
          </FilterChipRow>
        ) : null}
        <FilterChipRow>
          <FilterChipLink href={link({ fulfillment: null })} active={filters.fulfillmentType == null}>
            All fulfillment
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
          <FilterChipLink
            href={link({ mealPlanOnly: filters.mealPlanOnly ? null : "1" })}
            active={Boolean(filters.mealPlanOnly)}
          >
            Meal plans only
          </FilterChipLink>
          <FilterChipLink
            href={link({ cateringOnly: filters.cateringOnly ? null : "1" })}
            active={Boolean(filters.cateringOnly)}
          >
            Catering only
          </FilterChipLink>
        </FilterChipRow>
      </div>
    </FilterSearchShell>
  );
}
