"use client";

import { useTransition } from "react";

import { setActiveLocationAction } from "@/actions/locations";

const LOCATION_ALL = "all";

export type LocationSwitcherOption = { id: string; name: string };

export function LocationSwitcher({
  options,
  current,
  className,
}: {
  options: readonly LocationSwitcherOption[];
  /** Either a location id or "all". */
  current: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  if (options.length <= 1) return null;

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          await setActiveLocationAction(fd);
        });
      }}
      className={className}
    >
      <label className="sr-only" htmlFor="kos-loc-switcher">Active location</label>
      <select
        id="kos-loc-switcher"
        name="value"
        defaultValue={current}
        disabled={pending}
        onChange={(e) => {
          const form = (e.target as HTMLSelectElement).form;
          if (form) form.requestSubmit();
        }}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
      >
        <option value={LOCATION_ALL}>All locations</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </form>
  );
}
