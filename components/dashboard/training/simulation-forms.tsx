"use client";

import { useState, useTransition } from "react";

import { createSimulationAction, runSimulationAction } from "@/actions/training";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SIMULATION_TYPES = [
  ["LUNCH_RUSH", "Lunch rush"],
  ["DINNER_RUSH", "Dinner rush"],
  ["CATERING_PREP", "Catering prep"],
  ["GHOST_KITCHEN_SPIKE", "Ghost kitchen spike"],
  ["FAILED_DELIVERY", "Failed delivery"],
  ["INVENTORY_SHORTAGE", "Inventory shortage"],
  ["ALLERGY_INCIDENT", "Allergy incident"],
  ["PACKING_MISMATCH", "Packing mismatch"],
  ["ROUTE_DELAY", "Route delay"],
  ["POS_OUTAGE", "POS outage"],
  ["INTEGRATION_FAILURE", "Integration failure"],
  ["KITCHEN_BOTTLENECK", "Kitchen bottleneck"],
  ["CUSTOM", "Custom"],
] as const;

export function CreateSimulationForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await createSimulationAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create simulation.");
          }
        })
      }
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Title</span>
        <Input name="title" required />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Scenario</span>
        <select name="simulationType" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {SIMULATION_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Create simulation"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export type SimulationStepView = {
  id: string;
  title: string;
  description: string;
  expectedAction: string;
};

export function SimulationRunner({
  simulationId,
  steps,
}: {
  simulationId: string;
  steps: SimulationStepView[];
}) {
  const [responses, setResponses] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(steps.map((s) => [s.id, false])),
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function submit() {
    const formData = new FormData();
    formData.append("simulationId", simulationId);
    const payload = steps.map((s) => ({ stepId: s.id, correct: responses[s.id] }));
    formData.append("responsesJson", JSON.stringify(payload));
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        await runSimulationAction(formData);
        setResult("Run captured. See the run history below.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Run failed.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No predefined steps. Mark practice complete and save.</p>
      ) : (
        <ul className="space-y-2">
          {steps.map((s, idx) => (
            <li key={s.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{idx + 1}. {s.title}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
              <p className="mt-1 text-xs">Expected: {s.expectedAction}</p>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!responses[s.id]}
                  onChange={(e) =>
                    setResponses((prev) => ({ ...prev, [s.id]: e.currentTarget.checked }))
                  }
                />
                <span>Performed correctly</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={submit} disabled={isPending}>
          {isPending ? "Submitting…" : "Submit run"}
        </Button>
        {result ? <p className="text-xs text-emerald-700">{result}</p> : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
