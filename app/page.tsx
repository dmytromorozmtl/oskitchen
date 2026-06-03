import type { Metadata } from "next";

import { HomeLanding } from "@/components/marketing/home-landing";
import { LandingIntegrationHealthMoat } from "@/components/marketing/landing-integration-health-moat";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "OS Kitchen — Restaurant Operating System with Integration Health",
  description:
    "One screen for orders, kitchen, and fulfillment. Integration Health shows PASS, SKIPPED, or FAILED for every channel — honest ops truth Toast and Square do not surface.",
  path: "/",
  keywords: [
    "restaurant operating system",
    "integration health restaurant software",
    "ghost kitchen software",
    "meal prep kitchen OS",
  ],
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <HomeLanding afterHero={<LandingIntegrationHealthMoat />} />
      <SiteFooter />
    </div>
  );
}
