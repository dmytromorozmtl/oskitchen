import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingButton } from "@/components/marketing/button";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { CASE_STUDIES, caseStudyBySlug } from "@/lib/marketing/case-studies";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CASE_STUDIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) return { title: "Case studies | KitchenOS" };
  return marketingPageMetadata({
    title: study.title,
    description: study.challenge,
    path: `/case-studies/${study.slug}`,
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {study.status === "pilot" ? (
          <p className="mb-4 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            Coming Q3 2026 — metrics are targets pending pilot sign-off
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {study.operatorType} · {study.location}
        </p>
        <p className="mt-6 text-6xl font-semibold tracking-tight">{study.heroMetric}</p>
        <p className="text-lg text-muted-foreground">{study.heroLabel}</p>
        <h1 className="mt-8 text-3xl font-semibold">{study.title}</h1>
        <section className="mt-10 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Challenge</h2>
            <p className="mt-2 text-muted-foreground">{study.challenge}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Solution</h2>
            <p className="mt-2 text-muted-foreground">{study.solution}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Results</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {study.results.map((r) => (
                <li key={r.label} className="rounded-lg border p-4">
                  <p className="text-2xl font-semibold">{r.value}</p>
                  <p className="text-sm text-muted-foreground">{r.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <blockquote className="mt-10 border-l-4 border-primary pl-4 italic text-muted-foreground">
          &ldquo;{study.quote}&rdquo;
          <footer className="mt-2 text-sm not-italic">— {study.quoteAuthor}</footer>
        </blockquote>
        <div className="mt-10 flex flex-wrap gap-3">
          <MarketingButton href="/book-demo">Book a demo</MarketingButton>
          <MarketingButton href="/signup" variant="secondary">
            Start free trial
          </MarketingButton>
        </div>
        <p className="mt-8 text-sm">
          <Link href="/compare" className="underline underline-offset-4">
            Compare KitchenOS
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
