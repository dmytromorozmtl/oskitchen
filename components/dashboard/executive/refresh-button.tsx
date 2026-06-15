"use client";

import { useTransition } from "react";

import { refreshExecutiveSnapshotAction } from "@/actions/executive";

export function RefreshSnapshotButton({
  filtersQuery,
  periodType = "DAILY",
}: {
  filtersQuery: string;
  periodType?: "DAILY" | "WEEKLY" | "MONTHLY";
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await refreshExecutiveSnapshotAction({ filtersQuery, periodType });
        });
      }}
      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
    >
      {pending ? "Refreshing…" : "Refresh snapshot"}
    </button>
  );
}
