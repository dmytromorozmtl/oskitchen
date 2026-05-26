import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { APP_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `POS Terminal — ${APP_NAME}`,
  description:
    "Counter sales, online orders, production, packing, and delivery connected in one operating system for food teams.",
  alternates: { canonical: `${SITE_URL}/product/pos-terminal` },
};

export default function PosTerminalProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Product</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">POS Terminal</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          KitchenOS is not trying to replace every legacy restaurant POS overnight. The POS Terminal is built for food
          operators who need counter sales, cafés, bakeries, meal prep pickup desks, catering handoffs, and ghost-kitchen
          counters tied directly into the same orders, production, packing, inventory signals, CRM, and analytics as
          online channels.
        </p>
        <ul className="mt-8 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Touch-first cashier layout with barcode-friendly search.</li>
          <li>Creates real KitchenOS orders with POS sourcing — visible in Order Hub and downstream workflows.</li>
          <li>Honest payment posture: cash, external terminal, pay later, and placeholders — no fake card capture.</li>
          <li>Registers, optional shift-based cash reconciliation, receipts, and audit events.</li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button className="rounded-full" variant="premium" asChild>
            <Link href="/signup">Start trial</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/dashboard/pos">Open POS (signed in)</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
