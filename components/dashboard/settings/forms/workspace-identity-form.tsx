"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveWorkspaceIdentity, type WorkspaceIdentityInput } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";

export type WorkspaceIdentityFormProps = {
  initial: WorkspaceIdentityInput;
};

export function WorkspaceIdentityForm({ initial }: WorkspaceIdentityFormProps) {
  const [state, setState] = useState<WorkspaceIdentityInput>(initial);
  const [base, setBase] = useState<WorkspaceIdentityInput>(initial);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof WorkspaceIdentityInput>(key: K, value: WorkspaceIdentityInput[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveWorkspaceIdentity(state);
      if (res.ok) {
        setBase(state);
        toast.success("Workspace identity saved.");
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
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legal entity</CardTitle>
          <CardDescription>Used on invoices, tax statements, and PDFs.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name (display)">
            <Input
              value={state.businessName ?? ""}
              onChange={(e) => set("businessName", e.target.value || null)}
              placeholder="The display name customers see"
            />
          </Field>
          <Field label="Legal name">
            <Input
              value={state.legalName ?? ""}
              onChange={(e) => set("legalName", e.target.value || null)}
              placeholder="Acme Foods Ltd."
            />
          </Field>
          <Field label="Doing business as (DBA)">
            <Input
              value={state.doingBusinessAs ?? ""}
              onChange={(e) => set("doingBusinessAs", e.target.value || null)}
            />
          </Field>
          <Field label="Business number">
            <Input
              value={state.businessNumber ?? ""}
              onChange={(e) => set("businessNumber", e.target.value || null)}
              placeholder="Federal / state registration ID"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax IDs</CardTitle>
          <CardDescription>Shown on invoices and used for tax exports.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="GST">
            <Input
              value={state.taxIds.gst ?? ""}
              onChange={(e) => set("taxIds", { ...state.taxIds, gst: e.target.value || null })}
            />
          </Field>
          <Field label="QST">
            <Input
              value={state.taxIds.qst ?? ""}
              onChange={(e) => set("taxIds", { ...state.taxIds, qst: e.target.value || null })}
            />
          </Field>
          <Field label="VAT">
            <Input
              value={state.taxIds.vat ?? ""}
              onChange={(e) => set("taxIds", { ...state.taxIds, vat: e.target.value || null })}
            />
          </Field>
          <Field label="Other tax ID">
            <Input
              value={state.taxIds.other ?? ""}
              onChange={(e) => set("taxIds", { ...state.taxIds, other: e.target.value || null })}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact & locale</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Support email">
            <Input
              type="email"
              value={state.supportEmail ?? ""}
              onChange={(e) => set("supportEmail", e.target.value || null)}
            />
          </Field>
          <Field label="Support phone">
            <Input
              value={state.supportPhone ?? ""}
              onChange={(e) => set("supportPhone", e.target.value || null)}
            />
          </Field>
          <Field label="Website">
            <Input
              value={state.website ?? ""}
              onChange={(e) => set("website", e.target.value || null)}
              placeholder="https://"
            />
          </Field>
          <Field label="Operating language (code)">
            <Input
              value={state.operatingLanguage}
              onChange={(e) => set("operatingLanguage", e.target.value || "en")}
              placeholder="en"
            />
          </Field>
          <Field label="Currency (ISO)">
            <Input
              value={state.currency ?? ""}
              onChange={(e) => set("currency", e.target.value || null)}
              placeholder="USD"
            />
          </Field>
          <Field label="Timezone">
            <Input
              value={state.timezone ?? ""}
              onChange={(e) => set("timezone", e.target.value || null)}
              placeholder="America/Toronto"
            />
          </Field>
          <Field label="Country">
            <Input
              value={state.country ?? ""}
              onChange={(e) => set("country", e.target.value || null)}
            />
          </Field>
          <Field label="Default locale">
            <Input
              value={state.locale ?? ""}
              onChange={(e) => set("locale", e.target.value || null)}
              placeholder="en"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram">
            <Input
              value={state.socialLinks.instagram ?? ""}
              onChange={(e) => set("socialLinks", { ...state.socialLinks, instagram: e.target.value || null })}
            />
          </Field>
          <Field label="Facebook">
            <Input
              value={state.socialLinks.facebook ?? ""}
              onChange={(e) => set("socialLinks", { ...state.socialLinks, facebook: e.target.value || null })}
            />
          </Field>
          <Field label="TikTok">
            <Input
              value={state.socialLinks.tiktok ?? ""}
              onChange={(e) => set("socialLinks", { ...state.socialLinks, tiktok: e.target.value || null })}
            />
          </Field>
          <Field label="X">
            <Input
              value={state.socialLinks.x ?? ""}
              onChange={(e) => set("socialLinks", { ...state.socialLinks, x: e.target.value || null })}
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              value={state.socialLinks.linkedin ?? ""}
              onChange={(e) => set("socialLinks", { ...state.socialLinks, linkedin: e.target.value || null })}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice + tax notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Invoice footer">
            <Textarea
              rows={3}
              value={state.invoiceFooter ?? ""}
              onChange={(e) => set("invoiceFooter", e.target.value || null)}
              placeholder="Appears at the bottom of every invoice PDF."
            />
          </Field>
          <Field label="Default tax rules note">
            <Textarea
              rows={3}
              value={state.defaultTaxRulesNote ?? ""}
              onChange={(e) => set("defaultTaxRulesNote", e.target.value || null)}
              placeholder="Operator-only note explaining default tax application."
            />
          </Field>
        </CardContent>
      </Card>

      <StickySaveBar
        dirty={dirty}
        saving={pending}
        onSave={onSave}
        onDiscard={() => setState(base)}
        message="Unsaved workspace changes"
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
