"use client";

import { useTransition } from "react";
import { Loader2, Mail } from "lucide-react";

import { sendB2bInvoiceReminderFormAction } from "@/actions/shopify-b2b-invoice";
import {
  isB2bInvoiceDraftOpen,
  isB2bInvoiceOverdue,
  readB2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import { Button } from "@/components/ui/button";

export function OrderB2bInvoiceSendReminderButton({
  orderId,
  sourceMetadataJson,
  paymentStatus,
  compact = false,
}: {
  orderId: string;
  sourceMetadataJson: unknown;
  paymentStatus: string | null;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const draft = readB2bInvoiceDraftLink(sourceMetadataJson);
  if (!draft || !isB2bInvoiceDraftOpen(draft)) return null;
  if ((paymentStatus ?? "").toUpperCase() === "PAID") return null;
  if (!isB2bInvoiceOverdue(draft, Date.now())) return null;

  return (
    <form
      action={(formData) => {
        startTransition(() => sendB2bInvoiceReminderFormAction(formData));
      }}
      className={compact ? "inline-flex" : "inline-flex"}
      onClick={(e) => e.stopPropagation()}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={pending}
        title={draft.lastReminderAt ? `Last reminder ${new Date(draft.lastReminderAt).toLocaleDateString()}` : undefined}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Mail className="size-3.5" aria-hidden />
        )}
        <span className="ml-1 text-xs">Send reminder</span>
      </Button>
    </form>
  );
}
