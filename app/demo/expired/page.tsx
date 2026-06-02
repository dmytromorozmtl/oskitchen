import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import { demoSessionHoursLabel } from "@/services/demo/demo-environment-service";

export const metadata: Metadata = marketingPageMetadata({
  title: "Demo session ended — OS Kitchen",
  description: "Your free demo session has ended. Create a real account to keep your kitchen running on OS Kitchen.",
  path: "/demo/expired",
});

export default function DemoExpiredPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Demo session ended</h1>
        <p className="text-muted-foreground">
          Free demo workspaces last {demoSessionHoursLabel()}. Upgrade to a real account to save menus,
          orders, and team access.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/signup">Upgrade to real account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/demo">Launch another demo</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
