"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveDeliverySettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { DeliverySettings } from "@/lib/settings/settings-defaults";

export function DeliveryForm({ initial }: { initial: DeliverySettings }) {
  const [state, setState] = useState<DeliverySettings>(initial);
  const [base, setBase] = useState<DeliverySettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof DeliverySettings>(key: K, value: DeliverySettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveDeliverySettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Delivery settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery program</CardTitle>
          <CardDescription>Enable to offer delivery as a fulfillment option in the storefront and order creation flow.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Toggle id="del-on" label="Delivery enabled" description="Master switch for delivery." checked={state.enabled} onChange={(v) => set("enabled", v)} />
          <Toggle id="del-sms" label="SMS customer on dispatch" description="Send dispatch SMS when configured." checked={state.smsCustomerOnDispatch} onChange={(v) => set("smsCustomerOnDispatch", v)} />
          <Field label="Delivery radius (km)"><Input type="number" min={0} value={state.deliveryRadiusKm} onChange={(e) => set("deliveryRadiusKm", Number(e.target.value))} /></Field>
          <Field label="Dispatch window (minutes)"><Input type="number" min={0} value={state.dispatchWindowMinutes} onChange={(e) => set("dispatchWindowMinutes", Number(e.target.value))} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fees</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Base fee"><Input type="number" min={0} step="0.01" value={state.baseFee} onChange={(e) => set("baseFee", Number(e.target.value))} /></Field>
          <Field label="Per-km fee"><Input type="number" min={0} step="0.01" value={state.perKmFee} onChange={(e) => set("perKmFee", Number(e.target.value))} /></Field>
          <Field label="Free delivery threshold"><Input type="number" min={0} step="0.01" value={state.freeDeliveryThreshold} onChange={(e) => set("freeDeliveryThreshold", Number(e.target.value))} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dispatch & couriers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Driver assignment mode">
            <Select value={state.driverAssignmentMode} onValueChange={(v) => set("driverAssignmentMode", v as DeliverySettings["driverAssignmentMode"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="auto_nearest">Auto — nearest driver</SelectItem>
                <SelectItem value="round_robin">Round robin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="External courier preference">
            <Select value={state.externalCourierPreference} onValueChange={(v) => set("externalCourierPreference", v as DeliverySettings["externalCourierPreference"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="uber_direct">Uber Direct</SelectItem>
                <SelectItem value="doordash_drive">DoorDash Drive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved delivery changes" />
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
