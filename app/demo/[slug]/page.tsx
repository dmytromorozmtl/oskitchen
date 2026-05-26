import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DemoImportForm } from "@/components/demo/demo-import-form";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { demoVerticalMetadata, isDemoVerticalSlug } from "@/lib/marketing/demo-seo";
import {
  DEMO_VERTICAL_SLUGS,
  getDemoWorkspacePreset,
  type DemoVerticalSlug,
} from "@/lib/demo-verticals";

export function generateStaticParams() {
  return DEMO_VERTICAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isDemoVerticalSlug(slug)) {
    return { title: "Demo workspace" };
  }
  return demoVerticalMetadata(slug);
}

export default async function DemoVerticalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  if (!DEMO_VERTICAL_SLUGS.includes(raw as DemoVerticalSlug)) notFound();
  const slug = raw as DemoVerticalSlug;
  const preset = getDemoWorkspacePreset(slug);
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              Demo workspace
            </Badge>
            <Badge variant="outline" className="rounded-full">
              Simulated channels
            </Badge>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            {preset.businessName.replace(/^Demo · /, "")}
          </h1>
          <p className="text-lg text-muted-foreground">{preset.tagline}</p>
        </div>

        <Card className="border-border/80 bg-muted/10 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">What loads into your account</CardTitle>
            <CardDescription>
              Two weekly menus, fifteen menu items, twenty-five orders, twelve guests, four
              order channels (manual + simulated WooCommerce, Shopify, Uber Eats), sample
              production checkpoints, webhook rows, and one unmatched external SKU for
              matching practice.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {user ? (
            <DemoImportForm vertical={slug} />
          ) : (
            <>
              <Button asChild className="rounded-full" variant="premium">
                <Link href={`/login?redirect=${encodeURIComponent(`/demo/${slug}`)}`}>
                  Sign in to launch
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={`/signup?redirect=${encodeURIComponent(`/demo/${slug}`)}`}>
                  Start free trial
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
            <Link href="/demo">All demos</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Need something bespoke?{" "}
          <Link href="/book-demo" className="font-medium text-primary hover:underline">
            Book a walkthrough
          </Link>{" "}
          — we&apos;ll map your real channels without touching this simulated bundle.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
