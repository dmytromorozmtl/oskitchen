"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import { disconnectIntegration } from "@/actions/integrations";
import { Button } from "@/components/ui/button";

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
      if (!result.ok) toast.error(getActionError(result) ?? "Something went wrong");
      else {
        toast.success("Disconnected");
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
