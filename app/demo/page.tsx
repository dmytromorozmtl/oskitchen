import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { DemoImportForm } from "@/components/demo/demo-import-form";
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
import {
  DEMO_VERTICAL_SLUGS,
  getDemoWorkspacePreset,
  type DemoVerticalSlug,
} from "@/lib/demo-verticals";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "KitchenOS Demo — Interactive Workspace",
  description:
    "Explore KitchenOS with a realistic workspace. Pre-populated demo scenarios for meal prep, catering, and bakeries.",
  path: "/demo",
  keywords: ["kitchen software demo", "meal prep software demo", "food ops platform demo"],
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
        <div className="space-y-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Investor / sales demo mode
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              Simulated data · No API keys required
            </Badge>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Explore KitchenOS with a realistic workspace
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            KitchenOS is the operating system for modern food operations — explore a realistic
            workspace with simulated data. Pick a vertical to tailor labels and menu language.
            Import replaces demo-eligible rows only inside{" "}
            <span className="font-medium text-foreground">your signed-in workspace</span> and turns
            on demo mode until you reset from the banner.
          </p>
          {error ? (
            <div className="mx-auto flex max-w-xl items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{decodeURIComponent(error)}</span>
            </div>
          ) : null}
        </div>

        <section className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Six golden demo scenarios</h2>
            <p className="mx-auto max-w-3xl text-sm text-muted-foreground">
              Seeded demo data is simulated inside your workspace — not live marketplace or payment
              traffic. Each card lists what the checklist covers; run seed/reset from the dashboard
              when signed in.
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
                  <p className="text-xs text-amber-900/90 dark:text-amber-100/90">
                    {scenario.safetyNotes[scenario.safetyNotes.length - 1]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user ? (
                      <Link
                        href="/dashboard/demo/scenarios"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View checklist & seed
                      </Link>
                    ) : (
                      <Link
                        href={`/login?redirect=${encodeURIComponent("/dashboard/demo/scenarios")}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Sign in for checklist & seed
                      </Link>
                    )}
                    <Link
                      href="/book-demo"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Book guided demo
                    </Link>
                    <Link href="/beta" className="text-xs font-medium text-primary hover:underline">
                      Join beta
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {user ? (
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick launch</CardTitle>
              <CardDescription>
                Loads FitFresh-style meal prep data — swap vertical on each card below for
                industry-specific wording.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoImportForm vertical="meal-prep" />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Sign in to launch a dashboard</CardTitle>
              <CardDescription>
                Demo import attaches to your account so reviewers see production, packing, and Order
                hub with realistic rows — never mixed into someone else&apos;s data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                href="/login?redirect=/demo"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Sign in
              </Link>
              <Link
                href="/signup?redirect=/demo"
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium shadow-sm transition hover:bg-muted"
              >
                Start free trial
              </Link>
            </CardContent>
          </Card>
        )}

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
          <Link
            href={`/login?redirect=${encodeURIComponent(`/demo/${slug}`)}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            Sign in to load
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
