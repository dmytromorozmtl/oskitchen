"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveCrmSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { CrmSettings } from "@/lib/settings/settings-defaults";

export function CrmForm({ initial }: { initial: CrmSettings }) {
  const [state, setState] = useState<CrmSettings>(initial);
  const [base, setBase] = useState<CrmSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof CrmSettings>(key: K, value: CrmSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveCrmSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("CRM settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">VIP & churn signals</CardTitle>
          <CardDescription>Threshold-based segmentation used by CRM and analytics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="VIP lifetime spend"><Input type="number" min={0} value={state.vipLifetimeSpend} onChange={(e) => set("vipLifetimeSpend", Number(e.target.value))} /></Field>
          <Field label="VIP order count"><Input type="number" min={0} value={state.vipOrderCount} onChange={(e) => set("vipOrderCount", Number(e.target.value))} /></Field>
          <Field label="Churn after (days inactive)"><Input type="number" min={1} value={state.churnInactiveDays} onChange={(e) => set("churnInactiveDays", Number(e.target.value))} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Loyalty & engagement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Loyalty mode">
            <Select value={state.loyaltyMode} onValueChange={(v) => set("loyaltyMode", v as CrmSettings["loyaltyMode"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="punch_card">Punch card</SelectItem>
                <SelectItem value="points">Points</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Points per currency unit"><Input type="number" min={0} step="0.1" value={state.loyaltyPointsPerCurrency} onChange={(e) => set("loyaltyPointsPerCurrency", Number(e.target.value))} /></Field>
          <Toggle id="crm-follow" label="Auto follow-ups" description="Send follow-up emails after fulfillment." checked={state.autoFollowUpEnabled} onChange={(v) => set("autoFollowUpEnabled", v)} />
          <Toggle id="crm-bday" label="Birthday rewards" description="Send birthday rewards to opted-in customers." checked={state.birthdayRewardEnabled} onChange={(v) => set("birthdayRewardEnabled", v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer tags</CardTitle>
          <CardDescription>Comma-separated. Used in CRM filters and automation triggers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea rows={3} value={state.customerTags.join(", ")} onChange={(e) => set("customerTags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </CardContent>
      </Card>

      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved CRM changes" />
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
