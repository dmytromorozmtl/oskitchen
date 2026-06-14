import { KeyRound, Rocket, Store } from "lucide-react";

import { DemoLaunchButton } from "@/components/demo/demo-launch-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_P1_28_GUEST_CREDENTIALS,
  DEMO_P1_28_HEADLINE,
  DEMO_P1_28_LIVE_INTEGRATION_PROOFS,
  DEMO_P1_28_STAGING_LIVE_SMOKE,
  DEMO_P1_28_SUBLINE,
} from "@/lib/marketing/demo-interactive-sandbox-p1-28-content";
import { DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_TEST_ID } from "@/lib/marketing/demo-interactive-sandbox-p1-28-policy";

/** P1-28 — test credentials + LIVE integration smoke references on /demo. */
export function DemoTestCredentialsPanel() {
  return (
    <section
      className="space-y-6"
      aria-labelledby="demo-test-credentials-heading"
      data-testid={DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_TEST_ID}
    >
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <h2 id="demo-test-credentials-heading" className="text-2xl font-semibold tracking-tight">
          {DEMO_P1_28_HEADLINE}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {DEMO_P1_28_SUBLINE}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">{DEMO_P1_28_GUEST_CREDENTIALS.title}</CardTitle>
            </div>
            <CardDescription>{DEMO_P1_28_GUEST_CREDENTIALS.launchMethod}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-xs">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <dt className="text-muted-foreground">Email pattern</dt>
                <dd className="font-medium text-foreground">
                  {DEMO_P1_28_GUEST_CREDENTIALS.emailPattern}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <dt className="text-muted-foreground">Session</dt>
                <dd className="font-medium text-foreground">
                  {DEMO_P1_28_GUEST_CREDENTIALS.sessionHours} hours
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Seeded data</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {DEMO_P1_28_GUEST_CREDENTIALS.seededData}
                </dd>
              </div>
            </dl>
            <DemoLaunchButton className="h-11 w-full rounded-full text-sm font-semibold sm:w-auto" />
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">{DEMO_P1_28_STAGING_LIVE_SMOKE.title}</CardTitle>
            </div>
            <CardDescription>{DEMO_P1_28_STAGING_LIVE_SMOKE.note}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Configure <code className="rounded bg-muted px-1.5 py-0.5">{DEMO_P1_28_STAGING_LIVE_SMOKE.envFile}</code>{" "}
              on staging — never commit secrets.
            </p>
            <ul className="grid gap-1 font-mono text-xs text-muted-foreground sm:grid-cols-2">
              {DEMO_P1_28_STAGING_LIVE_SMOKE.envKeys.map((key) => (
                <li key={key} className="rounded bg-muted/40 px-2 py-1">
                  {key}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden />
            <CardTitle className="text-base">LIVE integrations in sandbox</CardTitle>
          </div>
          <CardDescription>
            These channels show LIVE proof in engineering smokes or are native OS Kitchen surfaces.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {DEMO_P1_28_LIVE_INTEGRATION_PROOFS.map((proof) => (
              <li key={proof.channelId}>
                <Badge
                  variant="secondary"
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                  data-testid={`demo-live-integration-${proof.channelId}`}
                >
                  {proof.label}
                  {proof.smokeScript ? ` · ${proof.smokeScript}` : " · native"}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
