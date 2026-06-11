import Link from "next/link";
import { ArrowRight, ClipboardList, Rocket, Sparkles, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LEGACY_ONBOARDING_ENTRIES,
  ONBOARDING_HUB_PATH,
  resolveRecommendedOnboardingEntry,
} from "@/lib/design/single-onboarding-entry-policy";

const ENTRY_ICONS = {
  launch_wizard: Rocket,
  quick_start: Timer,
  go_live: Sparkles,
  implementation: ClipboardList,
} as const;

export function OnboardingHubView() {
  const recommended = resolveRecommendedOnboardingEntry();

  return (
    <div className="mx-auto max-w-5xl space-y-8" data-testid="onboarding-hub">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Setup</p>
        <h1 className="text-3xl font-semibold tracking-tight">Onboarding Hub</h1>
        <p className="max-w-2xl text-muted-foreground">
          One place to start pilot setup. Launch Wizard is the recommended spine; Quick Start,
          Go-live, and Implementation remain for specialized paths.
        </p>
      </header>

      <Card className="border-primary/25 bg-primary/[0.04]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Rocket className="h-5 w-5 text-primary" aria-hidden />
            Recommended — {recommended.title}
          </CardTitle>
          <CardDescription>{recommended.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-full">
            <Link href={recommended.href}>
              Open Launch Wizard
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {LEGACY_ONBOARDING_ENTRIES.map((entry) => {
          const Icon = ENTRY_ICONS[entry.id];
          return (
            <Card key={entry.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {entry.title}
                  {entry.badge ? (
                    <Badge variant={entry.recommended ? "default" : "secondary"} className="ml-auto">
                      {entry.badge}
                    </Badge>
                  ) : null}
                </CardTitle>
                <CardDescription>{entry.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={entry.href}>Continue</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Canonical hub route: {ONBOARDING_HUB_PATH}. CS scripts and nav should link here instead of
        parallel go-live or implementation landing pages.
      </p>
    </div>
  );
}
