import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type ImportCenterKpiTiles = {
  importsThisMonth: number;
  pendingValidation: number;
  readyToCommit: number;
  rowsImportedThisMonth: number;
  rowsWithErrorsThisMonth: number;
  rollbackEligibleJobs: number;
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

export function ImportCenterKpiGrid({ tiles }: { tiles: ImportCenterKpiTiles }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Tile label="Imports this month" value={tiles.importsThisMonth} />
      <Tile label="Pending validation" value={tiles.pendingValidation} hint="Uploaded or mapping required" />
      <Tile label="Ready to commit" value={tiles.readyToCommit} />
      <Tile label="Rows imported (month)" value={tiles.rowsImportedThisMonth} />
      <Tile label="Rows with errors (month)" value={tiles.rowsWithErrorsThisMonth} />
      <Tile label="Rollback-eligible jobs" value={tiles.rollbackEligibleJobs} />
    </div>
  );
}
