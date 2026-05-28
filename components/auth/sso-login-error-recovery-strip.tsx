import Link from "next/link";
import { AlertCircle } from "lucide-react";

import type { SsoLoginErrorRecovery } from "@/lib/enterprise/enterprise-sso-login-error-recovery-era18";

export function SsoLoginErrorRecoveryStrip(props: { recovery: SsoLoginErrorRecovery }) {
  return (
    <div
      className={
        props.recovery.tone === "urgent"
          ? "rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm"
          : "rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm"
      }
      data-testid="sso-login-error-recovery-strip"
      role="alert"
    >
      <p className="flex items-center gap-2 font-medium">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        {props.recovery.title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{props.recovery.detail}</p>
      {props.recovery.href && props.recovery.ctaLabel ? (
        <Link
          href={props.recovery.href}
          className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
          data-testid="sso-login-error-recovery-cta"
        >
          {props.recovery.ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
