import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTEGRATION_HEALTH_CHANNEL_CARDS_ANCHOR,
} from "@/lib/integrations/integration-health-channel-cards-era19-policy";
import type {
  IntegrationHealthChannelCard,
  IntegrationHealthChannelCardStateTone,
  IntegrationHealthChannelCardsModel,
} from "@/lib/integrations/integration-health-channel-cards-era19";
import type { IntegrationHealthSmokeDisplayStatus } from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import { cn } from "@/lib/utils";

function stateToneClass(tone: IntegrationHealthChannelCardStateTone): string {
  switch (tone) {
    case "healthy":
      return "border-emerald-200/70 bg-emerald-50/15 dark:border-emerald-900/40";
    case "degraded":
      return "border-amber-200/70 bg-amber-50/15 dark:border-amber-900/40";
    case "down":
      return "border-rose-200/70 bg-rose-50/15 dark:border-rose-900/40";
    default:
      return "border-border/70 bg-background/80";
  }
}

function smokeBadgeVariant(
  status: IntegrationHealthSmokeDisplayStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PASSED":
      return "default";
    case "FAILED":
      return "destructive";
    case "SKIPPED WITH REASON":
      return "secondary";
    default:
      return "outline";
  }
}

export function IntegrationHealthChannelCardsPanel(props: {
  model: IntegrationHealthChannelCardsModel;
}) {
  const { model } = props;

  return (
    <section
      id={INTEGRATION_HEALTH_CHANNEL_CARDS_ANCHOR.slice(1)}
      className="scroll-mt-24"
      data-testid="integration-health-channel-cards-panel"
    >
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Channel readiness</CardTitle>
          <CardDescription>{model.headline}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {model.cards.map((card) => (
            <ChannelReadinessCard key={card.id} card={card} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function ChannelReadinessCard(props: { card: IntegrationHealthChannelCard }) {
  const { card } = props;

  return (
    <div
      className={cn("rounded-xl border px-3 py-3", stateToneClass(card.stateTone))}
      data-testid={`integration-health-channel-card-${card.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{card.label}</p>
        <Badge variant="outline" className="rounded-full text-[10px] capitalize">
          {card.stateTone}
        </Badge>
      </div>

      <p className="mt-2 text-sm">{card.currentState}</p>

      {card.lastSyncLabel ? (
        <p className="mt-1 text-xs text-muted-foreground">Last sync {card.lastSyncLabel}</p>
      ) : null}

      {card.lastError ? (
        <p className="mt-1 line-clamp-2 text-xs text-destructive">{card.lastError}</p>
      ) : null}

      {card.smokeStatus ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={smokeBadgeVariant(card.smokeStatus)} className="rounded-full text-[10px]">
            Smoke: {card.smokeStatus}
          </Badge>
          {card.smokeDetail ? (
            <span className="text-[11px] text-muted-foreground">{card.smokeDetail}</span>
          ) : null}
        </div>
      ) : null}

      {card.missingEnvVars.length > 0 ? (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          Missing: {card.missingEnvVars.join(", ")}
        </p>
      ) : null}

      <p className="mt-2 text-[11px] text-muted-foreground">{card.supportGuidance}</p>

      {card.nextAction ? (
        <Button
          asChild
          size="sm"
          variant={card.nextAction.tone === "urgent" ? "default" : "outline"}
          className="mt-3 rounded-full"
        >
          <Link href={card.nextAction.href}>
            {card.nextAction.label}
            <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
