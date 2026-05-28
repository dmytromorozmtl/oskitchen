import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  SupportImpersonationFlowHopProofState,
  SupportImpersonationFlowProofSlice,
} from "@/lib/commercial/era20-support-impersonation-flow-proof-era20";
import { cn } from "@/lib/utils";

function hopBadgeVariant(
  state: SupportImpersonationFlowHopProofState,
): "default" | "secondary" | "destructive" | "outline" {
  switch (state) {
    case "real_ci":
      return "default";
    case "rbac_blocked":
      return "destructive";
    case "pilot_internal_only":
      return "secondary";
    default:
      return "outline";
  }
}

function hopBadgeLabel(state: SupportImpersonationFlowHopProofState): string {
  switch (state) {
    case "real_ci":
      return "CI backed";
    case "rbac_blocked":
      return "RBAC blocked";
    case "pilot_internal_only":
      return "Internal only";
    default:
      return "Staging manual";
  }
}

export function PlatformGoLiveSupportImpersonationFlowProofPanel(props: {
  slice: SupportImpersonationFlowProofSlice;
  compact?: boolean;
}) {
  const { slice, compact = false } = props;

  return (
    <Card
      className="border-zinc-800 bg-zinc-900/60 shadow-sm"
      data-testid="platform-go-live-support-impersonation-flow-proof"
    >
      <CardHeader className={cn("pb-3", compact && "py-3")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <ShieldAlert className="h-5 w-5 text-zinc-400" aria-hidden />
              Support impersonation proof
            </CardTitle>
            {!compact ? (
              <CardDescription className="mt-1 max-w-2xl text-zinc-400">
                {slice.headline}
              </CardDescription>
            ) : null}
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-zinc-700 text-zinc-300 tabular-nums"
          >
            Tier 2 · {slice.tier2PhaseId}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pt-0")}>
        {compact ? <p className="text-sm text-zinc-400">{slice.headline}</p> : null}

        <ol className="space-y-2" aria-label="Support impersonation hops">
          {slice.hops.map((hop) => (
            <li
              key={hop.id}
              className="rounded-xl border border-zinc-800 px-3 py-3"
              data-testid={`support-impersonation-hop-${hop.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {hop.order}. {hop.label}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{hop.dataPath}</p>
                  {hop.blocker ? (
                    <p className="mt-1 text-xs text-zinc-500">{hop.blocker}</p>
                  ) : null}
                </div>
                <Badge
                  variant={hopBadgeVariant(hop.proofState)}
                  className="shrink-0 rounded-full border-zinc-700 text-[10px]"
                >
                  {hopBadgeLabel(hop.proofState)}
                </Badge>
              </div>
              <div className="mt-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-zinc-700 text-zinc-200"
                >
                  <Link href={hop.uiHref}>
                    Open step
                    <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-xs text-zinc-500">
          {slice.parentWorkflowBlocker} — {slice.parentWorkflowNextAction}
        </p>
      </CardContent>
    </Card>
  );
}
