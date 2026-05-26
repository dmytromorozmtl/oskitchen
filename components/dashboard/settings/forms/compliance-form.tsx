"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveComplianceSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { ComplianceSettings } from "@/lib/settings/settings-defaults";

export function ComplianceForm({ initial }: { initial: ComplianceSettings }) {
  const [state, setState] = useState<ComplianceSettings>(initial);
  const [base, setBase] = useState<ComplianceSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof ComplianceSettings>(key: K, value: ComplianceSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveComplianceSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Compliance settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jurisdiction & retention</CardTitle>
          <CardDescription>Used by data export/delete flows and consent surfacing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Jurisdiction">
            <Select value={state.jurisdiction} onValueChange={(v) => set("jurisdiction", v as ComplianceSettings["jurisdiction"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gdpr">GDPR (EU/UK)</SelectItem>
                <SelectItem value="pipeda">PIPEDA (Canada)</SelectItem>
                <SelectItem value="ccpa">CCPA (California)</SelectItem>
                <SelectItem value="other">Other / general</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Data retention (days)"><Input type="number" min={0} value={state.dataRetentionDays} onChange={(e) => set("dataRetentionDays", Number(e.target.value))} /></Field>
          <Field label="Privacy policy URL"><Input value={state.privacyPolicyUrl ?? ""} onChange={(e) => set("privacyPolicyUrl", e.target.value || null)} placeholder="https://" /></Field>
          <Field label="Terms of service URL"><Input value={state.termsOfServiceUrl ?? ""} onChange={(e) => set("termsOfServiceUrl", e.target.value || null)} placeholder="https://" /></Field>
          <Toggle id="comp-cookie" label="Cookie consent required" description="Surfaces consent banner on storefront." checked={state.cookieConsentRequired} onChange={(v) => set("cookieConsentRequired", v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disclaimers</CardTitle>
          <CardDescription>Appended to product detail pages and customer emails when configured.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Allergen disclaimer"><Textarea rows={3} value={state.allergenDisclaimer ?? ""} onChange={(e) => set("allergenDisclaimer", e.target.value || null)} /></Field>
          <Field label="Nutrition disclaimer"><Textarea rows={3} value={state.nutritionDisclaimer ?? ""} onChange={(e) => set("nutritionDisclaimer", e.target.value || null)} /></Field>
        </CardContent>
      </Card>

      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved compliance changes" />
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
