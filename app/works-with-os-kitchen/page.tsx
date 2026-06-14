import type { Metadata } from "next";
import Link from "next/link";

import { HardwareCompatibilityCenter } from "@/components/hardware/hardware-compatibility-center";
import { PublicShell } from "@/components/marketing/public-page";
import { WorksWithOsKitchenIntegrationGrid } from "@/components/marketing/works-with-os-kitchen-integration-grid";
import { HARDWARE_COMPATIBILITY_CENTER_TAGLINE } from "@/lib/hardware/hardware-compatibility-center-policy";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import { WORKS_WITH_OS_KITCHEN_HEADLINE } from "@/lib/marketing/works-with-os-kitchen-p2-57-content";
import {
  WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID,
  WORKS_WITH_OS_KITCHEN_P2_57_PUBLIC_ROUTE,
} from "@/lib/marketing/works-with-os-kitchen-p2-57-policy";

export const metadata: Metadata = marketingPageMetadata({
  title: "Works with OS Kitchen — 17 LIVE integrations",
  description:
    "DoorDash, Shopify, WooCommerce, Stripe, QuickBooks, and 12 more LIVE integrations — honest registry status, brand logos, and setup paths.",
  path: WORKS_WITH_OS_KITCHEN_P2_57_PUBLIC_ROUTE,
  keywords: [
    "works with OS Kitchen",
    "restaurant integrations",
    "Shopify restaurant POS",
    "DoorDash integration",
    "WooCommerce meal prep",
  ],
});

/** P2-57 — public integration gallery + hardware compatibility (P2-87). */
export default function WorksWithOsKitchenPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Integration registry
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {WORKS_WITH_OS_KITCHEN_HEADLINE}
          </h1>
        </div>

        <div className="mt-10">
          <WorksWithOsKitchenIntegrationGrid />
        </div>

        <div className="mt-16 rounded-2xl border border-dashed border-border bg-muted/30 p-8">
          <h2 className="text-lg font-semibold">Hardware compatibility</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browser-first POS — printers, cash drawers, KDS, and network diagnostics. No proprietary
            terminal lock-in.
          </p>
          <div className="mt-6">
            <HardwareCompatibilityCenter />
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Signed in?{" "}
          <Link href="/dashboard/integration-health" className="font-medium text-primary hover:underline">
            Integration Health Center
          </Link>
          {" · "}
          <Link href="/dashboard/pos/settings/hardware" className="font-medium text-primary hover:underline">
            POS hardware settings
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {HARDWARE_COMPATIBILITY_CENTER_TAGLINE} — policy {WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID}
        </p>
      </section>
    </PublicShell>
  );
}
