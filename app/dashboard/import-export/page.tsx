import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireImportExportPageAccess } from "@/lib/import-export/import-export-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadDataOperationsOverview } from "@/services/import-export/data-operations-overview";

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default async function ImportExportOverviewPage() {
  const access = await requireImportExportPageAccess();
  if (!access.ok) return access.deny;

  const { sessionUser: user, dataUserId } = await getTenantActor();
  const kpi = await loadDataOperationsOverview(dataUserId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Import / Export Center</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Move data safely with templates, validation previews, exports, import history, and rollback.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/import-export/import">Import CSV</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/import-export/export">Export data</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Imports this month" value={kpi.importsThisMonth} />
        <Kpi label="Exports this month" value={kpi.exportsThisMonth} />
        <Kpi label="Jobs in upload / mapping / preview" value={kpi.pendingValidation} />
        <Kpi label="Rows imported (completed jobs, month)" value={kpi.rowsImportedThisMonth} />
        <Kpi label="Rows flagged with errors (month)" value={kpi.rowsWithErrorsThisMonth} />
        <Kpi label="Rollback-eligible imports" value={kpi.rollbackEligibleJobs} />
        <Card className="border-border/80 shadow-sm sm:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription>Last export</CardDescription>
            <CardTitle className="text-base font-medium leading-snug">
              {kpi.lastExportLabel ?? "No exports recorded yet."}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">What to do next</CardTitle>
            <CardDescription>Typical onboarding and migration paths.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <Link href="/dashboard/import-export/templates" className="font-medium text-primary underline underline-offset-4">
                Download a template
              </Link>{" "}
              for the dataset you are moving, then{" "}
              <Link href="/dashboard/import-export/import" className="font-medium text-primary underline underline-offset-4">
                run an import preview
              </Link>{" "}
              before any rows touch production tables.
            </p>
            <p>
              Use{" "}
              <Link href="/dashboard/import-export/export" className="font-medium text-primary underline underline-offset-4">
                Export data
              </Link>{" "}
              for backups, finance extracts, and channel migrations. Legacy session-cookie URLs under{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">/api/export?type=…</code> stay supported.
            </p>
            <p>
              Ingredient demand detail still lives on{" "}
              <Link href="/dashboard/inventory/demand" className="font-medium text-primary underline underline-offset-4">
                Ingredient demand
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Legacy CSV exports</CardTitle>
            <CardDescription>Same endpoints as before — now logged as export jobs.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {[
              { label: "Orders", href: "/api/export?type=orders" },
              { label: "Customers", href: "/api/export?type=customers" },
              { label: "Menu items", href: "/api/export?type=products" },
              { label: "Production", href: "/api/export?type=production" },
              { label: "Ingredients / inventory", href: "/api/export?type=inventory" },
            ].map((x) => (
              <Link key={x.href} href={x.href} className="font-medium text-primary underline underline-offset-4">
                {x.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
