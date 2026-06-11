import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import {
  REPORT_CATEGORIES,
  describeReportFormats,
  type ReportCategory,
} from "@/lib/reports/report-types";
import { canExportReports } from "@/lib/reports/report-export-access";
import { getReportRegistryForScope } from "@/services/reports/report-service";

export default async function ReportLibraryPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; mode?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const scope = createReportActorScope(actor);
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { kitchenSettings: { select: { businessType: true } } },
  });
  const mode = profile?.kitchenSettings?.businessType ?? null;
  const canExport = canExportReports(actor);
  const visible = getReportRegistryForScope(scope);

  const filtered = visible.filter((d) => {
    if (params.category && d.category !== params.category) return false;
    if (params.mode === "1" && mode && d.businessModes.length > 0 && !d.businessModes.includes(mode)) {
      return false;
    }
    return true;
  });

  const grouped = new Map<ReportCategory, typeof filtered>();
  for (const d of filtered) {
    const list = grouped.get(d.category) ?? [];
    list.push(d);
    grouped.set(d.category, list);
  }

  const lastExportByKey = new Map<string, Date>();
  if (filtered.length > 0) {
    const rows = await prisma.exportJob.findMany({
      where: { userId, type: { startsWith: "report:" } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { type: true, createdAt: true },
    });
    for (const r of rows) {
      const k = r.type.replace(/^report:/, "");
      if (!lastExportByKey.has(k)) lastExportByKey.set(k, r.createdAt);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Report library</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Choose from {visible.length} report templates. Use category and business-mode filters to focus on
          what matters this week.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Category:</span>
        <Link
          href="/dashboard/reports/library"
          className={`rounded-full px-3 py-1 ${
            !params.category ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          All
        </Link>
        {REPORT_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/dashboard/reports/library?category=${encodeURIComponent(c)}${
              params.mode === "1" ? "&mode=1" : ""
            }`}
            className={`rounded-full px-3 py-1 ${
              params.category === c ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {c}
          </Link>
        ))}
        {mode && (
          <Link
            href={`/dashboard/reports/library?${params.category ? `category=${encodeURIComponent(params.category)}&` : ""}${
              params.mode === "1" ? "" : "mode=1"
            }`}
            className={`ml-2 rounded-full px-3 py-1 ${
              params.mode === "1" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {params.mode === "1" ? "Showing reports tagged for your business mode" : "Only show reports tagged for my mode"}
          </Link>
        )}
      </div>

      {Array.from(grouped.entries()).map(([category, defs]) => (
        <section key={category} className="space-y-2">
          <h2 className="text-lg font-semibold">{category}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {defs.map((d) => (
              <Card key={d.key} className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{d.title}</CardTitle>
                  <CardDescription>{d.financial ? "Financial · " : ""}{d.tags.join(" · ") || "Report"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{d.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Formats: {describeReportFormats(d.availableFormats)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last generated:{" "}
                    {lastExportByKey.has(d.key)
                      ? lastExportByKey.get(d.key)!.toISOString().slice(0, 10)
                      : "—"}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href={d.generatorRoute}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    >
                      Open
                    </Link>
                    {canExport && (
                      <Link
                        href={`/api/export/report?key=${d.key}`}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                      >
                        Export CSV
                      </Link>
                    )}
                    {d.legacyExportHref && (
                      <Link
                        href={d.legacyExportHref}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                      >
                        Legacy export
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No reports match this filter. Reset filters or pick a different category.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
