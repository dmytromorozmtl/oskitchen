"use client";

import * as React from "react";
import { toast } from "sonner";

import { sendTestEmailAction } from "@/actions/notifications-center";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TestEmailForm({
  templateKey,
  disabled,
  disabledReason,
}: {
  templateKey: string;
  disabled: boolean;
  disabledReason?: string;
}) {
  const [recipient, setRecipient] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function onSubmit() {
    if (!recipient) {
      toast.error("Enter a recipient email.");
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("templateKey", templateKey);
      fd.set("recipient", recipient);
      const res = await sendTestEmailAction(fd);
      if (res.ok) {
        toast.success(`Sent (${res.status}).`);
      } else {
        toast.error(res.error ?? "Send failed.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <Label htmlFor={`test-${templateKey}`} className="text-xs">Test recipient</Label>
        <Input
          id={`test-${templateKey}`}
          type="email"
          value={recipient}
          placeholder={disabled ? disabledReason ?? "Configure Resend to enable" : "you@example.com"}
          disabled={disabled || pending}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>
      <Button onClick={onSubmit} disabled={disabled || pending} size="sm">
        {pending ? "Sending…" : "Send test"}
      </Button>
    </div>
  );
}
