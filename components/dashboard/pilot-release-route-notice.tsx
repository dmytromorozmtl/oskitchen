"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isPilotHiddenHref } from "@/lib/navigation/release-navigation";
import type { NavReleaseProfile } from "@/services/modules/module-release-service";

export function PilotReleaseRouteNotice({
  navReleaseProfile,
}: {
  navReleaseProfile: NavReleaseProfile;
}) {
  const pathname = usePathname() ?? "";
  if (navReleaseProfile !== "pilot") return null;
  if (!isPilotHiddenHref(pathname)) return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm"
    >
      <p className="font-medium">This feature is not available on your current plan.</p>
      <p className="mt-1 text-muted-foreground">
        Paid pilot operators use a reduced surface area. Contact your OS Kitchen representative to
        enable this module, or return to{" "}
        <Link href="/dashboard/today" className="underline underline-offset-2">
          Today
        </Link>
        .
      </p>
    </div>
  );
}
