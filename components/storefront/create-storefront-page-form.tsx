"use client";

import { useActionState } from "react";

import { createStorefrontPageFormAction, type CreatePageFormState } from "@/actions/storefront-pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const pageTypes = [
  "CUSTOM",
  "ABOUT",
  "FAQ",
  "CONTACT",
  "MENU",
  "HOME",
  "CATERING",
  "THANK_YOU",
] as const;

export function CreateStorefrontPageForm() {
  const [state, formAction, pending] = useActionState(createStorefrontPageFormAction, null as CreatePageFormState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <p className="text-sm font-medium">New page</p>
      <p className="text-xs text-muted-foreground">
        Catering and Thank-you types get preset sections and SEO defaults (thank-you is noindex).
      </p>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="new-page-title">Title</Label>
          <Input id="new-page-title" name="title" required placeholder="About us" className="rounded-xl" disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-page-slug">URL slug</Label>
          <Input
            id="new-page-slug"
            name="slug"
            placeholder="about-us (optional — derived from title)"
            className="rounded-xl font-mono text-sm"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-page-type">Type</Label>
          <select
            id="new-page-type"
            name="pageType"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            disabled={pending}
            defaultValue="CUSTOM"
          >
            {pageTypes.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" className="rounded-full" disabled={pending}>
        {pending ? "Creating…" : "Create & edit"}
      </Button>
    </form>
  );
}
