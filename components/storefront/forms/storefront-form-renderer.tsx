"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import { submitPublicStorefrontForm } from "@/actions/storefront-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseStorefrontFormFieldsJson } from "@/lib/storefront/forms";
import type { StorefrontForm } from "@prisma/client";

export function StorefrontFormRenderer({
  form,
  storeSlug,
}: {
  form: Pick<StorefrontForm, "id" | "title" | "fieldsJson" | "honeypotName">;
  storeSlug: string;
}) {
  const parsed = parseStorefrontFormFieldsJson(form.fieldsJson);
  const [pending, setPending] = React.useState(false);
  const hp = form.honeypotName ?? "companyUrl";

  if (parsed.error || !parsed.fields.length) {
    return <p className="text-sm text-muted-foreground">This form is not available.</p>;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await submitPublicStorefrontForm(fd);
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(getActionError(res) ?? "Something went wrong");
      return;
    }
    toast.success("Thanks — your message was sent.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form
      onSubmit={(ev) => void onSubmit(ev)}
      encType="multipart/form-data"
      className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <input type="hidden" name="formId" value={form.id} />
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="hpName" value={hp} />
      <input type="text" name={hp} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <p className="font-medium">{form.title}</p>
      {parsed.fields.map((f) => {
        if (f.type === "hidden") {
          return <input key={f.id} type="hidden" name={f.id} value={f.defaultValue ?? ""} />;
        }
        if (f.type === "textarea") {
          return (
            <div key={f.id} className="space-y-2">
              <Label htmlFor={f.id}>{f.label}</Label>
              <Textarea id={f.id} name={f.id} required={f.required} placeholder={f.placeholder} className="rounded-xl" rows={4} />
            </div>
          );
        }
        if (f.type === "select") {
          return (
            <div key={f.id} className="space-y-2">
              <Label htmlFor={f.id}>{f.label}</Label>
              <select id={f.id} name={f.id} required={f.required} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="">Choose…</option>
                {(f.options ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        if (f.type === "file") {
          return (
            <div key={f.id} className="space-y-2">
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input
                id={f.id}
                name={f.id}
                type="file"
                required={f.required}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Max 5MB — JPEG, PNG, WebP, or PDF.</p>
            </div>
          );
        }
        if (f.type === "checkbox" || f.type === "consent_checkbox") {
          return (
            <label key={f.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name={f.id}
                value="true"
                required={f.type === "consent_checkbox" ? true : !!f.required}
                className="mt-1 h-4 w-4 rounded border-input"
              />
              <span>{f.label}</span>
            </label>
          );
        }
        const inputType =
          f.type === "email" ? "email" : f.type === "phone" ? "tel" : f.type === "date" ? "date" : "text";
        return (
          <div key={f.id} className="space-y-2">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input id={f.id} name={f.id} type={inputType} required={f.required} placeholder={f.placeholder} className="rounded-xl" />
          </div>
        );
      })}
      <Button type="submit" className="rounded-full" disabled={pending}>
        {pending ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}
