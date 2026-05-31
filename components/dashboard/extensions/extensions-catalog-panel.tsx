"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Puzzle, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  extensionCategoryLabel,
  type ExtensionCategory,
} from "@/lib/commercial/partner-apps-catalog";
import type {
  ExtensionCatalogItem,
  ExtensionKind,
  ExtensionsCatalogSummary,
} from "@/services/platform/extensions-catalog-service";
import { cn } from "@/lib/utils";

type ExtensionsCatalogPanelProps = {
  items: ExtensionCatalogItem[];
  summary: ExtensionsCatalogSummary;
  canManage: boolean;
};

const CATEGORY_OPTIONS: Array<{ value: ExtensionCategory | "all"; label: string }> = [
  { value: "all", label: "All categories" },
  { value: "sales_channels", label: "Sales channels" },
  { value: "accounting", label: "Accounting" },
  { value: "labor", label: "Labor" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
  { value: "analytics", label: "Analytics" },
  { value: "developer", label: "Developer" },
];

const KIND_OPTIONS: Array<{ value: ExtensionKind | "all"; label: string }> = [
  { value: "all", label: "All types" },
  { value: "first_party", label: "OS Kitchen built" },
  { value: "partner", label: "Certified partners" },
  { value: "oauth_app", label: "OAuth apps" },
  { value: "roadmap", label: "Roadmap" },
];

function statusBadgeVariant(
  status: ExtensionCatalogItem["status"],
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "LIVE":
      return "default";
    case "BETA":
    case "CERTIFIED":
      return "secondary";
    case "PLACEHOLDER":
    case "ROADMAP":
      return "outline";
    default:
      return "outline";
  }
}

function connectionLabel(state: ExtensionCatalogItem["connectionState"]): string | null {
  switch (state) {
    case "connected":
      return "Connected";
    case "needs_auth":
      return "Needs auth";
    case "error":
      return "Error";
    case "disabled":
      return "Disabled";
    case "not_connected":
      return "Not connected";
    default:
      return null;
  }
}

function ExtensionCard({ item, canManage }: { item: ExtensionCatalogItem; canManage: boolean }) {
  const conn = connectionLabel(item.connectionState);
  const primaryHref = item.setupRoute ?? item.externalUrl;
  const isExternal = Boolean(item.externalUrl && !item.setupRoute);

  return (
    <Card className="flex h-full flex-col border-border/70">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base leading-snug">{item.name}</CardTitle>
            <CardDescription className="text-xs">{item.publisher}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant={statusBadgeVariant(item.status)} className="rounded-full text-[10px] uppercase">
              {item.status}
            </Badge>
            {item.certificationLabel ? (
              <Badge variant="outline" className="rounded-full text-[10px]">
                {item.certificationLabel}
              </Badge>
            ) : null}
            {conn ? (
              <Badge
                variant={item.connectionState === "connected" ? "secondary" : "outline"}
                className="rounded-full text-[10px]"
              >
                {conn}
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          {extensionCategoryLabel(item.category)}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0 text-sm">
        <p className="flex-1 text-muted-foreground leading-relaxed">{item.description}</p>
        {item.honestyNote ? (
          <p className="rounded-md border border-amber-500/25 bg-amber-500/5 px-2.5 py-2 text-xs text-muted-foreground">
            {item.honestyNote}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full text-[10px] font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {primaryHref ? (
            canManage || item.kind === "partner" || item.kind === "roadmap" ? (
              isExternal ? (
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href={primaryHref} target={primaryHref.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    Contact partner
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              ) : (
                <Button asChild size="sm" className="rounded-full">
                  <Link href={primaryHref}>
                    {item.kind === "roadmap" ? "Read roadmap" : item.kind === "partner" ? "Learn more" : item.kind === "oauth_app" ? "Install OAuth app" : "Open setup"}
                  </Link>
                </Button>
              )
            ) : (
              <span className="text-xs text-muted-foreground">Manager setup required</span>
            )
          ) : item.externalUrl ? (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href={item.externalUrl}>Partner program</Link>
            </Button>
          ) : null}
          {item.setupRoute && item.externalUrl && item.kind === "partner" ? (
            <Button asChild size="sm" variant="ghost" className="rounded-full">
              <Link href={item.externalUrl}>Apply via partners</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExtensionsCatalogPanel({ items, summary, canManage }: ExtensionsCatalogPanelProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExtensionCategory | "all">("all");
  const [kind, setKind] = useState<ExtensionKind | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (kind !== "all" && item.kind !== kind) return false;
      if (!q) return true;
      const haystack = [item.name, item.publisher, item.description, item.tags.join(" ")].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query, category, kind]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Catalog entries</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">First-party connected</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.connectedFirstParty}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certified partners</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.certifiedPartners}</CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search extensions, partners, tags…"
            className="pl-9"
            aria-label="Search extensions catalog"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {KIND_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setKind(opt.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              kind === opt.value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          <Puzzle className="mx-auto mb-2 h-8 w-8 opacity-40" />
          No extensions match your filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <ExtensionCard key={item.id} item={item} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}
