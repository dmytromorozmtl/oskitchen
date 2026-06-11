import Link from "next/link";

import { ReportCatalogClient } from "@/components/dashboard/report-catalog-client";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import {
  hasReportsHubPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";
import { prisma } from "@/lib/prisma";
import {
  getRecentlyRunReportKeys,
  getRecommendedReportsForRole,
  listReportCatalog,
  mergeRegistryIntoCatalogSummary,
  type ReportCatalogEntry,
} from "@/services/analytics/report-catalog-service";
import { REPORT_REGISTRY } from "@/lib/reports/report-registry";
import type { ReportKey } from "@/lib/reports/report-types";

function catalogEntryForRegistryKey(key: ReportKey) {
  const catalog = listReportCatalog();
  return (
    catalog.find((entry) => entry.registryKey === key) ??
    catalog.find((entry) => entry.id.includes(key.replace(/_/g, "-"))) ??
    null
  );
}

function recentCatalogFallback(key: ReportKey): ReportCatalogEntry {
  const def = REPORT_REGISTRY[key];
  return {
    id: key,
    title: def?.title ?? key,
    description: def?.description ?? "Recently run report",
    category: "Sales",
    metrics: ["revenue"],
    groupBy: ["day"],
    exportFormats: ["csv", "pdf", "xlsx"],
    registryKey: key,
    generatorRoute: def?.generatorRoute ?? `/dashboard/reports/${key}`,
    status: "available",
    recommendedRoles: ["owner"],
    tags: ["recent"],
  };
}

export default async function ReportCatalogPage() {
  const actor = await loadWorkspacePermissionPageActor();
  if (!hasReportsHubPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="reports_hub" />;
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: actor.userId },
    select: { role: true, kitchenSettings: { select: { businessType: true } } },
  });

  const role =
    profile?.role === "OWNER"
      ? "owner"
      : profile?.role === "STAFF"
        ? "operations"
        : "manager";

  const summary = mergeRegistryIntoCatalogSummary();
  const entries = listReportCatalog();
  const recommended = getRecommendedReportsForRole(role);
  const recentKeys = getRecentlyRunReportKeys();
  const recentlyRun = recentKeys
    .map((key) => catalogEntryForRegistryKey(key) ?? recentCatalogFallback(key))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Report catalog</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {summary.catalogTotal}+ reports across sales, labor, inventory, finance, customers, and operations.
            Search, filter by category, or build your own.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/reports/library">Classic library</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard/reports/catalog/builder">Custom builder</Link>
          </Button>
        </div>
      </header>

      <ReportCatalogClient
        entries={entries}
        recommended={recommended}
        recentlyRun={recentlyRun}
        catalogTotal={summary.catalogTotal}
        wiredTotal={summary.wiredTotal}
      />
    </div>
  );
}
