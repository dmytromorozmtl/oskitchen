"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { savePackingSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { PackingSettings } from "@/lib/settings/settings-defaults";

export function PackingForm({ initial }: { initial: PackingSettings }) {
  const [state, setState] = useState<PackingSettings>(initial);
  const [base, setBase] = useState<PackingSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof PackingSettings>(key: K, value: PackingSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await savePackingSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Packing settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow stages</CardTitle>
          <CardDescription>Comma-separated. Drives packing center board columns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea rows={3} value={state.stages.join(", ")} onChange={(e) => set("stages", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quality and labels</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Toggle id="pack-qc" label="QC required" description="Block hand-off until packing QC is verified." checked={state.qcRequired} onChange={(v) => set("qcRequired", v)} />
          <Toggle id="pack-block" label="Block hand-off on failed QC" description="Prevent packers from completing if QC failed." checked={state.blockHandoffOnFailedQc} onChange={(v) => set("blockHandoffOnFailedQc", v)} />
          <Toggle id="pack-scan" label="Scan to verify" description="Require barcode scan for each item." checked={state.scanToVerify} onChange={(v) => set("scanToVerify", v)} />
          <Field label="Label template">
            <Select value={state.labelTemplate} onValueChange={(v) => set("labelTemplate", v as PackingSettings["labelTemplate"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="with_allergen_warning">With allergen warning</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Printer profile">
            <Input value={state.printerProfile ?? ""} onChange={(e) => set("printerProfile", e.target.value || null)} placeholder="Optional printer key" />
          </Field>
        </CardContent>
      </Card>

      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved packing changes" />
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
