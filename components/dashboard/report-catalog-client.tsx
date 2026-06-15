"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  REPORT_CATALOG_CATEGORIES,
  type ReportCatalogCategory,
  type ReportCatalogEntry,
} from "@/services/analytics/report-catalog-service";

type Props = {
  entries: ReportCatalogEntry[];
  recommended: ReportCatalogEntry[];
  recentlyRun: ReportCatalogEntry[];
  catalogTotal: number;
  wiredTotal: number;
};

export function ReportCatalogClient({
  entries,
  recommended,
  recentlyRun,
  catalogTotal,
  wiredTotal,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ReportCatalogCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false;
      if (!q) return true;
      const haystack = [entry.title, entry.description, entry.category, ...entry.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, query, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3" data-testid="report-catalog-search">
        <div className="min-w-[240px] flex-1">
          <label className="text-xs font-medium text-muted-foreground">Search reports</label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, metric, or tag…"
            className="mt-1"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {catalogTotal} catalogued · {wiredTotal} wired today
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          All
        </FilterChip>
        {REPORT_CATALOG_CATEGORIES.map((c) => (
          <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </FilterChip>
        ))}
      </div>

      {recommended.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recommended.map((entry) => (
              <CatalogCard key={`rec-${entry.id}`} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      {recentlyRun.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Recently run</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentlyRun.map((entry) => (
              <CatalogCard key={`recent-${entry.id}`} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          Catalog ({filtered.length} shown)
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <CatalogCard key={entry.id} entry={entry} />
          ))}
        </div>
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No reports match your search. Try another category or clear filters.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function CatalogCard({ entry }: { entry: ReportCatalogEntry }) {
  return (
    <Card className="border-border/80 shadow-sm" data-testid={`report-catalog-${entry.id}`}>
      <CardHeader>
        <CardTitle className="text-base">{entry.title}</CardTitle>
        <CardDescription>
          {entry.category}
          {entry.status === "available" ? " · Available" : entry.status === "builder" ? " · Builder" : " · Template"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">{entry.description}</p>
        <p className="text-xs text-muted-foreground">
          Metrics: {entry.metrics.join(", ")} · Group by: {entry.groupBy.slice(0, 3).join(", ")}
        </p>
        <p className="text-xs text-muted-foreground">Export: {entry.exportFormats.join(", ")}</p>
        <Link
          href={entry.generatorRoute}
          className="inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          {entry.status === "builder" ? "Open builder" : "Open report"}
        </Link>
      </CardContent>
    </Card>
  );
}
