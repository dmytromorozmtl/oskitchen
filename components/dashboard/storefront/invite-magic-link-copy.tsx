"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function InviteMagicLinkCopy({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <code className="max-w-full truncate rounded bg-muted px-2 py-1 text-xs">{inviteUrl}</code>
      <Button type="button" variant="outline" size="sm" className="h-7 rounded-full text-xs" onClick={copy}>
        {copied ? "Copied" : "Copy magic link"}
      </Button>
    </div>
  );
}
