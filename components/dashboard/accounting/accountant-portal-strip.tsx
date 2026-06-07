import Link from "next/link";
import { Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ACCOUNTANT_PORTAL_ROUTE } from "@/lib/accounting/accountant-portal-absolute-final-policy";

export function AccountantPortalStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="accountant-portal-strip"
    >
      <div className="flex items-start gap-3">
        <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Accountant portal</p>
          <p className="text-sm text-muted-foreground">
            Read-only export hub for external bookkeepers — COA, journals, reconciliation, and
            QuickBooks handoff. BETA — not a certified GL.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={ACCOUNTANT_PORTAL_ROUTE}>Open accountant portal</Link>
      </Button>
    </div>
  );
}
