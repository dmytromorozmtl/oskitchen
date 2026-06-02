import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Clock, Package, Sparkles, Users } from "lucide-react";

import { DemoImportForm } from "@/components/demo/demo-import-form";
import { DemoLaunchButton } from "@/components/demo/demo-launch-button";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { GOLDEN_DEMO_SCENARIOS } from "@/lib/demo/golden-demo-scenarios";
import { demoSessionHoursLabel } from "@/services/demo/demo-environment-service";
import {
  DEMO_VERTICAL_SLUGS,
  getDemoWorkspacePreset,
  type DemoVerticalSlug,
} from "@/lib/demo-verticals";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "OS Kitchen Demo — See it in action",
  description:
    "Launch a free demo workspace with realistic orders, vendors, and analytics. No signup — explore OS Kitchen for two hours.",
  path: "/demo",
  keywords: ["kitchen software demo", "restaurant POS demo", "food ops platform demo"],
});

export default async function DemoHubPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/10 via-background to-background px-6 py-14 text-center shadow-sm sm:px-10">
          <div className="relative z-10 mx-auto max-w-3xl space-y-6">
            <Badge variant="secondary" className="rounded-full">
              demo.os-kitchen.com · No signup
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              See OS Kitchen in action. No signup. {demoSessionHoursLabel()} free.
            </h1>
            <p className="text-lg text-muted-foreground">
              Launch a temp workspace with 50 orders, vendors, inventory, staff, and 30 days of
              analytics — then land on your dashboard ready to explore.
            </p>
            {error ? (
              <div className="mx-auto flex max-w-xl items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{decodeURIComponent(error)}</span>
              </div>
            ) : null}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <DemoLaunchButton />
              {user ? (
                <Link
                  href="/dashboard/today"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-medium shadow-sm transition hover:bg-muted"
                >
                  Back to my dashboard
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-medium shadow-sm transition hover:bg-muted"
                >
                  Start free trial
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Package, label: "50 sample orders" },
            { icon: Users, label: "5 staff · 3 vendors" },
            { icon: Sparkles, label: "20 inventory SKUs" },
            { icon: Clock, label: "30-day analytics" },
          ].map(({ icon: Icon, label }) => (
            <Card key={label} className="border-border/80 bg-card/90">
              <CardContent className="flex items-center gap-3 p-4 text-sm font-medium">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                {label}
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Six golden demo scenarios</h2>
            <p className="mx-auto max-w-3xl text-sm text-muted-foreground">
              Signed-in operators can also seed scenario checklists inside an existing workspace.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {GOLDEN_DEMO_SCENARIOS.map((scenario) => (
              <Card
                key={scenario.scenarioId}
                className="border-border/80 bg-card/90 text-left shadow-sm"
              >
                <CardHeader>
                  <CardTitle className="text-base">{scenario.title}</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                    Vertical: {scenario.vertical}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <ul className="list-disc space-y-1 pl-4">
                    {scenario.lines.slice(0, 4).map((line) => (
                      <li key={line.title}>
                        <span className="font-medium text-foreground">{line.title}</span> —{" "}
                        {line.detail}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {user ? (
                      <Link
                        href="/dashboard/demo/scenarios"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View checklist & seed
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Launch demo above for instant access
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {user ? (
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Load demo into your account</CardTitle>
              <CardDescription>
                Already signed in? Import sample data into your workspace (separate from guest
                launch).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoImportForm vertical="meal-prep" />
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {DEMO_VERTICAL_SLUGS.map((slug) => (
            <VerticalDemoCard key={slug} slug={slug} signedIn={Boolean(user)} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function VerticalDemoCard({
  slug,
  signedIn,
}: {
  slug: DemoVerticalSlug;
  signedIn: boolean;
}) {
  const preset = getDemoWorkspacePreset(slug);
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{preset.businessName.replace(/^Demo · /, "")}</CardTitle>
        <CardDescription>{preset.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/demo/${slug}`} className="text-sm font-medium text-primary hover:underline">
          View positioning & CTAs
        </Link>
        {signedIn ? (
          <DemoImportForm vertical={slug} label="Load this demo" />
        ) : (
          <DemoLaunchButton
            vertical={slug}
            className="h-10 rounded-full px-4 text-sm font-medium"
          />
        )}
      </CardContent>
    </Card>
  );
}
