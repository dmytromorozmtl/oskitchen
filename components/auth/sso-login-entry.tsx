"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { initiateWorkspaceSsoLoginAction } from "@/actions/workspace-sso";
import { SsoLoginErrorRecoveryStrip } from "@/components/auth/sso-login-error-recovery-strip";
import { SsoLoginPilotContextStrip } from "@/components/auth/sso-login-pilot-context-strip";
import { getActionError } from "@/lib/action-result";
import {
  buildSsoLoginPilotContext,
  parseSsoLoginWorkspaceId,
  shouldShowSsoLoginPilotContextStrip,
} from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import {
  resolveSsoLoginErrorRecovery,
  type SsoLoginErrorRecovery,
} from "@/lib/enterprise/enterprise-sso-login-error-recovery-era18";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SsoLoginEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workspaceId, setWorkspaceId] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [errorRecovery, setErrorRecovery] = React.useState<SsoLoginErrorRecovery | null>(null);

  const redirectTo =
    searchParams.get("redirect") ?? searchParams.get("next") ?? "";

  const prefilledWorkspaceId = React.useMemo(
    () => parseSsoLoginWorkspaceId(searchParams),
    [searchParams],
  );

  React.useEffect(() => {
    if (prefilledWorkspaceId) {
      setWorkspaceId(prefilledWorkspaceId);
    }
  }, [prefilledWorkspaceId]);

  const pilotContext = buildSsoLoginPilotContext(prefilledWorkspaceId);
  const showPilotContext = shouldShowSsoLoginPilotContextStrip(prefilledWorkspaceId);

  return (
    <div
      className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4"
      data-testid="sso-login-entry"
    >
      <div>
        <p className="text-sm font-medium">Enterprise SSO (pilot)</p>
        <p className="text-xs text-muted-foreground">
          Available only for pilot workspaces with SSO activated by an admin.
        </p>
      </div>

      {showPilotContext && pilotContext ? (
        <SsoLoginPilotContextStrip context={pilotContext} />
      ) : null}

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setErrorRecovery(null);
          const fd = new FormData();
          fd.set("workspaceId", workspaceId.trim());
          fd.set("redirect", redirectTo);
          startTransition(async () => {
            const res = await initiateWorkspaceSsoLoginAction(fd);
            if (!res.ok) {
              const message = getActionError(res) ?? "SSO sign-in failed.";
              const code = "code" in res && typeof res.code === "string" ? res.code : undefined;
              setErrorRecovery(
                resolveSsoLoginErrorRecovery({
                  code,
                  error: message,
                  workspaceId: workspaceId.trim(),
                }),
              );
              toast.error(message);
              return;
            }
            if (res.data?.redirectUrl) {
              router.push(res.data.redirectUrl);
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="sso-workspace-id">Workspace ID</Label>
          <Input
            id="sso-workspace-id"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            placeholder="Pilot workspace UUID"
            required
            disabled={pending}
            autoComplete="off"
            data-testid="sso-workspace-id-input"
          />
          {prefilledWorkspaceId ? (
            <p className="text-xs text-muted-foreground">
              Pre-filled from your pilot admin link — edit only if switching workspaces.
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="w-full"
          disabled={pending || workspaceId.trim().length === 0}
          data-testid="sso-login-submit"
        >
          Sign in with SSO
        </Button>
      </form>

      {errorRecovery ? <SsoLoginErrorRecoveryStrip recovery={errorRecovery} /> : null}
    </div>
  );
}
