import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { evaluateInventoryShortageReadiness } from "@/services/inventory/inventory-shortage-readiness-service";
import { listIntegrityIssues } from "@/services/integrity/integrity-service";

export default async function DataIntegrityPage() {
  const { userId } = await getTenantActor();
  const [issues, shortage] = await Promise.all([
    listIntegrityIssues(userId, 80),
    evaluateInventoryShortageReadiness(userId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Data integrity</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Read-only checks across orders, delivery addresses, pricing lines, and external catalog
          mapping. Each row links to the owning module — nothing is auto-deleted here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory shortage readiness</CardTitle>
          <CardDescription>{shortage.summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{shortage.level.replace(/_/g, " ")}</span>
          <span>Recipes {shortage.recipeCount}</span>
          <span>Stock rows {shortage.ingredientsWithStockRows}</span>
          <span>Demand runs {shortage.demandRuns}</span>
          <Link href="/dashboard/inventory/demand" className="text-primary underline-offset-4 hover:underline">
            Ingredient demand
          </Link>
          <Link href="/dashboard/purchasing" className="text-primary underline-offset-4 hover:underline">
            Purchasing
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open issues</CardTitle>
          <CardDescription>
            {issues.length === 0
              ? "No issues detected with the current ruleset."
              : `Showing ${issues.length} issue(s) — triage oldest revenue-impacting rows first.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">You&apos;re clear.</p>
          ) : (
            issues.map((i) => (
              <Link
                key={i.id}
                href={i.href}
                className="flex flex-col rounded-lg border border-border/70 px-3 py-2 text-sm hover:bg-muted/40"
              >
                <span className="font-medium">{i.title}</span>
                <span className="text-xs text-muted-foreground">{i.detail}</span>
                <span className="mt-1 text-[10px] uppercase text-muted-foreground">
                  {i.kind} · {i.severity}
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
