import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { workspacePermissionForExport } from "@/lib/import-export/export-permission";
import { ALL_EXPORT_TYPES, type ExportType } from "@/lib/import-export/export-types";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { isSuperAdminEmail } from "@/lib/platform-owner";

const COPY: Record<
  ExportType,
  { title: string; description: string }
> = {
  orders: { title: "Orders", description: "Latest orders with fulfillment metadata (legacy cap 5k)." },
  customers: { title: "Customers", description: "Distinct guests inferred from order history." },
  products: { title: "Menu items", description: "Catalog rows with menu linkage and prep dates." },
  production: { title: "Production grid", description: "Cook / pack / label flags per product." },
  inventory: { title: "Ingredients", description: "Ingredient catalog and stock snapshot." },
  integrations_metadata: { title: "Integrations metadata", description: "Connected channels without secrets." },
  menus: { title: "Menus", description: "Menu headers, strategy, and publish windows." },
  brands: { title: "Brands", description: "Brands for workspaces you own." },
  locations: { title: "Locations", description: "Operational locations and timezones." },
  recipes: { title: "Recipes", description: "Recipe yields linked to menu items." },
  suppliers: { title: "Suppliers", description: "Purchasing vendor directory." },
  purchase_orders: { title: "Purchase orders", description: "PO headers with line counts." },
  costing_snapshots: { title: "Costing snapshots", description: "Historical cost and margin snapshots." },
  ingredient_demand: { title: "Ingredient demand runs", description: "Demand run summaries; detail grid stays on demand page." },
  nutrition_labels: { title: "Nutrition labels", description: "Macro snapshot per product." },
  packing: { title: "Packing batches", description: "Batch-oriented packing progress." },
  reports: { title: "Reports (placeholder)", description: "Pointer CSV until report pack export ships." },
  audit_logs: { title: "Audit logs", description: "Platform superadmin only — scoped audit trail CSV." },
};

export default async function ExportDataPage() {
  const actor = await requireWorkspacePermissionActor();
  const email = actor.email ?? "";
  const types = ALL_EXPORT_TYPES.filter((type) => {
    if (type === "audit_logs") return isSuperAdminEmail(email);
    return hasPermission(actor.granted, workspacePermissionForExport(type));
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export data</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Session-authenticated CSV downloads. Each successful download is recorded as an export job. Filters, JSON, and
          PDF variants will extend this surface without breaking legacy query parameters.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((type) => {
          const meta = COPY[type];
          const href = `/api/export?type=${encodeURIComponent(type)}`;
          return (
            <Card key={type} className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{meta.title}</CardTitle>
                <CardDescription>{meta.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={href} className="text-sm font-medium text-primary underline underline-offset-4">
                  Download CSV
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        Ingredient demand line detail:{" "}
        <Link href="/dashboard/inventory/demand" className="underline underline-offset-4">
          Ingredient demand
        </Link>
        .
      </p>
    </div>
  );
}
