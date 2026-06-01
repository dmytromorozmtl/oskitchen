import type { Metadata } from "next";
import Link from "next/link";

import { VendorCabinetSubnav } from "@/components/marketplace/vendor-cabinet-subnav";
import { VendorCabinetPwaRegister } from "@/components/marketplace/vendor-cabinet-pwa-register";

export const metadata: Metadata = {
  manifest: "/marketplace-vendor-manifest.webmanifest",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    title: "KitchenOS Vendor",
  },
};

export default function VendorCabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <VendorCabinetPwaRegister />
      <header className="border-b border-border/80 bg-card/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                OS Kitchen Marketplace
              </p>
              <p className="text-sm font-semibold">Vendor cabinet</p>
            </div>
            <nav className="flex flex-wrap gap-3 text-sm">
              <Link href="/dashboard/marketplace" className="text-muted-foreground hover:text-foreground">
                Buyer hub
              </Link>
              <Link href="/vendor/register/status" className="text-muted-foreground hover:text-foreground">
                Verification
              </Link>
            </nav>
          </div>
          <VendorCabinetSubnav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
