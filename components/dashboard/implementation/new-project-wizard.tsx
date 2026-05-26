"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createImplementationProjectAction } from "@/actions/implementation-center";
import {
  CURRENT_SYSTEMS,
  FULFILLMENT_TYPES,
  IMPLEMENTATION_DATASETS,
  IMPLEMENTATION_INTEGRATIONS,
  IMPLEMENTATION_MODULES,
  TRAINING_TRACKS,
} from "@/lib/implementation/implementation-types";

const BUSINESS_TYPES = [
  { key: "RESTAURANT", label: "Restaurant" },
  { key: "CAFE", label: "Café" },
  { key: "BAR", label: "Bar" },
  { key: "BAKERY", label: "Bakery" },
  { key: "CATERING", label: "Catering" },
  { key: "MEAL_PREP", label: "Meal Prep" },
  { key: "GHOST_KITCHEN", label: "Ghost Kitchen" },
  { key: "MULTI_BRAND", label: "Multi-Brand" },
];

const STEPS = [
  "Business profile",
  "Business mode",
  "Current systems",
  "Migration scope",
  "Module scope",
  "Integrations",
  "Training needs",
  "Go-live",
  "Review",
] as const;

type State = {
  businessName: string;
  weeklyOrderVolume: string;
  currentPlatform: string;
  notes: string;
  businessType: string;
  systems: string[];
  fulfillment: string[];
  migrationScope: string[];
  moduleScope: string[];
  integrations: string[];
  trainingRoles: string[];
  targetGoLiveDate: string;
  assignedOwner: string;
};

const INITIAL: State = {
  businessName: "",
  weeklyOrderVolume: "",
  currentPlatform: "",
  notes: "",
  businessType: "",
  systems: [],
  fulfillment: [],
  migrationScope: [],
  moduleScope: [],
  integrations: [],
  trainingRoles: [],
  targetGoLiveDate: "",
  assignedOwner: "",
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function NewProjectWizard({ initialBusinessName }: { initialBusinessName?: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<State>({ ...INITIAL, businessName: initialBusinessName ?? "" });

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step === 0 && state.businessName.trim().length === 0) {
      setError("Business name is required.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createImplementationProjectAction({
        businessName: state.businessName,
        businessType: state.businessType || null,
        currentPlatform: state.currentPlatform || null,
        weeklyOrderVolume: state.weeklyOrderVolume,
        targetGoLiveDate: state.targetGoLiveDate || null,
        assignedOwner: state.assignedOwner || null,
        notes: state.notes || null,
        systems: state.systems,
        fulfillment: state.fulfillment,
        migrationScope: state.migrationScope,
        moduleScope: state.moduleScope,
        integrations: state.integrations,
        trainingRoles: state.trainingRoles,
      });
      if ("error" in res) {
        setError(res.error ?? "Failed to create project");
        return;
      }
      if (res.ok && res.projectId) {
        router.push(`/dashboard/implementation/${res.projectId}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {STEPS.map((label, idx) => (
          <div
            key={label}
            className={`rounded-full border px-3 py-1 ${idx === step ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
          >
            {idx + 1}. {label}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>
            Step {step + 1} of {STEPS.length}. Nothing is saved until you click &quot;Create project&quot; on the
            final step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  value={state.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weeklyOrderVolume">Weekly order volume</Label>
                <Input
                  id="weeklyOrderVolume"
                  inputMode="numeric"
                  placeholder="e.g. 120"
                  value={state.weeklyOrderVolume}
                  onChange={(e) => update("weeklyOrderVolume", e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currentPlatform">Current platform</Label>
                <Input
                  id="currentPlatform"
                  placeholder="Shopify, spreadsheets, POS, …"
                  value={state.currentPlatform}
                  onChange={(e) => update("currentPlatform", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="notes">Discovery notes</Label>
                <Textarea
                  id="notes"
                  value={state.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Constraints, launch risks, special workflows"
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {BUSINESS_TYPES.map((bt) => (
                <button
                  key={bt.key}
                  type="button"
                  onClick={() => update("businessType", bt.key)}
                  className={`rounded-lg border p-3 text-left text-sm ${
                    state.businessType === bt.key
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <CheckGrid
              label="Current systems"
              options={CURRENT_SYSTEMS.map((s) => ({ key: s.key, label: s.label }))}
              values={state.systems}
              onToggle={(v) => update("systems", toggle(state.systems, v))}
            />
          ) : null}

          {step === 3 ? (
            <CheckGrid
              label="Data we plan to migrate"
              options={IMPLEMENTATION_DATASETS.map((d) => ({ key: d.key, label: d.label }))}
              values={state.migrationScope}
              onToggle={(v) => update("migrationScope", toggle(state.migrationScope, v))}
              hint="No data is imported here — these are the datasets we'll plan for."
            />
          ) : null}

          {step === 4 ? (
            <CheckGrid
              label="Modules we will configure"
              options={IMPLEMENTATION_MODULES.map((m) => ({ key: m.key, label: m.label }))}
              values={state.moduleScope}
              onToggle={(v) => update("moduleScope", toggle(state.moduleScope, v))}
            />
          ) : null}

          {step === 5 ? (
            <CheckGrid
              label="Integrations to set up"
              options={IMPLEMENTATION_INTEGRATIONS.map((i) => ({ key: i.key, label: i.label }))}
              values={state.integrations}
              onToggle={(v) => update("integrations", toggle(state.integrations, v))}
              hint="Connections are configured in the Integrations module; this only flags scope."
            />
          ) : null}

          {step === 6 ? (
            <CheckGrid
              label="Training needs by role"
              options={TRAINING_TRACKS.map((t) => ({ key: t.role, label: t.label }))}
              values={state.trainingRoles}
              onToggle={(v) => update("trainingRoles", toggle(state.trainingRoles, v))}
            />
          ) : null}

          {step === 7 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="targetGoLiveDate">Target go-live date</Label>
                <Input
                  id="targetGoLiveDate"
                  type="date"
                  value={state.targetGoLiveDate}
                  onChange={(e) => update("targetGoLiveDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignedOwner">Implementation owner</Label>
                <Input
                  id="assignedOwner"
                  placeholder="Name or email"
                  value={state.assignedOwner}
                  onChange={(e) => update("assignedOwner", e.target.value)}
                />
              </div>
              <CheckGrid
                label="Fulfillment types"
                options={FULFILLMENT_TYPES.map((f) => ({ key: f.key, label: f.label }))}
                values={state.fulfillment}
                onToggle={(v) => update("fulfillment", toggle(state.fulfillment, v))}
              />
            </div>
          ) : null}

          {step === 8 ? (
            <div className="space-y-3 text-sm">
              <ReviewRow label="Business" value={state.businessName} />
              <ReviewRow label="Type" value={state.businessType || "(unset)"} />
              <ReviewRow label="Current platform" value={state.currentPlatform || "(unset)"} />
              <ReviewRow label="Weekly volume" value={state.weeklyOrderVolume || "(unset)"} />
              <ReviewRow label="Systems" value={state.systems.join(", ") || "(none)"} />
              <ReviewRow label="Migration scope" value={state.migrationScope.join(", ") || "(none)"} />
              <ReviewRow label="Module scope" value={state.moduleScope.join(", ") || "(none)"} />
              <ReviewRow label="Integrations" value={state.integrations.join(", ") || "(none)"} />
              <ReviewRow label="Training" value={state.trainingRoles.join(", ") || "(none)"} />
              <ReviewRow label="Go-live" value={state.targetGoLiveDate || "(unset)"} />
              <ReviewRow label="Owner" value={state.assignedOwner || "(unset)"} />
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <Button type="button" variant="outline" onClick={back} disabled={step === 0 || pending}>
              Back
            </Button>
            <div className="flex gap-2">
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={next} disabled={pending}>
                  Continue
                </Button>
              ) : (
                <Button type="button" onClick={submit} disabled={pending}>
                  {pending ? "Creating…" : "Create project"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CheckGrid({
  label,
  options,
  values,
  onToggle,
  hint,
}: {
  label: string;
  options: { key: string; label: string }[];
  values: string[];
  onToggle: (key: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onToggle(o.key)}
            className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
              values.includes(o.key)
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}
