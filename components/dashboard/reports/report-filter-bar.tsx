import Link from "next/link";

import {
  ANALYTICS_CHANNEL_LABEL,
  ANALYTICS_CHANNEL_VALUES,
} from "@/lib/analytics/channel-attribution";
import { serialiseReportFilters } from "@/lib/reports/report-filters";
import type {
  ReportDefinition,
  ReportFilters,
} from "@/lib/reports/report-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="border-border/80 shadow-sm print:hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Filters</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Range:</span>
        {QUICK_RANGES.map((r) => (
          <Link
            key={r.preset}
            href={presetLink(r.preset)}
            className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/80"
          >
            {r.label}
          </Link>
        ))}
        <span className="ml-2 text-muted-foreground">
          {filters.from.toISOString().slice(0, 10)} → {filters.to.toISOString().slice(0, 10)}
        </span>

        {supports("brandId") && brands.length > 0 && (
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

        {supports("locationId") && locations.length > 0 && (
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

        {supports("channel") && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="text-muted-foreground">Channel:</span>
            <Link href={link({ channel: null })} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              All
            </Link>
            {ANALYTICS_CHANNEL_VALUES.map((c) => (
              <Link
                key={c}
                href={link({ channel: c })}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  filters.channel === c ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {ANALYTICS_CHANNEL_LABEL[c]}
              </Link>
            ))}
          </div>
        )}

        {supports("fulfillmentType") && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="text-muted-foreground">Fulfillment:</span>
            <Link href={link({ fulfillment: null })} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              All
            </Link>
            <Link
              href={link({ fulfillment: "PICKUP" })}
              className={`rounded-full px-2 py-0.5 text-xs ${
                filters.fulfillmentType === "PICKUP" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              Pickup
            </Link>
            <Link
              href={link({ fulfillment: "DELIVERY" })}
              className={`rounded-full px-2 py-0.5 text-xs ${
                filters.fulfillmentType === "DELIVERY" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              Delivery
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
