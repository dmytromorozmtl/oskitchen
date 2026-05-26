import type { Metadata } from "next";
import Link from "next/link";

import { BookDemoFormSection } from "@/components/book-demo/book-demo-form-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Book a KitchenOS Demo — Walkthrough for Your Kitchen",
  description:
    "Schedule a founder-led walkthrough for meal prep, restaurants, catering, or ghost kitchens. We map your channels honestly — no fake integrations or automated spam.",
  path: "/book-demo",
  keywords: [
    "book restaurant POS demo",
    "meal prep software demo",
    "kitchen operations walkthrough",
  ],
});

export default function BookDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-12 px-4 py-16 sm:px-6">
        <div className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Founder-led onboarding
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Book a KitchenOS demo
          </h1>
          <p className="text-muted-foreground">
            Tell us about your kitchen model and channels. We reply with next steps — no automated
            spam, and no pretend bookings.
          </p>
          <ul className="mx-auto flex max-w-lg flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <li>14-day trial available</li>
            <li>Capability sheet before go-live</li>
            <li>US &amp; Canada operators</li>
          </ul>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/demo" className="font-medium text-primary hover:underline">
              Interactive demo
            </Link>
            <span className="text-muted-foreground" aria-hidden>
              ·
            </span>
            <Link href="/get-started" className="font-medium text-primary hover:underline">
              Choose your path
            </Link>
            <span className="text-muted-foreground" aria-hidden>
              ·
            </span>
            <Link href="/capabilities" className="font-medium text-primary hover:underline">
              Capability sheet
            </Link>
          </div>
        </div>

        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Request form</CardTitle>
          </CardHeader>
          <CardContent>
            <BookDemoFormSection />
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
