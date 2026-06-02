import Link from "next/link";

import {
  StripeTerminalProvider,
  StripeTerminalReaderPanel,
} from "@/components/pos/stripe-terminal-reader";
import { StripeTerminalHardwarePanel } from "@/components/pos/stripe-terminal-hardware-panel";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getStripeTerminalHardwareDashboard } from "@/services/payments/stripe-terminal-hardware-service";

export const metadata = {
  title: "Payment hardware — Settings",
  description: "Pair Stripe Terminal readers (M2, WisePOS E, P400) for in-person card payments.",
};

export default async function SettingsHardwarePage() {
  const { sessionUser } = await getTenantActor();
  const dashboard = await getStripeTerminalHardwareDashboard(sessionUser.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Payment hardware</h1>
          <p className="text-sm text-muted-foreground">
            Connect physical Stripe Terminal readers for tap, chip, and swipe at the counter. Card data
            stays on Stripe — OS Kitchen never stores PAN or CVV.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/pos/terminal">Open POS Terminal</Link>
        </Button>
      </div>

      <StripeTerminalHardwarePanel
        initialReaders={dashboard.readers}
        catalog={dashboard.catalog}
        stripeConfigured={dashboard.stripeConfigured}
        stripeLocationId={dashboard.stripeLocationId}
      />

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Live reader connection</h2>
        <p className="text-sm text-muted-foreground">
          Discover and connect the reader from this browser session (Bluetooth / LAN). Use after pairing
          above.
        </p>
        <StripeTerminalProvider active>
          <StripeTerminalReaderPanel />
        </StripeTerminalProvider>
      </div>
    </div>
  );
}
