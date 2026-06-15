import type { Metadata } from "next";
import Link from "next/link";

import { BetaLeadForm } from "@/components/beta/beta-lead-form";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Early access · OS Kitchen beta",
  description: `Apply for early access to ${APP_NAME} — kitchen operations for meal prep, catering, and ghost kitchens.`,
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export default async function BetaPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const initialUtm = {
    source: firstParam(sp.utm_source),
    medium: firstParam(sp.utm_medium),
    campaign: firstParam(sp.utm_campaign),
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" />
          <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:py-28">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3">
                Limited beta
              </Badge>
              <Badge variant="outline" className="rounded-full border-primary/30 px-3 text-primary">
                Founder-led onboarding
              </Badge>
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              The operating system for high-trust food operations
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              OS Kitchen unifies preorders, channel imports, production, packing, and routes — built for teams
              where mistakes are expensive and every service window counts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/book-demo" className="text-primary underline-offset-4 hover:underline">
                Book a live demo
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/demo" className="text-primary underline-offset-4 hover:underline">
                Interactive product tour
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                Start free trial
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:py-20">
          <div>
            <h2 className="text-lg font-semibold">Why operators apply</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>One truthful queue for the kitchen — not five tabs and a spreadsheet.</li>
              <li>Channel-aware cutoffs, nutrition-aware meal prep, and packing you can audit.</li>
              <li>Implementation support from founders who have shipped at scale.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Designed for</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Weekly meal prep drops, catering programs, ghost kitchens with dense delivery mixes, and bakeries
              running preorder windows.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">What beta unlocks</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Roadmap influence & design partner sessions</li>
              <li>Migration guidance from spreadsheets</li>
              <li>Priority integrations where data contracts allow</li>
            </ul>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/15 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-xl font-semibold">Launch narrative</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Proof, not promises",
                  body: "We bias toward operators who can share volume, pain, and channel reality — it keeps the beta sharp.",
                },
                {
                  title: "Security-first applicant data",
                  body: "Submissions stay in your OS Kitchen database, gated to founder and GTM roles — never exposed to tenant staff.",
                },
                {
                  title: "Premium onboarding path",
                  body: "Expect a structured rollout: connectivity → menu truth → production → packing, with clear exit criteria each week.",
                },
              ].map((c) => (
                <Card key={c.title} className="border-border/80 bg-card/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{c.body}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-20">
          <Card className="border-border/80 bg-card/95 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">Application</CardTitle>
              <p className="text-sm text-muted-foreground">
                Progressive form — autosaves locally every few minutes (this device only).
              </p>
            </CardHeader>
            <CardContent>
              <BetaLeadForm initialUtm={initialUtm} />
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-4xl space-y-10 px-4 pb-20 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold">FAQ</h2>
            <div className="mt-6 space-y-5 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Is my data sold?</p>
                <p className="mt-1">
                  No. Application data is used only to evaluate beta fit and contact you about OS Kitchen.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Do you integrate with my channel?</p>
                <p className="mt-1">
                  We ship WooCommerce, Shopify, and Uber paths today — others are prioritized from structured beta
                  feedback inside the founder CRM.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">How fast is onboarding?</p>
                <p className="mt-1">
                  Most teams connect a channel and publish a first menu inside a focused onboarding block — book a
                  slot after you apply.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-6 text-sm">
            <p className="font-medium text-foreground">Founder message</p>
            <p className="mt-2 text-muted-foreground">
              We&apos;re deliberately keeping the beta small so support stays sharp. If we&apos;re not the right fit
              today, we&apos;ll tell you quickly — no ghosting.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/book-demo"
              className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Prefer a live walkthrough? Book a demo
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
