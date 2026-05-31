import Link from "next/link";
import { FileText } from "lucide-react";

import { readB2bInvoiceDraftLink } from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import { formatCurrency } from "@/lib/utils";

export function OrderB2bInvoiceDraftBanner({
  orderId,
  sourceMetadataJson,
}: {
  orderId: string;
  sourceMetadataJson: unknown;
}) {
  const draft = readB2bInvoiceDraftLink(sourceMetadataJson);
  if (!draft) return null;

  const amount = draft.amountCents / 100;
  const dueLabel = draft.dueAt
    ? new Date(draft.dueAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-2 font-medium text-sky-950 dark:text-sky-100">
            <FileText className="size-4 shrink-0" aria-hidden />
            B2B invoice draft · {draft.invoiceNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(amount)} {draft.currency.toUpperCase()} · {draft.status}
            {draft.paymentTermsLabel ? <> · {draft.paymentTermsLabel}</> : null}
            {draft.poNumber ? (
              <>
                {" "}
                · PO#<span className="font-mono">{draft.poNumber}</span>
              </>
            ) : null}
            {dueLabel ? <> · due {dueLabel}</> : null}
            {draft.companyName ? <> · {draft.companyName}</> : null}
          </p>
          <p className="text-xs text-muted-foreground">
            Review before sending to the client. Mark paid in Order Hub when payment is collected
            (Phase 18).
          </p>
        </div>
        <Link
          href={`/dashboard/orders/${orderId}`}
          className="shrink-0 rounded-full border border-sky-500/40 px-3 py-1 text-xs font-medium text-sky-900 hover:bg-sky-500/10 dark:text-sky-100"
        >
          Open order
        </Link>
      </div>
    </div>
  );
}

export function OrderB2bInvoiceDraftBadges({
  sourceMetadataJson,
}: {
  sourceMetadataJson: unknown;
}) {
  const draft = readB2bInvoiceDraftLink(sourceMetadataJson);
  if (!draft) return null;

  return (
    <span
      className="inline-flex items-center rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-900 dark:text-sky-100"
      title={`B2B invoice draft ${draft.invoiceNumber}`}
    >
      INV {draft.invoiceNumber}
    </span>
  );
}
