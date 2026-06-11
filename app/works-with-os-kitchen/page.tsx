import type { Metadata } from "next";
import Link from "next/link";

import { HardwareCompatibilityCenter } from "@/components/hardware/hardware-compatibility-center";
import { PublicShell } from "@/components/marketing/public-page";
import {
  HARDWARE_COMPATIBILITY_CENTER_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_TAGLINE,
} from "@/lib/hardware/hardware-compatibility-center-policy";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Works with OS Kitchen — hardware compatibility center",
  description:
    "Run printer, cash drawer, KDS, and network diagnostics. Browser-first POS — no proprietary terminal lock-in.",
  path: HARDWARE_COMPATIBILITY_CENTER_ROUTE,
  keywords: [
    "works with OS Kitchen",
    "restaurant hardware compatibility",
    "KDS printer test",
    "browser POS hardware",
  ],
});

/** Blueprint P2-87 — public hardware compatibility center. */
export default function WorksWithOsKitchenPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <HardwareCompatibilityCenter />
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Signed in?{" "}
          <Link href="/dashboard/pos/settings/hardware" className="font-medium text-primary hover:underline">
            POS hardware settings
          </Link>
          {" · "}
          Stripe readers:{" "}
          <Link href="/dashboard/settings/hardware" className="font-medium text-primary hover:underline">
            Terminal pairing
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {HARDWARE_COMPATIBILITY_CENTER_TAGLINE} — policy hardware-compatibility-center-p2-87-v1
        </p>
      </section>
    </PublicShell>
  );
}
