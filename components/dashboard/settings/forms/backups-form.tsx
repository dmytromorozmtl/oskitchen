"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveBackupsSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { BackupsSettings } from "@/lib/settings/settings-defaults";

export function BackupsForm({ initial }: { initial: BackupsSettings }) {
  const [state, setState] = useState<BackupsSettings>(initial);
  const [base, setBase] = useState<BackupsSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof BackupsSettings>(key: K, value: BackupsSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveBackupsSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Backup preferences saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backups & snapshots</CardTitle>
          <CardDescription>Workspace snapshots track JSON exports of the most critical entities.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Toggle id="bk-on" label="Scheduled backups enabled" checked={state.scheduledBackupsEnabled} onChange={(v) => set("scheduledBackupsEnabled", v)} />
          <Toggle id="bk-att" label="Include attachments" checked={state.includeAttachments} onChange={(v) => set("includeAttachments", v)} />
          <Toggle id="bk-pre" label="Snapshot before imports" checked={state.snapshotBeforeImports} onChange={(v) => set("snapshotBeforeImports", v)} />
          <Field label="Retention (days)"><Input type="number" min={1} value={state.retentionDays} onChange={(e) => set("retentionDays", Number(e.target.value))} /></Field>
        </CardContent>
      </Card>
      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved backup preferences" />
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
