import Link from "next/link";
import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  listLiveIntegrationDodRows,
  summarizeLiveIntegrationDod,
  type LiveIntegrationDodGate,
  type LiveIntegrationDodRow,
} from "@/lib/integrations/live-integration-dod-tracker";
import { cn } from "@/lib/utils";

const GATE_ICON = {
  passed: CheckCircle2,
  failed: XCircle,
  not_measured: CircleDashed,
  not_applicable: CircleDashed,
} as const;

const GATE_CLASS = {
  passed: "text-emerald-600 dark:text-emerald-400",
  failed: "text-rose-600 dark:text-rose-400",
  not_measured: "text-muted-foreground",
  not_applicable: "text-muted-foreground",
} as const;

function GatePill({ gate }: { gate: LiveIntegrationDodGate }) {
  const Icon = GATE_ICON[gate.status];
  return (
    <div
      className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/70 px-2 py-1.5"
      title={gate.detail}
    >
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", GATE_CLASS[gate.status])} aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide">{gate.id}</p>
        <p className="text-[11px] text-muted-foreground">{gate.label}</p>
      </div>
    </div>
  );
}

function DodRow({ row }: { row: LiveIntegrationDodRow }) {
  return (
    <div
      className="rounded-xl border border-border/70 bg-muted/10 p-3"
      data-testid={`live-integration-dod-${row.integrationId}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.name}</p>
            <Badge variant="outline" className="rounded-full text-[10px] uppercase">
              {row.registryStatus}
            </Badge>
          </div>
          {row.blockedReason ? (
            <p className="mt-1 text-xs text-muted-foreground">{row.blockedReason}</p>
          ) : null}
        </div>
        <Link
          href={row.setupRoute}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          Setup →
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {row.gates.map((gate) => (
          <GatePill key={gate.id} gate={gate} />
        ))}
      </div>
    </div>
  );
}

/** LIVE promotion gate tracker for eighteen BETA registry integrations. */
export function LiveIntegrationDodPanel() {
  const rows = listLiveIntegrationDodRows();
  const summary = summarizeLiveIntegrationDod(rows);

  return (
    <Card data-testid="live-integration-dod-panel">
      <CardHeader>
        <CardTitle className="text-base">LIVE promotion gates (G1–G4)</CardTitle>
        <CardDescription>
          Honest DoD tracker (`live-integration-dod-v1`). {summary.liveCount} LIVE ·{" "}
          {summary.scaffoldReadyCount}/{summary.total} G1 · {summary.envReadyCount}/{summary.total}{" "}
          G2 · {summary.promotionEligibleCount} G1+G2 ready · G3/G4 require production proof.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.map((row) => (
          <DodRow key={row.integrationId} row={row} />
        ))}
      </CardContent>
    </Card>
  );
}
