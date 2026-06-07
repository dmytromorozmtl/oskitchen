"use client";

import Link from "next/link";
import { LayoutGrid, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildMultiLocationMapPins,
  findMultiLocationMapPin,
  multiLocationMapSwitcherOptions,
} from "@/lib/enterprise/multi-location-map-view-data";
import {
  MULTI_LOCATION_MAP_CANVAS_TEST_ID,
  MULTI_LOCATION_MAP_SWITCHER_TEST_ID,
  MULTI_LOCATION_MAP_VIEW_TEST_ID,
} from "@/lib/enterprise/multi-location-map-view-policy";
import { LOCATION_STATUS_BADGE, LOCATION_STATUS_LABEL } from "@/lib/locations/location-types";
import type { LocationAnalyticsRow } from "@/services/analytics/multi-location-analytics";
import { cn, formatCurrency } from "@/lib/utils";

const PIN_STATUS_CLASS: Record<string, string> = {
  ACTIVE: "border-emerald-500/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  SETUP: "border-amber-500/60 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  PAUSED: "border-orange-500/60 bg-orange-500/10 text-orange-900 dark:text-orange-100",
  TEMPORARILY_CLOSED: "border-rose-500/60 bg-rose-500/10 text-rose-900 dark:text-rose-100",
  ARCHIVED: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
};

export function MultiLocationMapView({
  locations,
  selectedLocationId,
  onSelectLocation,
  currency = "USD",
}: {
  locations: readonly LocationAnalyticsRow[];
  selectedLocationId?: string | null;
  onSelectLocation: (locationId: string | null) => void;
  currency?: string;
}) {
  const pins = buildMultiLocationMapPins(locations);
  const switcherOptions = multiLocationMapSwitcherOptions(pins);
  const selectedPin = findMultiLocationMapPin(pins, selectedLocationId);

  if (pins.length === 0) {
    return (
      <Card data-testid={MULTI_LOCATION_MAP_VIEW_TEST_ID}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            Network map
          </CardTitle>
          <CardDescription>Add locations to see the network map and floor plan editor links.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card data-testid={MULTI_LOCATION_MAP_VIEW_TEST_ID}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" aria-hidden />
              Network map
            </CardTitle>
            <CardDescription>
              Tap a site pin — switch location, open floor plan editor, or drill into ops.
            </CardDescription>
          </div>
          <div className="min-w-[12rem]">
            <label className="sr-only" htmlFor="multi-location-map-switcher">
              Active location
            </label>
            <select
              id="multi-location-map-switcher"
              data-testid={MULTI_LOCATION_MAP_SWITCHER_TEST_ID}
              value={selectedLocationId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                onSelectLocation(value || null);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">All locations</option>
              {switcherOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="relative min-h-[280px] overflow-hidden rounded-xl border border-border/80 bg-muted/20"
          data-testid={MULTI_LOCATION_MAP_CANVAS_TEST_ID}
          role="img"
          aria-label={`Network map with ${pins.length} location pins`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:40px_40px]" />
          {pins.map((pin) => {
            const isSelected = pin.locationId === selectedLocationId;
            return (
              <button
                key={pin.locationId}
                type="button"
                data-testid={pin.pinTestId}
                onClick={() => onSelectLocation(pin.locationId)}
                className={cn(
                  "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl border px-2 py-1.5 text-center shadow-sm transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  PIN_STATUS_CLASS[pin.status] ?? PIN_STATUS_CLASS.ACTIVE,
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
                style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%`, minWidth: "5.5rem" }}
              >
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                <span className="max-w-[6rem] truncate text-[11px] font-semibold leading-tight">
                  {pin.name}
                </span>
                <span className="text-[10px] tabular-nums opacity-80">
                  {formatCurrency(pin.revenue, currency)}
                </span>
              </button>
            );
          })}
        </div>

        {selectedPin ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
            <div className="min-w-0 space-y-1">
              <p className="truncate font-semibold">{selectedPin.name}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={LOCATION_STATUS_BADGE[selectedPin.status]} className="rounded-full text-[10px]">
                  {LOCATION_STATUS_LABEL[selectedPin.status]}
                </Badge>
                <span className="tabular-nums">
                  {selectedPin.orders} orders · {formatCurrency(selectedPin.revenue, currency)}
                </span>
                {selectedPin.revenueShare != null ? (
                  <span className="tabular-nums">{selectedPin.revenueShare}% network share</span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-full" data-testid="multi-location-map-floor-plan-link">
                <Link href={selectedPin.floorPlanHref}>
                  <LayoutGrid className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Floor plan editor
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={selectedPin.locationHref}>Location hub</Link>
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a pin or use the location switcher to open the floor plan editor for one site.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
