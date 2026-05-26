import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { getReportRegistryForScope } from "@/services/reports/report-service";

const OPS_CATEGORIES = new Set(["Operations", "Production", "Packing", "Delivery", "Inventory", "Purchasing", "Staff"]);

export default async function OperationsReportsPage() {
  const actor = await requireWorkspacePermissionActor();
  const scope = createReportActorScope(actor);
  const ops = getReportRegistryForScope(scope).filter((d) => OPS_CATEGORIES.has(d.category));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Operations reports</h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Production, packing, delivery, inventory, purchasing, and staff reports — everything kitchen leads
        and operators need.
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ops.map((d) => (
          <Card key={d.key} className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{d.title}</CardTitle>
              <CardDescription>{d.category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{d.description}</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={d.generatorRoute}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Open
                </Link>
                <Link
                  href={`/api/export/report?key=${d.key}`}
                  className="rounded-md border border-border px-3 py-1.5 text-xs"
                >
                  Export CSV
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
