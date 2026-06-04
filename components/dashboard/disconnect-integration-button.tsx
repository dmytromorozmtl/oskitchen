"use client";

import * as React from "react";

import { disconnectIntegration } from "@/actions/integrations";
import { Button } from "@/components/ui/button";
import { notifyActionResult } from "@/lib/feedback/notify-action-result";

export function DisconnectIntegrationButton({
  connectionId,
}: {
  connectionId: string;
}) {
  const [pending, setPending] = React.useState(false);

  async function onDisconnect() {
    if (
      !confirm(
        "Disconnect this integration? Channel publish rows tied to this connection will be removed.",
      )
    ) {
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("connectionId", connectionId);
      const result = await disconnectIntegration(fd);
      if (notifyActionResult(result, { successMessage: "Disconnected" })) {
        window.location.href = "/dashboard/sales-channels";
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className="rounded-full"
      disabled={pending}
      onClick={() => void onDisconnect()}
    >
      {pending ? "Removing…" : "Disconnect"}
    </Button>
  );
}
