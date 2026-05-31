"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { markB2bInvoicePaidFormAction } from "@/actions/shopify-b2b-invoice";
import {
  isB2bInvoiceDraftOpen,
  readB2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import { Button } from "@/components/ui/button";

export function OrderB2bInvoiceMarkPaidButton({
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

  return (
    <form
      action={(formData) => {
        startTransition(() => markB2bInvoicePaidFormAction(formData));
      }}
      className={compact ? "inline-flex" : "flex flex-wrap items-center gap-2"}
      onClick={(e) => e.stopPropagation()}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <Button
        type="submit"
        size="sm"
        variant={compact ? "outline" : "default"}
        className="rounded-full"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <CheckCircle2 className="size-3.5" aria-hidden />
        )}
        <span className={compact ? "ml-1 text-xs" : "ml-1.5"}>Mark invoice paid</span>
      </Button>
    </form>
  );
}
