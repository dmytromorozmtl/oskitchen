import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthScore } from "@/lib/executive/executive-health";

const STATUS_COLOR: Record<HealthScore["status"], string> = {
  Healthy: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  Watch: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  "At Risk": "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100",
  Critical: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
};

export function HealthScoreCard({ health }: { health: HealthScore }) {
  const top = health.contributions.slice(0, 3);
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Business health</CardTitle>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[health.status]}`}
          >
            {health.status}
          </span>
        </div>
        <CardDescription>Operational estimate based on workspace data — not an accounting statement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold">{health.score}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <p className="text-sm text-muted-foreground">{health.explanation}</p>
        {top.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">Top contributing issues</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {top.map((c) => (
                <li key={c.key}>
                  <span className="font-medium text-foreground">−{c.deduction}</span>{" "}
                  <span className="text-foreground">{c.label}</span> · {c.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
