"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveProductionSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { ProductionSettings } from "@/lib/settings/settings-defaults";

export function ProductionForm({ initial }: { initial: ProductionSettings }) {
  const [state, setState] = useState<ProductionSettings>(initial);
  const [base, setBase] = useState<ProductionSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof ProductionSettings>(key: K, value: ProductionSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveProductionSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Production settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shifts</CardTitle>
          <CardDescription>Used by station planning and shift assignments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.shifts.map((shift, idx) => (
            <div key={idx} className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_120px_120px_40px]">
              <Field label="Label">
                <Input value={shift.label} onChange={(e) => set("shifts", state.shifts.map((s, i) => i === idx ? { ...s, label: e.target.value } : s))} />
              </Field>
              <Field label="Start">
                <Input type="time" value={shift.start} onChange={(e) => set("shifts", state.shifts.map((s, i) => i === idx ? { ...s, start: e.target.value } : s))} />
              </Field>
              <Field label="End">
                <Input type="time" value={shift.end} onChange={(e) => set("shifts", state.shifts.map((s, i) => i === idx ? { ...s, end: e.target.value } : s))} />
              </Field>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove shift" onClick={() => set("shifts", state.shifts.filter((_, i) => i !== idx))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("shifts", [...state.shifts, { label: "Shift", start: "08:00", end: "16:00" }])}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add shift
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Batching & alerts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Batch sizing mode">
            <Select value={state.batchSizingMode} onValueChange={(v) => set("batchSizingMode", v as ProductionSettings["batchSizingMode"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto_group">Auto group by recipe</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="per_recipe">Per recipe size</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default batch size"><Input type="number" min={1} value={state.defaultBatchSize} onChange={(e) => set("defaultBatchSize", Number(e.target.value))} /></Field>
          <Field label="Production SLA (minutes)"><Input type="number" min={0} value={state.productionSLAMinutes} onChange={(e) => set("productionSLAMinutes", Number(e.target.value))} /></Field>
          <Toggle id="prod-print" label="Auto-print tickets" description="Print station tickets when production starts." checked={state.autoPrintTickets} onChange={(v) => set("autoPrintTickets", v)} />
          <Toggle id="prod-shortage" label="Notify kitchen on shortage" description="Alert if a recipe ingredient runs out." checked={state.notifyKitchenOnShortage} onChange={(v) => set("notifyKitchenOnShortage", v)} />
        </CardContent>
      </Card>

      <StickySaveBar
        dirty={dirty}
        saving={pending}
        onSave={onSave}
        onDiscard={() => setState(base)}
        message="Unsaved production changes"
      />
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
