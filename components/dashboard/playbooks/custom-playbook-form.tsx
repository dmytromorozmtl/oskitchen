"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PlaybookTriggerType, PlaybookType } from "@prisma/client";

import { createCustomPlaybookAction } from "@/actions/playbooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TYPES: PlaybookType[] = [
  "DAILY_OPERATIONS",
  "WEEKLY_CYCLE",
  "EVENT_WORKFLOW",
  "PREORDER_WORKFLOW",
  "SERVICE_SHIFT",
  "PRODUCTION_DAY",
  "PACKING_DAY",
  "DELIVERY_DAY",
  "OPENING_CHECKLIST",
  "CLOSING_CHECKLIST",
  "INCIDENT_RESPONSE",
  "ONBOARDING",
  "GO_LIVE",
];

const TRIGGERS: PlaybookTriggerType[] = [
  "MANUAL",
  "DAILY",
  "WEEKLY",
  "EVENT_DATE",
  "MENU_CUTOFF",
  "PRODUCTION_DATE",
  "ORDER_VOLUME",
  "INCIDENT",
];

type StepInput = {
  title: string;
  description: string;
  recommendedRole: string;
  moduleKey: string;
  actionRoute: string;
  estimatedMinutes: string;
  required: boolean;
};

const blankStep = (): StepInput => ({
  title: "",
  description: "",
  recommendedRole: "",
  moduleKey: "",
  actionRoute: "",
  estimatedMinutes: "",
  required: true,
});

export function CustomPlaybookForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PlaybookType>("DAILY_OPERATIONS");
  const [trigger, setTrigger] = useState<PlaybookTriggerType>("MANUAL");
  const [businessModes, setBusinessModes] = useState("");
  const [steps, setSteps] = useState<StepInput[]>([blankStep()]);

  function updateStep(i: number, patch: Partial<StepInput>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addStep() {
    setSteps((prev) => [...prev, blankStep()]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        triggerType: trigger,
        businessModes: businessModes
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean),
        recommendedModules: [],
        defaultRoles: [],
        steps: steps
          .filter((s) => s.title.trim().length > 0)
          .map((s) => ({
            title: s.title.trim(),
            description: s.description.trim() || undefined,
            recommendedRole: s.recommendedRole.trim() || undefined,
            moduleKey: s.moduleKey.trim() || undefined,
            actionRoute: s.actionRoute.trim() || undefined,
            estimatedMinutes: s.estimatedMinutes
              ? Math.max(0, Number(s.estimatedMinutes))
              : undefined,
            required: s.required,
          })),
      };
      if (payload.steps.length === 0) {
        setErr("Add at least one step.");
        return;
      }
      const res = await createCustomPlaybookAction(payload);
      if (res.ok && res.playbookId) {
        router.push(`/dashboard/playbooks/${res.playbookId}`);
      } else {
        setErr(res.error ?? "Unable to create");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={255}
          />
        </div>
        <div className="space-y-1">
          <Label>Type</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PlaybookType)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Trigger</Label>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as PlaybookTriggerType)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {TRIGGERS.map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Business modes (comma separated)</Label>
          <Input
            placeholder="RESTAURANT,CAFE"
            value={businessModes}
            onChange={(e) => setBusinessModes(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Steps</Label>
          <Button type="button" size="sm" variant="outline" onClick={addStep}>
            Add step
          </Button>
        </div>
        {steps.map((s, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border/80 bg-muted/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step {i + 1}</span>
              {steps.length > 1 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeStep(i)}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <Input
              placeholder="Step title"
              value={s.title}
              onChange={(e) => updateStep(i, { title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={s.description}
              onChange={(e) => updateStep(i, { description: e.target.value })}
              rows={2}
            />
            <div className="grid gap-2 md:grid-cols-4">
              <Input
                placeholder="Role"
                value={s.recommendedRole}
                onChange={(e) => updateStep(i, { recommendedRole: e.target.value })}
              />
              <Input
                placeholder="Module"
                value={s.moduleKey}
                onChange={(e) => updateStep(i, { moduleKey: e.target.value })}
              />
              <Input
                placeholder="/dashboard/…"
                value={s.actionRoute}
                onChange={(e) => updateStep(i, { actionRoute: e.target.value })}
              />
              <Input
                placeholder="Minutes"
                inputMode="numeric"
                value={s.estimatedMinutes}
                onChange={(e) => updateStep(i, { estimatedMinutes: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={s.required}
                onChange={(e) => updateStep(i, { required: e.target.checked })}
              />
              Required step
            </label>
          </div>
        ))}
      </div>

      {err ? <p className="text-sm text-rose-600">{err}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create playbook"}
      </Button>
    </form>
  );
}
