"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { resetDemoWorkspace } from "@/actions/demo";
import { getActionError } from "@/lib/action-result";
import { formatDemoTimeRemaining, isDemoSessionExpired } from "@/lib/demo/demo-session";
import { Button } from "@/components/ui/button";

export function DemoBanner({
  expiresAtIso,
  isGuestDemo,
}: {
  expiresAtIso?: string | null;
  isGuestDemo?: boolean;
}) {
  const [dismissed, setDismissed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const expiresAt = expiresAtIso ? new Date(expiresAtIso) : null;
  const remaining = formatDemoTimeRemaining(expiresAt);
  const expired = isDemoSessionExpired(expiresAt);

  React.useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem("kitchenos_demo_banner_off") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem("kitchenos_demo_banner_off", "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  async function reset() {
    if (
      !confirm(
        "Remove sample menus, orders, and channels from this workspace?",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const r = await resetDemoWorkspace();
      if (r && "error" in r && r.error) toast.error(getActionError(r) ?? "Something went wrong");
      else {
        toast.success("Sample data cleared");
        window.location.href = "/dashboard";
      }
    } finally {
      setBusy(false);
    }
  }

  if (dismissed) return null;

  return (
    <div
      role="status"
      className="mb-4 flex flex-col gap-3 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-950 dark:border-sky-400/35 dark:bg-sky-500/15 dark:text-sky-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-semibold">
          {isGuestDemo ? "Free demo workspace" : "Sample workspace"}
          {remaining && remaining !== "expired" ? (
            <span className="ml-2 font-normal opacity-90">· {remaining} left</span>
          ) : null}
          {expired ? (
            <span className="ml-2 font-normal text-destructive">· session ended</span>
          ) : null}
        </p>
        <p className="mt-1 text-xs opacity-90">
          {isGuestDemo
            ? "Explore orders, vendors, inventory, and today’s briefing with seeded data — no signup required."
            : "Menus, orders, and channels use sample data for onboarding."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="rounded-full"
          asChild
        >
          <Link href="/signup">Upgrade to real account</Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-sky-600/50 bg-background/80"
          asChild
        >
          <Link href="/dashboard/today">Guided tour</Link>
        </Button>
        {!isGuestDemo ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-sky-600/50 bg-background/80"
            disabled={busy}
            onClick={() => void reset()}
          >
            {busy ? "Clearing…" : "Clear sample data"}
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" className="rounded-full" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
