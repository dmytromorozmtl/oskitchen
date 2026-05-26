"use client";

import { useState, useTransition } from "react";

import { createGoLiveProjectAction } from "@/actions/go-live";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMPLEMENTATION_INTEGRATIONS } from "@/lib/implementation/implementation-types";

const BUSINESS_TYPES = [
  ["MEAL_PREP", "Meal prep"],
  ["CATERING", "Catering"],
  ["GHOST_KITCHEN", "Ghost kitchen"],
  ["CLOUD_KITCHEN", "Cloud kitchen"],
  ["MULTI_BRAND", "Multi-brand"],
  ["BAKERY", "Bakery"],
  ["RESTAURANT", "Restaurant"],
  ["CAFE", "Café"],
  ["BAR", "Bar"],
  ["OTHER", "Other"],
] as const;

const LAUNCH_MODES = [
  ["SOFT", "Soft launch"],
  ["PILOT", "Pilot"],
  ["FULL", "Full launch"],
  ["PHASED", "Phased rollout"],
] as const;

export function CreateProjectForm({
  brands,
  locations,
}: {
  brands: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await createGoLiveProjectAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create project.");
          }
        })
      }
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Business type</span>
        <select name="businessType" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">Auto-detect from settings</option>
          {BUSINESS_TYPES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Launch mode</span>
        <select name="launchMode" defaultValue="SOFT" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {LAUNCH_MODES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Brand (optional)</span>
        <select name="brandId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Location (optional)</span>
        <select name="locationId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Target launch date</span>
        <Input type="date" name="launchDate" />
      </label>
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Notes</span>
        <textarea
          name="notes"
          className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Soft-launch window, internal customers only, etc."
        />
      </label>
      <fieldset className="text-sm md:col-span-2">
        <legend className="mb-2 block text-xs font-medium text-muted-foreground">Integrations in launch scope</legend>
        <div className="grid gap-2 md:grid-cols-2">
          {IMPLEMENTATION_INTEGRATIONS.map((integration) => (
            <label key={integration.key} className="flex items-start gap-2 rounded-md border p-3">
              <input type="checkbox" name="integrations" value={integration.key} className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">{integration.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {integration.placeholder
                    ? "Placeholder / partner-gated: does not count toward live certification."
                    : "Counts toward certification only after verified health-check and sync/webhook evidence."}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Start go-live project"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
