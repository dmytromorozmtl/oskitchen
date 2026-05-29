import Link from "next/link";
import { AlertCircle, CheckCircle2, Circle, Info, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SustainedProductEvolutionTrackStatusKind } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { SustainedProductEvolutionUiSlice } from "@/lib/commercial/sustained-product-evolution-ui-era23";
import {
  formatSustainedProductEvolutionProgressLabel,
  SUSTAINED_PRODUCT_EVOLUTION_PLATFORM_ANCHOR,
} from "@/lib/commercial/sustained-product-evolution-ui-era23";
import { cn } from "@/lib/utils";

type SustainedProductEvolutionPanelVariant = "dashboard" | "platform" | "compact";

function statusIcon(status: SustainedProductEvolutionTrackStatusKind) {
  if (status === "healthy") return CheckCircle2;
  if (status === "overdue") return AlertCircle;
  if (status === "due_soon") return Circle;
  return Info;
}

function statusBadgeVariant(
  status: SustainedProductEvolutionTrackStatusKind,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "healthy") return "default";
  if (status === "overdue") return "destructive";
  if (status === "due_soon") return "secondary";
  return "outline";
}

export function SustainedProductEvolutionPanel(props: {
  slice: SustainedProductEvolutionUiSlice;
  variant?: SustainedProductEvolutionPanelVariant;
  title?: string;
}) {
  const {
    slice,
    variant = "dashboard",
    title = "Sustained product evolution — product-led growth",
  } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-violet-900/60 bg-violet-950/20"
    : "border-violet-200/80 bg-violet-50/15 dark:border-violet-900/50";

  return (
    <Card
      id={isPlatform ? SUSTAINED_PRODUCT_EVOLUTION_PLATFORM_ANCHOR.slice(1) : undefined}
      className={cn("scroll-mt-24 shadow-sm", cardClass)}
      data-testid="sustained-product-evolution-panel"
    >
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("flex items-center gap-2 text-lg", isPlatform && "text-violet-100")}>
            <Sparkles className="h-5 w-5 opacity-70" aria-hidden />
            {title}
          </CardTitle>
          <CardDescription className={isPlatform ? "text-violet-200/70" : undefined}>
            {formatSustainedProductEvolutionProgressLabel(slice)} — long-horizon product evolution;
            no gate chain beyond era22 improvement loop.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        {!isCompact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="rounded-full font-mono text-[10px]">
              product-led growth
            </Badge>
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {slice.productEvolutionMilestone.replaceAll("_", " ")}
            </Badge>
            {slice.pureOperationalModeEra25Active ? (
              <Badge variant="default" className="rounded-full font-mono text-[10px]">
                era25 pure ops
              </Badge>
            ) : null}
            <Badge variant="outline" className="rounded-full text-[10px]">
              decision: {slice.goDecision}
            </Badge>
            {slice.customerName ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                customer: {slice.customerName}
              </Badge>
            ) : null}
            {!slice.productEvolutionIntegrityPassed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Product evolution blocked
              </Badge>
            ) : null}
            {!slice.improvementLoopIntegrityPassed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Improvement loop integrity FAIL
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatSustainedProductEvolutionProgressLabel(slice)}</p>
        )}

        {slice.nextAttentionTrack ? (
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              isPlatform
                ? "border-amber-800/60 bg-amber-950/20 text-amber-100"
                : "border-amber-200/70 bg-amber-50/20",
            )}
          >
            <p className="font-medium">Next attention</p>
            <p className="mt-1 text-xs opacity-90">{slice.nextAttentionDetail}</p>
          </div>
        ) : null}

        <ul className="space-y-2">
          {slice.tracks.map((track) => {
            const Icon = statusIcon(track.status);
            const isAttention = track.status === "overdue" || track.status === "due_soon";
            return (
              <li
                key={track.id}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  track.status === "healthy"
                    ? "border-emerald-200/60 bg-emerald-50/10"
                    : isAttention
                      ? isPlatform
                        ? "border-amber-800/50 bg-amber-950/10"
                        : "border-amber-200/60 bg-amber-50/10"
                      : isPlatform
                        ? "border-zinc-800 bg-zinc-900/40"
                        : "border-border/70 bg-background/60",
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      track.status === "healthy"
                        ? "text-emerald-600"
                        : track.status === "overdue"
                          ? "text-rose-500"
                          : track.status === "due_soon"
                            ? "text-amber-600"
                            : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{track.label}</span>
                      <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                        {track.ownerRole}
                      </Badge>
                      <Badge
                        variant={statusBadgeVariant(track.status)}
                        className="rounded-full text-[10px] capitalize"
                      >
                        {track.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isPlatform ? "text-zinc-400" : "text-muted-foreground",
                      )}
                    >
                      {track.detail}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {!isCompact ? (
          <>
            <div
              className={cn(
                "rounded-lg border px-3 py-2 text-xs text-muted-foreground",
                isPlatform ? "border-zinc-800" : "border-border/60 bg-muted/20",
              )}
            >
              <p className={cn("font-medium", isPlatform ? "text-zinc-300" : "text-foreground")}>
                Ops commands
              </p>
              <ul className="mt-1 list-inside list-disc font-mono">
                <li>{slice.sustainedOpsExecutionCommand}</li>
                <li>{slice.postImprovementLoopOrchestratorCommand}</li>
                <li>{slice.validateCommand}</li>
                <li>{slice.syncProgressReportCommand}</li>
                <li>{slice.exportOwnershipMatrixCommand}</li>
                <li>{slice.validateImprovementLoopCommand}</li>
                <li>{slice.validateImprovementLoopIntegrityCommand}</li>
                <li>{slice.integrityValidateCommand}</li>
                <li>{slice.syncIntegrityBaselineCommand}</li>
                <li>{slice.validateTerminusCommand}</li>
                <li>npm run smoke:pilot-metrics-baseline</li>
                <li>npm run smoke:competitor-feature-gap-matrix</li>
                <li>npm run test:ci:commercial-pilot-runbook:cert</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.implementationHref}>Implementation hub</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.improvementLoopHref}>Improvement loop</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.pureOperationalModeTerminusHref}>era25 terminus</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.reportsHref}>Reports</Link>
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
