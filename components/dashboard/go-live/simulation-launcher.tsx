"use client";

import { useState, useTransition } from "react";

import { runSimulationAction } from "@/actions/go-live";
import { Button } from "@/components/ui/button";

const TYPES = [
  ["LUNCH_RUSH", "Lunch rush"],
  ["MEAL_PREP_BATCH", "Meal prep batch"],
  ["CATERING_EVENT", "Catering event"],
  ["MULTI_LOCATION_DAY", "Multi-location day"],
  ["DELIVERY_SURGE", "Delivery surge"],
  ["HOLIDAY_VOLUME", "Holiday volume"],
  ["GHOST_KITCHEN_SPIKE", "Ghost kitchen spike"],
  ["CUSTOM", "Custom"],
] as const;

export function SimulationLauncher({ projectId }: { projectId: string }) {
  const [type, setType] = useState("LUNCH_RUSH");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await runSimulationAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Simulation failed.");
          }
        })
      }
    >
      <input type="hidden" name="projectId" value={projectId} />
      <select
        name="simulationType"
        value={type}
        onChange={(e) => setType(e.currentTarget.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      >
        {TYPES.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Running…" : "Run simulation"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
