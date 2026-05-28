import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ManagerDiscountAuditFlowHopProofState,
  ManagerDiscountAuditFlowProofSlice,
} from "@/lib/commercial/era20-manager-discount-audit-flow-proof-era20";
import { cn } from "@/lib/utils";

function hopBadgeVariant(
  state: ManagerDiscountAuditFlowHopProofState,
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

function hopBadgeLabel(state: ManagerDiscountAuditFlowHopProofState): string {
  switch (state) {
    case "real_ci":
      return "CI backed";
    case "rbac_blocked":
      return "RBAC blocked";
    default:
      return "Staging manual";
  }
}

export function PosTerminalManagerAuditFlowProofPanel(props: {
  slice: ManagerDiscountAuditFlowProofSlice;
  compact?: boolean;
}) {
  const { slice, compact = true } = props;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="pos-terminal-manager-audit-flow-proof"
    >
      <CardHeader className={cn("pb-3", compact && "py-3")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
              Manager override proof
            </CardTitle>
            {!compact ? (
              <CardDescription className="mt-1 max-w-2xl">{slice.headline}</CardDescription>
            ) : null}
          </div>
          <Badge variant="outline" className="rounded-full text-[10px]">
            Tier 2 · {slice.tier2PhaseId}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-2", compact && "pt-0")}>
        {compact ? (
          <p className="text-xs text-muted-foreground">{slice.headline}</p>
        ) : null}
        <ol className="space-y-2" aria-label="Manager discount audit hops">
          {slice.hops.map((hop) => (
            <li
              key={hop.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-2 py-2 text-xs"
              data-testid={`manager-audit-hop-${hop.id}`}
            >
              <span className="font-medium">
                {hop.order}. {hop.label}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={hopBadgeVariant(hop.proofState)} className="rounded-full text-[10px]">
                  {hopBadgeLabel(hop.proofState)}
                </Badge>
                <Button asChild variant="ghost" size="sm" className="h-7 rounded-full px-2">
                  <Link href={hop.uiHref}>
                    Open
                    <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
