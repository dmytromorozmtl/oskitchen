import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { StaffKpis } from "@/services/staff/staff-service";

function Tile({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "danger" | "warning" | "success" | "neutral" }) {
  const cls = tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : tone === "success" ? "text-emerald-600" : "";
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={`text-2xl tabular-nums ${cls}`}>{value}</CardTitle>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

export function StaffKpiGrid({ tiles }: { tiles: StaffKpis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Tile label="Active staff" value={tiles.active} tone={tiles.active > 0 ? "success" : "warning"} />
      <Tile label="Invited" value={tiles.invited} />
      <Tile label="Training incomplete" value={tiles.trainingIncomplete} tone={tiles.trainingIncomplete > 0 ? "warning" : "success"} />
      <Tile label="Certs expiring" value={tiles.certsExpiring} tone={tiles.certsExpiring > 0 ? "warning" : "success"} hint="Within 30 days" />
      <Tile label="Active certifications" value={tiles.certsActive} />
      <Tile label="Drivers available" value={tiles.driversAvailable} />
      <Tile label="Assigned today" value={tiles.assignedToday} />
      <Tile label="Unavailable today" value={tiles.unavailableToday} tone={tiles.unavailableToday > 0 ? "warning" : "success"} />
      <Tile label="Open tasks" value={tiles.openTasks} />
      <Tile label="Custom roles" value={tiles.totalRoles} />
      <Tile label="Archived" value={tiles.archived} />
    </div>
  );
}
