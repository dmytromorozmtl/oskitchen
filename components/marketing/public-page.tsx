import Link from "next/link";
import type { ReactNode } from "react";

import { SOLUTION_CHANNEL_FAQ } from "@/lib/marketing/solution-faq";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

export function Hero({
  eyebrow,
  title,
  description,
  cta = "Book demo",
  ctaHref = "/book-demo",
  secondary = "View pricing",
  secondaryHref = "/pricing",
}: {
  eyebrow?: string;
  title: string;
  description: string;
  cta?: string;
  ctaHref?: string;
  secondary?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-3xl space-y-5">
        {eyebrow ? <Badge variant="secondary" className="rounded-full">{eyebrow}</Badge> : null}
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        <p className="text-lg text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="premium" className="rounded-full">
            <Link href={ctaHref}>{cta}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={secondaryHref}>{secondary}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid({
  items,
}: {
  items: Array<{ title: string; description: string }>;
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title} className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </section>
  );
}

export function Faq({ items }: { items: Array<[string, string]> }) {
  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 pb-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
      {items.map(([q, a]) => (
        <Card key={q}>
          <CardHeader>
            <CardTitle className="text-base">{q}</CardTitle>
            <CardDescription>{a}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </section>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-100">
        {children}
      </div>
    </section>
  );
}

export function FormShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        <Card>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </main>
    </PublicShell>
  );
}

type IntegrationPageData = {
  title: string;
  status: string;
  description: string;
  for: string;
  credentials: string;
  limitations: string;
};

/** Content only — use under `app/integrations/layout.tsx` (shell provided by layout). */
export function IntegrationMarketingPage({ page }: { page: IntegrationPageData }) {
  return (
    <>
      <Hero
        eyebrow={`Integration · ${page.status}`}
        title={page.title}
        description={page.description}
        secondary="All integrations"
        secondaryHref="/integrations"
      />
      <FeatureGrid
        items={[
          { title: "Who it is for", description: page.for },
          {
            title: "Setup overview",
            description:
              "Connect credentials, validate webhooks or imports, map products, then run a test production day.",
          },
          { title: "Required credentials", description: page.credentials },
          {
            title: "Operational value",
            description:
              "OS Kitchen centralizes production, packing, labels, health checks, and fulfillment visibility after orders arrive.",
          },
          { title: "Limitations", description: page.limitations },
          {
            title: "Support",
            description: "Use support or contact sales for setup review and launch readiness.",
          },
        ]}
      />
      <Disclaimer>{page.limitations}</Disclaimer>
      <Faq
        items={[
          [
            "Does OS Kitchen replace my sales channel?",
            "No. OS Kitchen centralizes kitchen operations after orders arrive.",
          ],
          [
            "Can I try this in demo mode?",
            "Yes. Simulated demo data is available without claiming live marketplace approval.",
          ],
          [
            "Where should I start?",
            "Book a walkthrough or start a trial, then review the capability sheet before go-live.",
          ],
        ]}
      />
    </>
  );
}

export function SolutionMarketingPage({
  page,
}: {
  page: { title: string; description: string; pain: string[]; workflow: string };
}) {
  return (
    <PublicShell>
      <Hero eyebrow="Solution" title={page.title} description={page.description} />
      <FeatureGrid
        items={[
          ...page.pain.map((p) => ({ title: "Pain point", description: p })),
          { title: "Example workflow", description: page.workflow },
          { title: "Key features", description: "Order hub, menus, production board, packing labels, reports, customer CRM, and implementation checklist." },
          { title: "Demo screenshot placeholder", description: "Use the interactive demo to show real screens instead of inventing customer screenshots." },
        ]}
      />
      <Faq items={SOLUTION_CHANNEL_FAQ} />
    </PublicShell>
  );
}
