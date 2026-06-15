"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveDeveloperSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { DeveloperSettings } from "@/lib/settings/settings-defaults";

export function DeveloperForm({ initial }: { initial: DeveloperSettings }) {
  const [state, setState] = useState<DeveloperSettings>(initial);
  const [base, setBase] = useState<DeveloperSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof DeveloperSettings>(key: K, value: DeveloperSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveDeveloperSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Developer preferences saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Developer toggles</CardTitle>
          <CardDescription>Diagnostic toggles for the workspace owner.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Toggle id="dev-debug" label="Verbose debug logging" description="Enable extra logging for the workspace owner." checked={state.debugLogging} onChange={(v) => set("debugLogging", v)} />
          <Toggle id="dev-flags" label="Feature flag previews" description="Surface in-progress features behind a switch." checked={state.featureFlagPreviews} onChange={(v) => set("featureFlagPreviews", v)} />
          <Toggle id="dev-trace" label="Detailed audit traces" description="Capture extended audit context on settings changes." checked={state.audit_traces} onChange={(v) => set("audit_traces", v)} />
        </CardContent>
      </Card>
      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved developer changes" />
    </form>
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
