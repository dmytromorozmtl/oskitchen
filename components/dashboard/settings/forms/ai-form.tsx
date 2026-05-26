"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveAiSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { AiSettings } from "@/lib/settings/settings-defaults";

export function AiForm({ initial }: { initial: AiSettings }) {
  const [state, setState] = useState<AiSettings>(initial);
  const [base, setBase] = useState<AiSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof AiSettings>(key: K, value: AiSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveAiSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("AI settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI behavior</CardTitle>
          <CardDescription>Provider credentials live in environment secrets. These toggles control workspace-wide AI surfaces.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Toggle id="ai-assistant" label="AI assistant enabled" checked={state.assistantEnabled} onChange={(v) => set("assistantEnabled", v)} />
          <Toggle id="ai-summaries" label="AI summaries enabled" checked={state.summariesEnabled} onChange={(v) => set("summariesEnabled", v)} />
          <Toggle id="ai-forecast" label="AI forecasting enabled" checked={state.forecastingEnabled} onChange={(v) => set("forecastingEnabled", v)} />
          <Field label="Token cap (per day)"><Input type="number" min={0} value={state.tokenCapPerDay} onChange={(e) => set("tokenCapPerDay", Number(e.target.value))} /></Field>
          <Field label="Daily cost alert (cents)"><Input type="number" min={0} value={state.costAlertCents} onChange={(e) => set("costAlertCents", Number(e.target.value))} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prompt presets</CardTitle>
          <CardDescription>Reusable prompts surfaced inside the AI assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.promptPresets.map((p, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_3fr_40px]">
              <Input value={p.label} onChange={(e) => set("promptPresets", state.promptPresets.map((q, i) => i === idx ? { ...q, label: e.target.value } : q))} placeholder="Label" />
              <Textarea rows={2} value={p.prompt} onChange={(e) => set("promptPresets", state.promptPresets.map((q, i) => i === idx ? { ...q, prompt: e.target.value } : q))} placeholder="Prompt text" />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove preset" onClick={() => set("promptPresets", state.promptPresets.filter((_, i) => i !== idx))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("promptPresets", [...state.promptPresets, { label: "New preset", prompt: "" }])}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add preset
          </Button>
        </CardContent>
      </Card>

      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved AI settings" />
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ id, label, description, checked, onChange }: { id: string; label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
