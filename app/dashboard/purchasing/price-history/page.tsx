import { PageHeader } from "@/components/layout/page-header";
import { SupplierPriceChart } from "@/components/purchasing/supplier-price-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  compareSupplierPricesByIngredient,
  getSupplierPriceHistoryForChart,
} from "@/services/purchasing/supplier-price-history-service";

export default async function PriceHistoryPage() {
  const { dataUserId } = await getTenantActor();
  const [chartData, comparisons] = await Promise.all([
    getSupplierPriceHistoryForChart(dataUserId),
    compareSupplierPricesByIngredient(dataUserId),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Price history"
        description="Supplier price trends and cross-supplier comparison for the same ingredient."
      />
      <SupplierPriceChart data={chartData} />
      <Card>
        <CardHeader>
          <CardTitle>Compare suppliers</CardTitle>
          <CardDescription>Ingredients with more than one supplier price on record.</CardDescription>
        </CardHeader>
        <CardContent>
          {comparisons.length === 0 ? (
            <p className="text-sm text-muted-foreground">Link supplier items to ingredients to compare prices.</p>
          ) : (
            <ul className="space-y-4 text-sm">
              {comparisons.map((row) => (
                <li key={row.ingredientId} className="rounded-lg border border-border/70 p-3">
                  <p className="font-medium">{row.ingredientName}</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {row.suppliers.map((s) => (
                      <li key={s.supplierName}>
                        {s.supplierName}: ${s.latestPrice.toFixed(4)} (effective {s.effectiveAt})
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
