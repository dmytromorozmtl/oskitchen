"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveAutomationSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { AutomationSettings } from "@/lib/settings/settings-defaults";

export function AutomationForm({ initial }: { initial: AutomationSettings }) {
  const [state, setState] = useState<AutomationSettings>(initial);
  const [base, setBase] = useState<AutomationSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof AutomationSettings>(key: K, value: AutomationSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveAutomationSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Automation defaults saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation defaults</CardTitle>
          <CardDescription>Applied to every workflow unless overridden in Automation Studio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Toggle id="auto-on" label="Automation enabled" description="Master switch for all workspace automations." checked={state.enabled} onChange={(v) => set("enabled", v)} />
          <Toggle id="auto-pause" label="Pause on failure" description="Pause an automation after a hard failure." checked={state.pauseOnFailure} onChange={(v) => set("pauseOnFailure", v)} />
          <Field label="Default retry attempts"><Input type="number" min={0} value={state.defaultRetryAttempts} onChange={(e) => set("defaultRetryAttempts", Number(e.target.value))} /></Field>
          <Field label="Retry backoff (seconds)"><Input type="number" min={0} value={state.retryBackoffSeconds} onChange={(e) => set("retryBackoffSeconds", Number(e.target.value))} /></Field>
        </CardContent>
      </Card>
      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved automation defaults" />
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
