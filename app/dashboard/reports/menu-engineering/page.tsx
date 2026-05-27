import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";
import { getMenuEngineeringMatrix } from "@/services/analytics/menu-engineering-service";

const categoryColors: Record<string, string> = {
  STAR: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  PLOW: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  PUZZLE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  DOG: "bg-muted text-muted-foreground",
};

export default async function MenuEngineeringPage() {
  const access = await requireReportsPageAccess("reports.read.financial");
  if (!access.ok) {
    return access.deny;
  }
  const { actor } = access;
  const { userId } = actor;
  const matrix = await getMenuEngineeringMatrix(userId);

  const byCategory = {
    STAR: matrix.filter((m) => m.category === "STAR"),
    PLOW: matrix.filter((m) => m.category === "PLOW"),
    PUZZLE: matrix.filter((m) => m.category === "PUZZLE"),
    DOG: matrix.filter((m) => m.category === "DOG"),
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">Menu engineering matrix</h1>
      <p className="text-sm text-muted-foreground">
        Star / Plow / Puzzle / Dog classification from 90-day popularity vs margin (65% target).
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {(["STAR", "PLOW", "PUZZLE", "DOG"] as const).map((cat) => (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${categoryColors[cat]}`}>{cat}</span>
                <span className="text-muted-foreground font-normal">{byCategory[cat].length} items</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto text-sm space-y-1">
              {byCategory[cat].map((m) => (
                <div key={m.productId} className="flex justify-between border-b py-1">
                  <span>{m.productName}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {m.popularity} orders · {m.profitability}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
