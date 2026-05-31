"use client";

import * as React from "react";
import { toast } from "sonner";

import { resetDemoWorkspace } from "@/actions/demo";
import { getActionError } from "@/lib/action-result";
import { showInternalOpsDashboardUi } from "@/lib/ui/customer-facing-dashboard";
import { Button } from "@/components/ui/button";

export function DemoBanner({ userId }: { userId: string }) {
  const [dismissed, setDismissed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const internalOps = showInternalOpsDashboardUi();

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

  if (dismissed || !internalOps) return null;

  return (
    <div
      role="status"
      className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-semibold">Sample workspace</p>
        <p className="mt-1 text-xs opacity-90">
          Menus, orders, and channels use sample data for onboarding.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-amber-600/50 bg-background/80"
          disabled={busy}
          onClick={() => void reset()}
        >
          {busy ? "Clearing…" : "Clear sample data"}
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
