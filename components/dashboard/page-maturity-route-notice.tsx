"use client";

import { usePathname } from "next/navigation";

import { PilotBetaSurfaceBanner } from "@/components/dashboard/pilot-beta-surface-banner";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getPageMaturityHonesty } from "@/lib/navigation/page-maturity-honesty";
import { showInternalOpsDashboardUi } from "@/lib/ui/customer-facing-dashboard";

/**
 * In-page honesty for preview/placeholder dashboard routes (Era 4 Cycle 12).
 * Complements sidebar nav badges from nav-maturity-governance.
 */
export function PageMaturityRouteNotice() {
  const pathname = usePathname() ?? "";
  if (!showInternalOpsDashboardUi()) return null;
  const honesty = getPageMaturityHonesty(pathname);
  if (!honesty) return null;

  if (honesty.exposure === "placeholder") {
    return (
      <PlaceholderBanner
        feature={honesty.title}
        detail={honesty.detail}
      />
    );
  }

  return (
    <PilotBetaSurfaceBanner
      title={honesty.title}
      status="BETA"
      description={honesty.detail}
    />
  );
}
