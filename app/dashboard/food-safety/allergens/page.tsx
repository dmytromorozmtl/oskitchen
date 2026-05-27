import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canExportReports } from "@/lib/reports/report-export-access";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { listMenuAllergenSummary } from "@/services/allergen/allergen-service";

export default async function AllergensPage() {
  const actor = await requireWorkspacePermissionActor();
  const items = await listMenuAllergenSummary(actor.dataUserId);
  const canExport = canExportReports(actor);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Allergen management</h1>
      <p className="text-sm text-muted-foreground">
        Menu-wide allergen declarations from product profiles and ingredient text. Conflicts surface on
        production queue and packing.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menu allergen summary</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Product</th>
                <th className="pb-2">Allergens</th>
                <th className="pb-2">Verification</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.productId} className="border-b border-border/60">
                  <td className="py-2 font-medium">{row.productName}</td>
                  <td className="py-2 text-muted-foreground">
                    {row.allergens.length ? row.allergens.join(", ") : "—"}
                  </td>
                  <td className="py-2 text-xs">{row.verificationStatus}</td>
                  <td className="py-2 text-right">
                    {row.recipeId && canExport ? (
                      <Link
                        href={`/api/export/allergen-sheet?recipeId=${row.recipeId}`}
                        className="text-xs text-primary underline"
                      >
                        Print sheet
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
