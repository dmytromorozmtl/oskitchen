import Link from "next/link";
import { AlertTriangle, Cable, CheckCircle2, ShieldCheck } from "lucide-react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTEGRATION_HEALTH_CENTER_CONNECTED_MODULES,
  INTEGRATION_HEALTH_CENTER_CTA,
  INTEGRATION_HEALTH_CENTER_EXAMPLE_WORKFLOW,
  INTEGRATION_HEALTH_CENTER_INTEGRATION_NOTE,
  INTEGRATION_HEALTH_CENTER_PRODUCT_DESCRIPTION,
  INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES,
  INTEGRATION_HEALTH_CENTER_PRODUCT_HEADLINE,
} from "@/lib/integrations/integration-health-center-product-content";
import {
  INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE,
  INTEGRATION_HEALTH_CENTER_PRODUCT_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/integrations/integration-health-center-product-absolute-final-policy";

const STATUS_PILLS = [
  { label: "Healthy", detail: "Credentials OK · sync fresh · webhooks verified", tone: "default" as const },
  { label: "Watch", detail: "Declining trend or partial sync — operator action recommended", tone: "secondary" as const },
  { label: "SKIPPED", detail: "Partner creds missing or smoke not run — no fake green, not fake connected", tone: "outline" as const },
] as const;

export function IntegrationHealthCenterProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Cable className="h-5 w-5 text-primary" aria-hidden />
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Product</p>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            Integration Health Center
          </h1>
          <p className="text-lg text-muted-foreground">{INTEGRATION_HEALTH_CENTER_PRODUCT_HEADLINE}</p>
          <p className="max-w-3xl text-muted-foreground">{INTEGRATION_HEALTH_CENTER_PRODUCT_DESCRIPTION}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_PILLS.map((pill) => (
            <Badge key={pill.label} variant={pill.tone} className="rounded-full px-3 py-1 text-xs">
              {pill.label}
            </Badge>
          ))}
        </div>

        <section aria-labelledby="ihc-features-heading" className="space-y-4">
          <h2 id="ihc-features-heading" className="text-xl font-semibold">
            What operators get
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES.map((feature) => (
              <Card key={feature.id} className="border-border/80" data-testid={`ihc-product-feature-${feature.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-foreground/85">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Connected modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {INTEGRATION_HEALTH_CENTER_CONNECTED_MODULES.map((module) => (
                  <li key={module}>{module}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Example workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{INTEGRATION_HEALTH_CENTER_EXAMPLE_WORKFLOW}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-500/25 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-950 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Honesty &amp; status labels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{INTEGRATION_HEALTH_CENTER_INTEGRATION_NOTE}</p>
            <p>
              Channels still <strong>BETA</strong> or <strong>SKIPPED</strong> stay labeled — no fake green when
              partner credentials or smoke proof are missing. Health scores and playbooks are operational signals,{" "}
              <strong>not guaranteed uptime</strong>.
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              Incumbents assume marketplaces are live. OS Kitchen proves connection state before you bet rush hour
              on a webhook — including channels still BETA or SKIPPED.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full" variant="premium" asChild>
            <Link href={INTEGRATION_HEALTH_CENTER_CTA.href}>{INTEGRATION_HEALTH_CENTER_CTA.label}</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href={INTEGRATION_HEALTH_CENTER_CTA.dashboardHref}>
              {INTEGRATION_HEALTH_CENTER_CTA.dashboardLabel}
            </Link>
          </Button>
          <Button variant="ghost" className="rounded-full" asChild>
            <Link href="/product">All product areas</Link>
          </Button>
          <Button variant="ghost" className="rounded-full" asChild>
            <Link href="/integrations">Integrations index</Link>
          </Button>
        </div>

        <p className="font-mono text-[10px] text-muted-foreground">
          Policy {INTEGRATION_HEALTH_CENTER_PRODUCT_ABSOLUTE_FINAL_POLICY_ID} · Dashboard{" "}
          {INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
