"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";

import { getB2bInvoicePayLinkAction } from "@/actions/shopify-b2b-pay-portal";
import {
  isB2bInvoiceDraftOpen,
  readB2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import { Button } from "@/components/ui/button";

export function OrderB2bInvoicePayLinkButton({
  orderId,
  sourceMetadataJson,
  paymentStatus,
}: {
  orderId: string;
  sourceMetadataJson: unknown;
  paymentStatus?: string | null;
}) {
  const draft = readB2bInvoiceDraftLink(sourceMetadataJson);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft) return null;
  const paid =
    draft.status === "paid" || (paymentStatus ?? "").toUpperCase() === "PAID";
  if (paid || !isB2bInvoiceDraftOpen(draft)) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await getB2bInvoicePayLinkAction(orderId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            try {
              await navigator.clipboard.writeText(result.data.url);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              setError("Unable to copy link — copy manually from the browser.");
            }
          });
        }}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : copied ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
        <span className="ml-1.5">{copied ? "Copied" : "Copy pay link"}</span>
      </Button>
      {draft.payPortalIssuedAt ? (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Link2 className="size-3" aria-hidden />
          Pay portal active
        </span>
      ) : null}
      {error ? <span className="max-w-[220px] text-right text-[10px] text-destructive">{error}</span> : null}
    </div>
  );
}
