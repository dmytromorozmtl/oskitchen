import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoLiveProjectNextStepHero } from "@/lib/go-live/go-live-project-next-step-focus-era18";

function cardClass(tone: GoLiveProjectNextStepHero["tone"]): string {
  if (tone === "success") {
    return "border-emerald-200/80 bg-emerald-50/40 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20";
  }
  if (tone === "urgent") {
    return "border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20";
  }
  return "border-primary/25 bg-primary/[0.03] shadow-sm";
}

export function GoLiveProjectNextStepHeroCard(props: { hero: GoLiveProjectNextStepHero | null }) {
  if (!props.hero) return null;

  const { hero } = props;

  return (
    <Card className={cardClass(hero.tone)} data-testid="go-live-project-next-step-hero">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Rocket className="h-5 w-5 text-muted-foreground" aria-hidden />
          Next launch action
        </CardTitle>
        <CardDescription>
          {hero.readinessScore}% readiness — one step at a time before cutover.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
          <p className="font-medium">{hero.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{hero.detail}</p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-12 w-full rounded-2xl text-base"
          variant={hero.tone === "success" ? "default" : hero.tone === "urgent" ? "default" : "secondary"}
        >
          <Link href={hero.href} data-testid="go-live-project-next-step-cta">
            {hero.ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
