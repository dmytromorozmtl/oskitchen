"use client";

import { getActionError } from "@/lib/action-result";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { saveAccountNotificationPrefsAction } from "@/actions/settings/account-notifications";
import type { AccountNotificationPrefs } from "@/lib/account/notification-prefs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountNotificationsForm({ initial }: { initial: AccountNotificationPrefs }) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await saveAccountNotificationPrefsAction(fd);
    setPending(false);
    const err = getActionError(result);
    if (err) toast.error(err);
    else toast.success("Notification preferences saved");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your notification channels</CardTitle>
          <CardDescription>
            Choose how OS Kitchen reaches you. Workspace-wide customer notifications are managed in
            the{" "}
            <Link href="/dashboard/notifications" className="text-primary hover:underline">
              Notification Center
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            name="emailEnabled"
            label="Email"
            description="Order updates, security alerts, and account messages."
            defaultChecked={initial.emailEnabled}
          />
          <ToggleRow
            name="pushEnabled"
            label="Push (browser)"
            description="Real-time alerts when you allow notifications in your browser."
            defaultChecked={initial.pushEnabled}
          />
          <ToggleRow
            name="smsEnabled"
            label="SMS"
            description="Text messages for urgent operational alerts (when SMS is enabled for your workspace)."
            defaultChecked={initial.smsEnabled}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save preferences"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background/80 p-4">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-input"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}
