"use client";

import { useFormStatus } from "react-dom";

import { startImpersonationFormAction } from "@/actions/platform-impersonation";
import { Button } from "@/components/ui/button";

function SubmitButton(props: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant="secondary"
      className="h-7 rounded-full px-2.5 text-xs"
      disabled={pending}
      data-testid="platform-impersonation-deep-link-submit"
    >
      {pending ? "Opening…" : props.label}
    </Button>
  );
}

export function PlatformImpersonationDeepLinkForm(props: {
  targetUserId: string;
  redirectTo: string;
  reason: string;
  label?: string;
  testId?: string;
  showMfaFields?: boolean;
}) {
  const label = props.label ?? "Open tenant go-live";
  return (
    <form
      action={startImpersonationFormAction}
      className="inline-flex flex-col items-end gap-1"
      data-testid={props.testId}
    >
      <input type="hidden" name="targetUserId" value={props.targetUserId} />
      <input type="hidden" name="reason" value={props.reason} />
      <input type="hidden" name="redirectTo" value={props.redirectTo} />
      {props.showMfaFields !== false ? (
        <>
          <input
            name="totpCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="TOTP"
            maxLength={8}
            className="h-7 w-20 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100"
            aria-label="Impersonation TOTP code"
          />
          <input
            name="stepUpToken"
            type="password"
            placeholder="Step-up"
            className="h-7 w-24 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100"
            aria-label="Impersonation step-up token"
          />
        </>
      ) : null}
      <SubmitButton label={label} />
    </form>
  );
}
