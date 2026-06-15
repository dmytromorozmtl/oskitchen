"use client";

import { getActionError } from "@/lib/action-result";

import { useState } from "react";
import { toast } from "sonner";

import { changePasswordAction } from "@/actions/settings/password";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);

    if (fd.get("newPassword") !== fd.get("confirmPassword")) {
      toast.error("Passwords do not match");
      setPending(false);
      return;
    }

    const result = await changePasswordAction(fd);
    setPending(false);
    const err = getActionError(result);
    if (err) toast.error(err);
    else {
      toast.success("Password changed");
      e.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>Use a strong password with at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Current password" htmlFor="currentPassword">
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" htmlFor="newPassword">
              <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
            </Field>
            <Field label="Confirm new password" htmlFor="confirmPassword">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
              />
            </Field>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Changing…" : "Change password"}
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
