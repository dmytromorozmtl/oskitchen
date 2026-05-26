"use client";

import { getActionError, isActionSuccess } from "@/lib/action-result";

import { useState } from "react";
import { toast } from "sonner";

import { changeEmailAction } from "@/actions/settings/email";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(
      e.currentTarget,
    );
    const result = await changeEmailAction(fd);
    setPending(false);
    const err = getActionError(result);
    if (err) toast.error(err);
    else if (isActionSuccess<{ message: string }>(result)) {
      toast.success(result.data?.message ?? "Email update requested");
    } else {
      toast.success("Email update requested");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email address</CardTitle>
          <CardDescription>
            Changing your email sends a confirmation link to the new address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={currentEmail} required />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Update email"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
