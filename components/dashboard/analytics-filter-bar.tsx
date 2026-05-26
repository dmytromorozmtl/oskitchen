import Link from "next/link";

import {
  ANALYTICS_CHANNEL_LABEL,
  ANALYTICS_CHANNEL_VALUES,
} from "@/lib/analytics/channel-attribution";
import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { serialiseFilters } from "@/lib/analytics/filters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Filters</CardTitle>
        <CardDescription className="text-xs">
          {filters.from.toISOString().slice(0, 10)} → {filters.to.toISOString().slice(0, 10)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_RANGES.map((r) => (
            <Link
              key={r.days}
              href={link({ days: r.days })}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/70"
            >
              {r.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={link({ channel: null })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filters.channel == null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            All channels
          </Link>
          {ANALYTICS_CHANNEL_VALUES.map((channel) => (
            <Link
              key={channel}
              href={link({ channel })}
              className={`rounded-full px-3 py-1 text-xs font-medium ${filters.channel === channel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              {ANALYTICS_CHANNEL_LABEL[channel]}
            </Link>
          ))}
        </div>
        {brands.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={link({ brandId: null })}
              className={`rounded-full px-3 py-1 text-xs font-medium ${filters.brandId == null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              All brands
            </Link>
            {brands.slice(0, 6).map((b) => (
              <Link
                key={b.id}
                href={link({ brandId: b.id })}
                className={`rounded-full px-3 py-1 text-xs font-medium ${filters.brandId === b.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
              >
                {b.name}
              </Link>
            ))}
          </div>
        ) : null}
        {locations.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={link({ locationId: null })}
              className={`rounded-full px-3 py-1 text-xs font-medium ${filters.locationId == null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              All locations
            </Link>
            {locations.slice(0, 6).map((l) => (
              <Link
                key={l.id}
                href={link({ locationId: l.id })}
                className={`rounded-full px-3 py-1 text-xs font-medium ${filters.locationId === l.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
              >
                {l.name}
              </Link>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={link({ fulfillment: null })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filters.fulfillmentType == null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            All fulfillment
          </Link>
          <Link
            href={link({ fulfillment: "PICKUP" })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filters.fulfillmentType === "PICKUP" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            Pickup
          </Link>
          <Link
            href={link({ fulfillment: "DELIVERY" })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filters.fulfillmentType === "DELIVERY" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            Delivery
          </Link>
          <Link
            href={link({ mealPlanOnly: filters.mealPlanOnly ? null : "1" })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filters.mealPlanOnly ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            Meal plans only
          </Link>
          <Link
            href={link({ cateringOnly: filters.cateringOnly ? null : "1" })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filters.cateringOnly ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            Catering only
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
