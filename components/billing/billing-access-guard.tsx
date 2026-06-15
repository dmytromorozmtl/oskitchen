"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { isBillingPath } from "@/lib/billing/billing-paths";

export function BillingAccessGuard({
  trialExpiredNoPayment,
  isOwner,
  children,
}: {
  trialExpiredNoPayment: boolean;
  isOwner: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!trialExpiredNoPayment || !isOwner) return;
    if (!pathname) return;
    if (isBillingPath(pathname)) return;
    router.replace("/dashboard/billing?trial=ended");
  }, [trialExpiredNoPayment, isOwner, pathname, router]);

  if (trialExpiredNoPayment && isOwner && pathname && !isBillingPath(pathname)) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
        <p>Trial ended — opening billing…</p>
      </div>
    );
  }

  return children;
}
