import Link from "next/link";
import { CheckCircle2, Circle, ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Era20PilotExecutionReadinessSlice } from "@/lib/commercial/era20-pilot-execution-readiness";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { cn } from "@/lib/utils";

export function ImplementationPilotExecutionReadinessPanel(props: {
  slice: Era20PilotExecutionReadinessSlice;
}) {
  const { slice } = props;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="implementation-pilot-execution-readiness"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-muted-foreground" aria-hidden />
              Pilot execution readiness
            </CardTitle>
            <CardDescription className="mt-1 max-w-2xl">{slice.headline}</CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full tabular-nums">
            Support {slice.supportChecklistDoneCount}/{slice.supportChecklistTotal}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <GateChip
            label="Metrics baseline"
            pass={slice.metricsGate.pass}
            detail={slice.metricsGate.reason}
          />
          <GateChip
            label="Rollback drill"
            pass={slice.rollbackGate.pass}
            detail={slice.rollbackGate.reason}
          />
        </div>

        <ul className="space-y-2" aria-label="Support checklist">
          {slice.supportChecklist.map((row) => (
            <li
              key={row.id}
              className="flex items-start gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
              data-testid={`pilot-support-checklist-${row.id}`}
            >
              {row.status === "done" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <div className="min-w-0">
                <p className="font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.detail}</p>
              </div>
              <Badge
                variant={row.status === "done" ? "default" : "outline"}
                className="ml-auto shrink-0 rounded-full text-[10px] capitalize"
              >
                {row.status.replaceAll("_", " ")}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={LAUNCH_WIZARD_ROUTE}>Launch wizard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/integration-health">Integration Health</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GateChip(props: { label: string; pass: boolean; detail: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3 text-sm",
        props.pass
          ? "border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/15"
          : "border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15",
      )}
    >
      <p className="font-medium">{props.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{props.detail}</p>
    </div>
  );
}
