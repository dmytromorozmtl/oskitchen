import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type WorkbenchKpis = {
  unmapped: number;
  suggested: number;
  needsReview: number;
  approved: number;
  conflicts: number;
  providersConnected: number;
  lastSyncAt: Date | null;
  blockedOrderLines: number;
};

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

export function WorkbenchKpiGrid({ tiles }: { tiles: WorkbenchKpis }) {
  const lastSync = tiles.lastSyncAt ? tiles.lastSyncAt.toISOString().slice(0, 16).replace("T", " ") : "—";
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Tile label="Unmapped products" value={tiles.unmapped} />
      <Tile label="Suggested" value={tiles.suggested} hint="Awaiting approval" />
      <Tile label="Needs review" value={tiles.needsReview} />
      <Tile label="Approved mappings" value={tiles.approved} />
      <Tile label="Conflicts" value={tiles.conflicts} />
      <Tile label="Blocked order lines" value={tiles.blockedOrderLines} hint="Order Hub waiting" />
      <Tile label="Providers connected" value={tiles.providersConnected} />
      <Tile label="Last sync" value={lastSync} />
    </div>
  );
}
