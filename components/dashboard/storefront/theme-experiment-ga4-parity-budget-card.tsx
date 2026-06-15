import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ga4ParityErrorBudget } from "@/lib/storefront/ga4-parity-budget";

const STATUS_VARIANT: Record<
  Ga4ParityErrorBudget["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  healthy: "default",
  warning: "outline",
  exhausted: "destructive",
};

export function ThemeExperimentGa4ParityBudgetCard({ budget }: { budget: Ga4ParityErrorBudget }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">GA4 parity error budget</CardTitle>
        <CardDescription>
          Drift-days in a {budget.windowDays}d window (budget: {budget.budgetDays} days above 3 pp).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANT[budget.status]}>{budget.status}</Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {budget.driftDays}/{budget.budgetDays} drift days · {budget.burnPercent}% burned
          </span>
        </div>
        <p className="font-medium">{budget.headline}</p>
        <p className="text-muted-foreground">{budget.detail}</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${budget.status === "exhausted" ? "bg-destructive" : budget.status === "warning" ? "bg-amber-500" : "bg-primary"}`}
            style={{ width: `${Math.min(100, budget.burnPercent)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
