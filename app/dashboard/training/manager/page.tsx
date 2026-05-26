import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

const modules = [
  ["Order hub", "/dashboard/order-hub", "Resolve incoming orders, failed syncs, and urgent changes."],
  ["Menu planner", "/dashboard/menu-planner", "Publish weekly menus and active storefront items."],
  ["Reports", "/dashboard/reports", "Export production, margin, delivery, and customer reports."],
  ["Integrations", "/dashboard/sales-channels", "Check channel status and credential warnings."],
] as const;

export default async function ManagerTrainingPage() {
  await getTenantActor();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Manager and owner training</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map(([title, href, desc]) => (
          <Card key={href}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={href}>Open {title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
