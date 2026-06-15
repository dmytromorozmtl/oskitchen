"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const ROLE_OPTIONS = [
  ["", "All roles"],
  ["OWNER", "Owner"], ["MANAGER", "Manager"], ["KITCHEN_LEAD", "Kitchen lead"],
  ["PREP_COOK", "Prep cook"], ["LINE_COOK", "Line cook"], ["PACKER", "Packer"],
  ["DRIVER", "Driver"], ["CUSTOMER_SERVICE", "Customer service"],
  ["CATERING_COORDINATOR", "Catering coordinator"], ["PURCHASING", "Purchasing"],
  ["INVENTORY", "Inventory"], ["ACCOUNTING", "Accounting"],
  ["MARKETING", "Marketing"], ["VIEWER", "Viewer"], ["CUSTOM", "Custom"],
] as const;

const STATUS_OPTIONS = [
  ["", "All statuses"],
  ["ACTIVE", "Active"], ["INVITED", "Invited"], ["TRAINING", "Training"],
  ["PAUSED", "Paused"], ["INACTIVE", "Inactive"], ["ARCHIVED", "Archived"],
] as const;

export function RosterFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const url = new URLSearchParams(params.toString());
    if (value) url.set(key, value);
    else url.delete(key);
    startTransition(() => router.replace(`?${url.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label className="flex items-center gap-1 text-xs text-muted-foreground">
        Role
        <select
          className="rounded-md border bg-background px-2 py-1"
          value={params.get("role") ?? ""}
          onChange={(e) => setParam("role", e.currentTarget.value)}
          disabled={isPending}
        >
          {ROLE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-1 text-xs text-muted-foreground">
        Status
        <select
          className="rounded-md border bg-background px-2 py-1"
          value={params.get("status") ?? ""}
          onChange={(e) => setParam("status", e.currentTarget.value)}
          disabled={isPending}
        >
          {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-1 text-xs text-muted-foreground">
        Search
        <input
          type="search"
          className="rounded-md border bg-background px-2 py-1"
          placeholder="Name or email"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => setParam("q", e.currentTarget.value)}
          disabled={isPending}
        />
      </label>
    </div>
  );
}
