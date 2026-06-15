"use client";

import { getActionError } from "@/lib/action-result";

import { useState } from "react";

import {
  cancelStorefrontTeamInviteFormAction,
  inviteStorefrontTeamMemberAction,
  removeStorefrontTeamMemberFormAction,
} from "@/actions/storefront-team-invite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InviteMagicLinkCopy } from "@/components/dashboard/storefront/invite-magic-link-copy";
import { SITE_URL } from "@/lib/constants";
import type { StorefrontTeamInviteRow } from "@/services/storefront/storefront-team-invite-service";

type MemberRow = {
  id: string;
  role: string;
  email: string;
  name: string | null;
};

export function StorefrontTeamInvitePanel({
  workspaceLinked,
  members,
  pendingInvites,
}: {
  workspaceLinked: boolean;
  members: MemberRow[];
  pendingInvites: StorefrontTeamInviteRow[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onInvite(formData: FormData) {
    setMessage(null);
    setLastInviteUrl(null);
    setError(null);
    const res = await inviteStorefrontTeamMemberAction(formData);
    if ("error" in res && res.error) {
      setError(getActionError(res) ?? "Something went wrong");
      return;
    }
    if (res.joined) {
      setMessage(`${res.email} was added to your workspace.`);
    } else {
      setMessage(`Invite saved for ${res.email}. Share the magic link below for incognito / manual smoke.`);
      if ("inviteUrl" in res && res.inviteUrl) setLastInviteUrl(res.inviteUrl);
    }
  }

  return (
    <div className="space-y-6">
      {!workspaceLinked ? (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Link a workspace on the storefront overview to invite teammates.
        </p>
      ) : (
        <form action={onInvite} className="space-y-4 rounded-xl border border-border/60 p-4">
          <div className="space-y-2">
            <Label htmlFor="inviteEmail">Invite by email</Label>
            <Input
              id="inviteEmail"
              name="email"
              type="email"
              required
              placeholder="chef@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteRole">Role</Label>
            <select
              id="inviteRole"
              name="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="STAFF"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-green-700 dark:text-green-400">{message}</p> : null}
          {lastInviteUrl ? <InviteMagicLinkCopy inviteUrl={lastInviteUrl} /> : null}
          <Button type="submit" className="rounded-full">
            Send invite
          </Button>
        </form>
      )}

      {pendingInvites.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Pending invites</h3>
          <ul className="space-y-2 text-sm">
            {pendingInvites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border/60 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <span>
                    {inv.email}{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      ({inv.role}) · expires{" "}
                      {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : "—"}
                    </span>
                  </span>
                  <InviteMagicLinkCopy
                    inviteUrl={`${SITE_URL}/invite/${encodeURIComponent(inv.token)}`}
                  />
                </div>
                <form action={cancelStorefrontTeamInviteFormAction}>
                  <input type="hidden" name="inviteId" value={inv.id} />
                  <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs">
                    Cancel
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {members.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Members</h3>
          <ul className="space-y-2 text-sm">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
              >
                <span>
                  {m.name ?? m.email}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{m.role}</span>
                </span>
                <form action={removeStorefrontTeamMemberFormAction}>
                  <input type="hidden" name="memberId" value={m.id} />
                  <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs text-destructive">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
