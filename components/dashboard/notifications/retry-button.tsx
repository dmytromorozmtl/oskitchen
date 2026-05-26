"use client";

import * as React from "react";
import { toast } from "sonner";

import { cancelNotificationAction, retryNotificationAction } from "@/actions/notifications-center";
import { Button } from "@/components/ui/button";

export function RetryButton({ logId, disabled }: { logId: string; disabled?: boolean }) {
  const [pending, setPending] = React.useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled || pending}
      onClick={async () => {
        setPending(true);
        const fd = new FormData();
        fd.set("logId", logId);
        const res = await retryNotificationAction(fd);
        setPending(false);
        if ("ok" in res && res.ok) toast.success(`Retried (${res.status}).`);
        else toast.error(res.error ?? "Retry failed.");
      }}
    >
      {pending ? "Retrying…" : "Retry"}
    </Button>
  );
}

export function CancelButton({ logId }: { logId: string }) {
  const [pending, setPending] = React.useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const fd = new FormData();
        fd.set("logId", logId);
        const res = await cancelNotificationAction(fd);
        setPending(false);
        if ("ok" in res && res.ok) toast.success("Cancelled.");
        else toast.error(res.error ?? "Cancel failed.");
      }}
    >
      {pending ? "…" : "Cancel"}
    </Button>
  );
}
