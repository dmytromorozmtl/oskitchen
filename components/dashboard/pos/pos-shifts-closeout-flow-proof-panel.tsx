import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ShiftCloseoutFlowHopProofState,
  ShiftCloseoutFlowProofSlice,
} from "@/lib/commercial/era20-shift-closeout-flow-proof-era20";
import { cn } from "@/lib/utils";

function hopBadgeVariant(
  state: ShiftCloseoutFlowHopProofState,
): "default" | "secondary" | "destructive" | "outline" {
  switch (state) {
    case "real_ci":
      return "default";
    case "rbac_blocked":
      return "destructive";
    default:
      return "outline";
  }
}

function hopBadgeLabel(state: ShiftCloseoutFlowHopProofState): string {
  switch (state) {
    case "real_ci":
      return "CI backed";
    case "rbac_blocked":
      return "RBAC blocked";
    default:
      return "Staging manual";
  }
}

export function PosShiftsCloseoutFlowProofPanel(props: {
  slice: ShiftCloseoutFlowProofSlice;
  compact?: boolean;
}) {
  const { slice, compact = false } = props;

  return (
    <Card className="border-border/80 shadow-sm" data-testid="pos-shifts-closeout-flow-proof">
      <CardHeader className={cn("pb-3", compact && "py-3")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-muted-foreground" aria-hidden />
              Shift closeout proof
            </CardTitle>
            {!compact ? (
              <CardDescription className="mt-1 max-w-2xl">{slice.headline}</CardDescription>
            ) : null}
          </div>
          <Badge variant="outline" className="rounded-full tabular-nums">
            Tier 2 · {slice.tier2PhaseId}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pt-0")}>
        {compact ? <p className="text-sm text-muted-foreground">{slice.headline}</p> : null}

        <ol className="space-y-2" aria-label="Shift closeout hops">
          {slice.hops.map((hop) => (
            <li
              key={hop.id}
              className="rounded-xl border border-border/60 px-3 py-3"
              data-testid={`shift-closeout-hop-${hop.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {hop.order}. {hop.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{hop.dataPath}</p>
                  {hop.blocker ? (
                    <p className="mt-1 text-xs text-muted-foreground">{hop.blocker}</p>
                  ) : null}
                </div>
                <Badge
                  variant={hopBadgeVariant(hop.proofState)}
                  className="shrink-0 rounded-full text-[10px]"
                >
                  {hopBadgeLabel(hop.proofState)}
                </Badge>
              </div>
              <div className="mt-2">
                <Button asChild variant="outline" size="sm" className="h-8 rounded-full">
                  <Link href={hop.uiHref}>
                    Open step
                    <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-xs text-muted-foreground">
          {slice.parentWorkflowBlocker} — {slice.parentWorkflowNextAction}
        </p>
      </CardContent>
    </Card>
  );
}
