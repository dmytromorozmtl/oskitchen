import { ShieldCheck } from "lucide-react";

import type { SsoLoginPilotContext } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";

export function SsoLoginPilotContextStrip(props: { context: SsoLoginPilotContext }) {
  return (
    <div
      className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm"
      data-testid="sso-login-pilot-context-strip"
    >
      <p className="flex items-center gap-2 font-medium">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        {props.context.headline}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{props.context.detail}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Workspace:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{props.context.workspaceId}</code>
      </p>
    </div>
  );
}
