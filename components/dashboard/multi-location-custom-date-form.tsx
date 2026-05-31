"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serialiseFilters, type AnalyticsFilters } from "@/lib/analytics/filters";

type Props = {
  filters: AnalyticsFilters;
  basePath: string;
};

export function MultiLocationCustomDateForm({ filters, basePath }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(filters.from.toISOString().slice(0, 10));
  const [to, setTo] = useState(filters.to.toISOString().slice(0, 10));

  function applyRange() {
    const next: AnalyticsFilters = {
      ...filters,
      from: new Date(`${from}T00:00:00`),
      to: new Date(`${to}T23:59:59`),
    };
    router.push(`${basePath}?${serialiseFilters(next).toString()}`);
  }

  return (
    <div
      className="flex flex-wrap items-end gap-2 rounded-xl border border-border/80 bg-muted/20 p-3"
      data-testid="multi-location-custom-date-range"
    >
      <label className="space-y-1 text-xs">
        <span className="font-medium text-muted-foreground">From</span>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9" />
      </label>
      <label className="space-y-1 text-xs">
        <span className="font-medium text-muted-foreground">To</span>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9" />
      </label>
      <Button type="button" size="sm" className="rounded-full" onClick={applyRange}>
        Apply custom range
      </Button>
    </div>
  );
}
