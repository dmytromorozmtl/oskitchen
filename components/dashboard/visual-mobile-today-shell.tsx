import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VISUAL_QA_TODAY_STATS } from "@/lib/qa/visual-qa-p3-55-fixtures";

/** Static mobile Today command center for Playwright visual QA baselines. */
export function VisualMobileTodayShell() {
  return (
    <div className="mx-auto max-w-sm space-y-4" data-testid="visual-mobile-today">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Saturday</p>
        <h1 className="text-2xl font-semibold tracking-tight">Today in Demo Kitchen</h1>
        <p className="text-sm text-muted-foreground">Mobile command center preview</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {VISUAL_QA_TODAY_STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="space-y-1 p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-4 pt-0">
              <p className="text-xl font-semibold">{stat.value}</p>
              <Badge variant="secondary" className="text-[10px]">
                {stat.delta}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Needs attention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0 text-sm text-muted-foreground">
          <p>DoorDash webhook delayed · 2 unmatched SKUs</p>
          <p>Labour cost trending +1.2% vs yesterday</p>
        </CardContent>
      </Card>
    </div>
  );
}
