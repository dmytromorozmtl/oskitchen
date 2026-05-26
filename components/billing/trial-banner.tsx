"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isBillingPath } from "@/lib/billing/billing-paths";

export function TrialBanner(props: {
  devBypass: boolean;
  trialDaysRemaining: number | null;
  trialExpired: boolean;
  isOwner: boolean;
}) {
  const pathname = usePathname() ?? "";
  if (props.devBypass) {
    return (
      <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-950 dark:text-amber-100">
        Development billing bypass active ({`DEV_BYPASS_BILLING=true`}) — limits and trial
        expiry are not enforced locally.
      </div>
    );
  }

  if (props.trialExpired && props.isOwner) {
    const onBilling = isBillingPath(pathname);
    if (onBilling) {
      return (
        <div className="border-b border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Your workspace trial has ended. Subscribe to restore full access to KitchenOS.
        </div>
      );
    }
    return null;
  }

  if (!props.isOwner && props.trialExpired) {
    return (
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
        This workspace trial ended — ask an owner to renew billing.
      </div>
    );
  }

  if (
    props.trialDaysRemaining != null &&
    props.trialDaysRemaining <= 14 &&
    props.isOwner
  ) {
    return (
      <div className="border-b border-primary/25 bg-primary/5 px-4 py-2 text-sm">
        <span className="text-muted-foreground">
          Trial:{" "}
          <strong className="text-foreground">{props.trialDaysRemaining}</strong> days
          left —{" "}
        </span>
        <Link href="/dashboard/billing" className="font-medium text-primary underline">
          upgrade or start checkout
        </Link>
        {" · "}
        <Link href="/pricing" className="text-muted-foreground underline">
          compare plans
        </Link>
      </div>
    );
  }

  return null;
}
