"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyReferralButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("Copied referral link");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Could not copy — select text manually.");
        }
      }}
    >
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}
