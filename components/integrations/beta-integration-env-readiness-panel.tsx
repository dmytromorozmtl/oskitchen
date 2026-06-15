import Link from "next/link";
import { CheckCircle2, CircleDashed, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  listBetaIntegrationEnvReadinessCards,
  summarizeBetaIntegrationEnvReadiness,
  type BetaIntegrationEnvReadinessCard,
} from "@/lib/integrations/beta-integration-env-readiness";
import { cn } from "@/lib/utils";

const STATUS_META = {
  ready: {
    label: "Env ready",
    badge: "default" as const,
    Icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  optional: {
    label: "No server env",
    badge: "secondary" as const,
    Icon: CircleDashed,
    iconClass: "text-muted-foreground",
  },
  missing: {
    label: "Missing env",
    badge: "outline" as const,
    Icon: Settings2,
    iconClass: "text-amber-600 dark:text-amber-400",
  },
} as const;

function BetaIntegrationEnvRow({ card }: { card: BetaIntegrationEnvReadinessCard }) {
  const meta = STATUS_META[card.status];
  const StatusIcon = meta.Icon;

  return (
    <div
      className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/10 p-3 sm:flex-row sm:items-start sm:justify-between"
      data-testid={`beta-env-readiness-${card.id}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusIcon className={cn("h-4 w-4 shrink-0", meta.iconClass)} aria-hidden />
          <p className="font-medium">{card.name}</p>
          <Badge variant={meta.badge} className="rounded-full text-[10px] uppercase">
            {meta.label}
          </Badge>
          {card.requiredCount > 0 ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {card.configuredCount}/{card.requiredCount} vars
            </span>
          ) : null}
        </div>
        {card.missingEnv.length > 0 ? (
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Missing: {card.missingEnv.join(", ")}
          </p>
        ) : card.status === "optional" ? (
          <p className="mt-1 text-xs text-muted-foreground">
            No platform env required — configure per workspace in dashboard.
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            All required platform env vars present for server-side calls.
          </p>
        )}
      </div>
      <Link
        href={card.setupRoute}
        className="shrink-0 text-xs font-medium text-primary hover:underline"
      >
        Setup →
      </Link>
    </div>
  );
}

/** Platform vault readiness for eighteen BETA registry integrations (G2 helper). */
export function BetaIntegrationEnvReadinessPanel() {
  const cards = listBetaIntegrationEnvReadinessCards();
  const summary = summarizeBetaIntegrationEnvReadiness(cards);

  return (
    <Card data-testid="beta-integration-env-readiness-panel">
      <CardHeader>
        <CardTitle className="text-base">BETA integration env readiness</CardTitle>
        <CardDescription>
          Platform-level check for{" "}
          <span className="font-medium text-foreground">{summary.total} BETA</span> registry
          integrations — required server env vars only. Does not replace tenant credential
          connections or live smoke PASS artifacts.
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
          <span>{summary.readyCount} env ready</span>
          <span>·</span>
          <span>{summary.optionalCount} no server env</span>
          <span>·</span>
          <span>{summary.missingCount} missing vars</span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {cards.map((card) => (
          <BetaIntegrationEnvRow key={card.id} card={card} />
        ))}
      </CardContent>
    </Card>
  );
}
