import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VISUAL_QA_KDS_TICKETS } from "@/lib/qa/visual-qa-p3-55-fixtures";

const STATION_STYLES: Record<string, string> = {
  NEW: "border-sky-500/40 bg-sky-500/5",
  "IN PROGRESS": "border-amber-500/40 bg-amber-500/5",
  READY: "border-emerald-500/40 bg-emerald-500/5",
};

/** Static KDS kitchen screen for Playwright visual QA baselines. */
export function VisualKdsKitchenShell() {
  return (
    <div className="space-y-4" data-testid="visual-kds-kitchen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kitchen Display</h1>
          <p className="text-sm text-muted-foreground">Expo lane · Sound alerts on</p>
        </div>
        <Badge>3 tickets active</Badge>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {VISUAL_QA_KDS_TICKETS.map((ticket) => (
          <Card key={ticket.id} className={STATION_STYLES[ticket.station] ?? ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{ticket.number}</CardTitle>
              <Badge variant="outline">{ticket.elapsed}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{ticket.items}</p>
              <Badge variant="secondary">{ticket.station}</Badge>
              <Button variant="outline" className="w-full rounded-xl">
                Mark ready
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
