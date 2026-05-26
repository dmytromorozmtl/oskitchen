"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";
import Link from "next/link";

import { resetDemoWorkspace } from "@/actions/demo";
import { Button } from "@/components/ui/button";

export function DemoBanner({ userId }: { userId: string }) {
  const [dismissed, setDismissed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

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
        "Remove all demo menus, orders, and simulated channels from this workspace?",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const r = await resetDemoWorkspace();
      if (r && "error" in r && r.error) toast.error(getActionError(r) ?? "Something went wrong");
      else {
        toast.success("Demo data cleared");
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
      className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-semibold">Demo workspace</p>
        <p className="mt-1 text-xs opacity-90">
          Sample menus, orders, and sales channels are simulated — no live API keys required.
          User id <span className="font-mono">{userId.slice(0, 8)}…</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link href="/demo">Demo hub</Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-amber-600/50 bg-background/80"
          disabled={busy}
          onClick={() => void reset()}
        >
          {busy ? "Clearing…" : "Reset demo"}
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
