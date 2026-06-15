"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import { resetPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotForm() {
  const [pending, startTransition] = React.useTransition();

  return (
    <form
      className="space-y-4"
      action={(fd) =>
        startTransition(async () => {
          const res = await resetPasswordAction(fd);
          const _err = getActionError(res); if (_err) toast.error(_err);
          if (res?.success) toast.success(res.success);
        })
      }
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@kitchen.com"
        />
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
