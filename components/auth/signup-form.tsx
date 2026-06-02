"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { signUpAction } from "@/actions/auth";
import { trackSignupConversion } from "@/lib/analytics/gtag-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { A11Y_INLINE_LINK } from "@/lib/a11y/ui-classes";

export function SignupForm({
  initialReferralCode = "",
}: {
  initialReferralCode?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  const redirectTo =
    searchParams.get("redirect") ?? searchParams.get("next") ?? "";

  return (
    <form
      className="space-y-4"
      action={(fd) =>
        startTransition(async () => {
          const res = await signUpAction(fd);
          if (!res.ok) {
            toast.error(getActionError(res) ?? "Something went wrong");
            return;
          }
          trackSignupConversion();
          toast.success(res.data?.message ?? "Account created!");
          if (res.data?.redirectTo) {
            router.push(res.data.redirectTo);
            router.refresh();
          }
        })
      }
    >
      <input type="hidden" name="referralCode" value={initialReferralCode} />
      <input type="hidden" name="redirect" value={redirectTo} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required placeholder="Alex Rivera" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="companyName">Company</Label>
          <Input
            id="companyName"
            name="companyName"
            placeholder="Northstar Meal Prep"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@kitchen.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <Button
        type="submit"
        className="w-full rounded-full"
        variant="premium"
        disabled={pending}
      >
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className={A11Y_INLINE_LINK}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
