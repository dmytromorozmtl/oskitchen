"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { saveBusinessHours } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import { DAY_KEYS, DAY_LABELS, type BusinessHoursSettings } from "@/lib/settings/settings-defaults";

export function BusinessHoursForm({ initial }: { initial: BusinessHoursSettings }) {
  const [state, setState] = useState<BusinessHoursSettings>(initial);
  const [base, setBase] = useState<BusinessHoursSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function setDay(day: typeof DAY_KEYS[number], patch: Partial<BusinessHoursSettings[typeof DAY_KEYS[number]]>) {
    setState((s) => ({ ...s, [day]: { ...s[day], ...patch } }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveBusinessHours(state);
      if (res.ok) {
        setBase(state);
        toast.success("Business hours saved.");
      } else {
        toast.error(`Save failed: ${res.error}`);
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business hours</CardTitle>
          <CardDescription>
            Used by storefront, fulfillment windows, and customer notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAY_KEYS.map((day) => {
            const entry = state[day];
            return (
              <div
                key={day}
                className="grid grid-cols-1 items-center gap-3 rounded-xl border border-border/70 p-3 sm:grid-cols-[100px_repeat(2,minmax(0,1fr))_auto]"
              >
                <span className="text-sm font-semibold">{DAY_LABELS[day]}</span>
                <Input
                  type="time"
                  aria-label={`${DAY_LABELS[day]} open`}
                  value={entry.open ?? ""}
                  disabled={entry.closed}
                  onChange={(e) => setDay(day, { open: e.target.value || null })}
                />
                <Input
                  type="time"
                  aria-label={`${DAY_LABELS[day]} close`}
                  value={entry.close ?? ""}
                  disabled={entry.closed}
                  onChange={(e) => setDay(day, { close: e.target.value || null })}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id={`closed-${day}`}
                    checked={entry.closed}
                    onCheckedChange={(checked) => setDay(day, { closed: checked })}
                  />
                  <Label htmlFor={`closed-${day}`} className="text-xs">Closed</Label>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <StickySaveBar
        dirty={dirty}
        saving={pending}
        onSave={onSave}
        onDiscard={() => setState(base)}
        message="Unsaved business hours"
      />
    </form>
  );
}
