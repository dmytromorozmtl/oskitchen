"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveOperationsSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { OperationsSettings } from "@/lib/settings/settings-defaults";

export function OperationsForm({ initial }: { initial: OperationsSettings }) {
  const [state, setState] = useState<OperationsSettings>(initial);
  const [base, setBase] = useState<OperationsSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof OperationsSettings>(key: K, value: OperationsSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveOperationsSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Operations settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timing & capacity</CardTitle>
          <CardDescription>How far in advance you need orders, and how much you can handle per hour.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Prep lead time (hours)">
            <Input type="number" min={0} value={state.prepLeadHours} onChange={(e) => set("prepLeadHours", Number(e.target.value))} />
          </Field>
          <Field label="Production cutoff (minutes before fulfillment)">
            <Input type="number" min={0} value={state.productionCutoffMinutesBeforeFulfillment} onChange={(e) => set("productionCutoffMinutesBeforeFulfillment", Number(e.target.value))} />
          </Field>
          <Field label="Default fulfillment window (minutes)">
            <Input type="number" min={5} value={state.defaultFulfillmentWindowMinutes} onChange={(e) => set("defaultFulfillmentWindowMinutes", Number(e.target.value))} />
          </Field>
          <Field label="Prep capacity per hour">
            <Input type="number" min={0} value={state.prepCapacityPerHour} onChange={(e) => set("prepCapacityPerHour", Number(e.target.value))} />
          </Field>
          <Field label="Rush surcharge (%)">
            <Input type="number" min={0} value={state.rushOrderSurchargePercent} onChange={(e) => set("rushOrderSurchargePercent", Number(e.target.value))} />
          </Field>
          <Toggle
            id="op-sameday"
            label="Same-day orders enabled"
            description="Customers can request fulfillment for today."
            checked={state.sameDayOrdersEnabled}
            onChange={(v) => set("sameDayOrdersEnabled", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stations & zones</CardTitle>
          <CardDescription>Comma-separated lists. Used by production planning and packing routing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Stations">
            <Textarea
              rows={3}
              value={state.stations.join(", ")}
              onChange={(e) => set("stations", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>
          <Field label="Kitchen zones">
            <Textarea
              rows={3}
              value={state.kitchenZones.join(", ")}
              onChange={(e) => set("kitchenZones", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quality & safety</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Toggle
            id="op-qc"
            label="Require QC before packing"
            description="Block packing hand-off until QC is verified."
            checked={state.qcRequiredForPacking}
            onChange={(v) => set("qcRequiredForPacking", v)}
          />
          <Field label="Allergen protocol">
            <Select value={state.allergenProtocol} onValueChange={(v) => set("allergenProtocol", v as OperationsSettings["allergenProtocol"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard — declare known allergens</SelectItem>
                <SelectItem value="strict">Strict — block packing without verified allergen</SelectItem>
                <SelectItem value="custom">Custom — managed in operations module</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <StickySaveBar
        dirty={dirty}
        saving={pending}
        onSave={onSave}
        onDiscard={() => setState(base)}
        message="Unsaved operations changes"
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
