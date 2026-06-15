"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveRouteSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { RouteSettings } from "@/lib/settings/settings-defaults";

export function RoutesForm({ initial }: { initial: RouteSettings }) {
  const [state, setState] = useState<RouteSettings>(initial);
  const [base, setBase] = useState<RouteSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof RouteSettings>(key: K, value: RouteSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveRouteSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Route settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Routing defaults</CardTitle>
          <CardDescription>Applied when planning new routes in the Routes module.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Optimization mode">
            <Select value={state.optimizationMode} onValueChange={(v) => set("optimizationMode", v as RouteSettings["optimizationMode"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shortest_distance">Shortest distance</SelectItem>
                <SelectItem value="shortest_time">Shortest time</SelectItem>
                <SelectItem value="balanced_load">Balanced load</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Max stops per route"><Input type="number" min={1} value={state.maxStopsPerRoute} onChange={(e) => set("maxStopsPerRoute", Number(e.target.value))} /></Field>
          <Field label="Driver start location"><Input value={state.driverStartLocationName ?? ""} onChange={(e) => set("driverStartLocationName", e.target.value || null)} placeholder="Optional — e.g. central kitchen" /></Field>
          <Field label="Buffer between stops (minutes)"><Input type="number" min={0} value={state.bufferMinutesBetweenStops} onChange={(e) => set("bufferMinutesBetweenStops", Number(e.target.value))} /></Field>
        </CardContent>
      </Card>

      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved route changes" />
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
