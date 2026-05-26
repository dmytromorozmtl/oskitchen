"use client";

import { getActionError } from "@/lib/action-result";

import { useState } from "react";
import { toast } from "sonner";

import { updateProfileAction } from "@/actions/settings/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  initialName,
  initialCompany,
  initialPhone,
}: {
  initialName?: string;
  initialCompany?: string | null;
  initialPhone?: string | null;
}) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateProfileAction(fd);
    setPending(false);
    const err = getActionError(result);
    if (err) toast.error(err);
    else toast.success("Profile updated");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal information</CardTitle>
          <CardDescription>Update your name and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName">
              <Input id="fullName" name="fullName" defaultValue={initialName} required />
            </Field>
            <Field label="Company" htmlFor="companyName">
              <Input id="companyName" name="companyName" defaultValue={initialCompany ?? ""} />
            </Field>
          </div>
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialPhone ?? ""}
              placeholder="+1 (555) 000-0000"
            />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
