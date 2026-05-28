"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { initiateWorkspaceSsoLoginAction } from "@/actions/workspace-sso";
import { getActionError } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SsoLoginEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workspaceId, setWorkspaceId] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const redirectTo =
    searchParams.get("redirect") ?? searchParams.get("next") ?? "";

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
      <div>
        <p className="text-sm font-medium">Enterprise SSO (pilot)</p>
        <p className="text-xs text-muted-foreground">
          Available only for pilot workspaces with SSO activated by an admin.
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData();
          fd.set("workspaceId", workspaceId);
          fd.set("redirect", redirectTo);
          startTransition(async () => {
            const res = await initiateWorkspaceSsoLoginAction(fd);
            if (!res.ok) {
              toast.error(getActionError(res) ?? "SSO sign-in failed.");
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
          />
        </div>
        <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
          Sign in with SSO
        </Button>
      </form>
    </div>
  );
}
