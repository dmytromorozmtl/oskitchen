"use client";

import * as React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { extensionCategoryLabel, type ExtensionCategory } from "@/lib/commercial/partner-apps-catalog";
import {
  filterExtensionsCatalog,
  type ExtensionCatalogItem,
  type ExtensionKind,
  type ExtensionsCatalogSummary,
} from "@/services/platform/extensions-catalog-service";
import { cn } from "@/lib/utils";

const KIND_LABELS: Record<ExtensionKind, string> = {
  first_party: "First-party",
  partner: "Partner",
  oauth_app: "OAuth app",
  roadmap: "Roadmap",
};

const CONNECTION_LABELS: Record<ExtensionCatalogItem["connectionState"], string> = {
  connected: "Connected",
  needs_auth: "Needs auth",
  error: "Error",
  disabled: "Disabled",
  not_applicable: "N/A",
  not_connected: "Not connected",
};

export function ExtensionsCatalogPanel({
  items,
  summary,
  canManage,
}: {
  items: ExtensionCatalogItem[];
  summary: ExtensionsCatalogSummary;
  canManage: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<ExtensionCategory | "all">("all");
  const [kind, setKind] = React.useState<ExtensionKind | "all">("all");

  const filtered = filterExtensionsCatalog(items, { query, category, kind });

  return (
    <div className="space-y-6" data-testid="extensions-catalog-panel">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            <p className="text-2xl font-semibold">{summary.total}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Connected</CardTitle>
            <p className="text-2xl font-semibold">{summary.connectedFirstParty}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Certified partners</CardTitle>
            <p className="text-2xl font-semibold">{summary.certifiedPartners}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Roadmap</CardTitle>
            <p className="text-2xl font-semibold">{summary.roadmap}</p>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search extensions…"
          className="max-w-sm rounded-full"
          data-testid="extensions-catalog-search"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ExtensionCategory | "all")}
          className="h-10 rounded-full border bg-background px-3 text-sm"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {(
            [
              "sales_channels",
              "accounting",
              "labor",
              "marketing",
              "operations",
              "analytics",
              "developer",
            ] as ExtensionCategory[]
          ).map((value) => (
            <option key={value} value={value}>
              {extensionCategoryLabel(value)}
            </option>
          ))}
        </select>
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as ExtensionKind | "all")}
          className="h-10 rounded-full border bg-background px-3 text-sm"
          aria-label="Filter by kind"
        >
          <option value="all">All kinds</option>
          {(Object.keys(KIND_LABELS) as ExtensionKind[]).map((value) => (
            <option key={value} value={value}>
              {KIND_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="border-border/80">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <CardDescription>{item.publisher}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{item.status}</Badge>
                  <Badge variant="outline">{KIND_LABELS[item.kind]}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{extensionCategoryLabel(item.category)}</span>
                <span>·</span>
                <span
                  className={cn(
                    item.connectionState === "connected" && "text-primary font-medium",
                    item.connectionState === "error" && "text-destructive",
                  )}
                >
                  {CONNECTION_LABELS[item.connectionState]}
                </span>
                {item.certificationLabel ? (
                  <>
                    <span>·</span>
                    <span>{item.certificationLabel}</span>
                  </>
                ) : null}
              </div>
              {item.honestyNote ? (
                <p className="text-xs text-amber-800 dark:text-amber-200">{item.honestyNote}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {item.setupRoute && canManage ? (
                  <Button asChild size="sm" className="rounded-full">
                    <Link href={item.setupRoute}>Set up</Link>
                  </Button>
                ) : null}
                {item.embedRoute ? (
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href={item.embedRoute}>Open</Link>
                  </Button>
                ) : null}
                {item.externalUrl ? (
                  <Button asChild size="sm" variant="ghost" className="rounded-full">
                    <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                      Website
                    </a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No extensions match your filters.</p>
      ) : null}
    </div>
  );
}
