import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  StorefrontFulfillmentFlowHopProofState,
  StorefrontFulfillmentFlowProofSlice,
} from "@/lib/commercial/era20-storefront-fulfillment-flow-proof-era20";
import { cn } from "@/lib/utils";

function hopBadgeVariant(
  state: StorefrontFulfillmentFlowHopProofState,
): "default" | "secondary" | "destructive" | "outline" {
  switch (state) {
    case "real_ci":
      return "default";
    case "blocked_p0":
      return "destructive";
    default:
      return "outline";
  }
}

function hopBadgeLabel(state: StorefrontFulfillmentFlowHopProofState): string {
  switch (state) {
    case "real_ci":
      return "CI backed";
    case "blocked_p0":
      return "P0 blocked";
    default:
      return "Staging manual";
  }
}

export function OrderHubFulfillmentFlowProofPanel(props: {
  slice: StorefrontFulfillmentFlowProofSlice;
  compact?: boolean;
}) {
  const { slice, compact = false } = props;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="order-hub-fulfillment-flow-proof"
    >
      <CardHeader className={cn("pb-3", compact && "py-3")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="h-5 w-5 text-muted-foreground" aria-hidden />
              Fulfillment flow proof
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
        {compact ? (
          <p className="text-sm text-muted-foreground">{slice.headline}</p>
        ) : null}

        <ol className="space-y-2" aria-label="Fulfillment flow hops">
          {slice.hops.map((hop) => (
            <li
              key={hop.id}
              className="rounded-xl border border-border/60 px-3 py-3"
              data-testid={`fulfillment-flow-hop-${hop.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {hop.order}. {hop.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{hop.dataPath}</p>
                  {hop.blocker ? (
                    <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">{hop.blocker}</p>
                  ) : null}
                </div>
                <Badge variant={hopBadgeVariant(hop.proofState)} className="shrink-0 rounded-full text-[10px]">
                  {hopBadgeLabel(hop.proofState)}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
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
          Parent workflow: {slice.parentWorkflowBlocker} — {slice.parentWorkflowNextAction}
        </p>
      </CardContent>
    </Card>
  );
}
