import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";

import {
  isB2bInvoiceDraftOpen,
  isB2bInvoiceOverdue,
  readB2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import { formatCurrency } from "@/lib/utils";
import { OrderB2bInvoiceMarkPaidButton } from "@/components/orders/order-b2b-invoice-mark-paid-button";
import { OrderB2bInvoiceSendReminderButton } from "@/components/orders/order-b2b-invoice-send-reminder-button";
import { Badge } from "@/components/ui/badge";

export function OrderB2bInvoiceDraftBanner({
  orderId,
  sourceMetadataJson,
  paymentStatus,
}: {
  orderId: string;
  sourceMetadataJson: unknown;
  paymentStatus?: string | null;
}) {
  const draft = readB2bInvoiceDraftLink(sourceMetadataJson);
  if (!draft) return null;

  const amount = draft.amountCents / 100;
  const paidAmount =
    draft.paidAmountCents != null ? draft.paidAmountCents / 100 : draft.status === "paid" ? amount : null;
  const dueLabel = draft.dueAt
    ? new Date(draft.dueAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const overdue = isB2bInvoiceDraftOpen(draft) && isB2bInvoiceOverdue(draft, Date.now());
  const paid =
    draft.status === "paid" || (paymentStatus ?? "").toUpperCase() === "PAID";

  return (
    <div
      className={
        paid
          ? "rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm"
          : overdue
            ? "rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm"
            : "rounded-xl border border-sky-500/30 bg-sky-500/5 px-4 py-3 text-sm"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p
            className={
              paid
                ? "flex items-center gap-2 font-medium text-emerald-950 dark:text-emerald-100"
                : overdue
                  ? "flex items-center gap-2 font-medium text-amber-950 dark:text-amber-100"
                  : "flex items-center gap-2 font-medium text-sky-950 dark:text-sky-100"
            }
          >
            {paid ? (
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            ) : overdue ? (
              <AlertTriangle className="size-4 shrink-0" aria-hidden />
            ) : (
              <FileText className="size-4 shrink-0" aria-hidden />
            )}
            B2B invoice · {draft.invoiceNumber}
            {overdue ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Overdue
              </Badge>
            ) : null}
            {draft.status === "partial" ? (
              <Badge variant="outline" className="rounded-full text-[10px]">
                Partial
              </Badge>
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground">
            {paidAmount != null && draft.status !== "draft" ? (
              <>
                Collected {formatCurrency(paidAmount)} of {formatCurrency(amount)}{" "}
                {draft.currency.toUpperCase()}
              </>
            ) : (
              <>
                {formatCurrency(amount)} {draft.currency.toUpperCase()}
              </>
            )}
            {" · "}
            {draft.status}
            {draft.paymentTermsLabel ? <> · {draft.paymentTermsLabel}</> : null}
            {draft.poNumber ? (
              <>
                {" "}
                · PO#<span className="font-mono">{draft.poNumber}</span>
              </>
            ) : null}
            {dueLabel ? <> · due {dueLabel}</> : null}
            {draft.paidAt && paid ? (
              <>
                {" "}
                · paid{" "}
                {new Date(draft.paidAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </>
            ) : null}
            {draft.companyName ? <> · {draft.companyName}</> : null}
          </p>
          {!paid ? (
            <p className="text-xs text-muted-foreground">
              Collect payment outside Shopify, then mark paid here to close the receivable on this order.
              {draft.lastReminderAt ? (
                <>
                  {" "}
                  Last reminder sent{" "}
                  {new Date(draft.lastReminderAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  {(draft.reminderCount ?? 0) > 0 ? ` (${draft.reminderCount} total)` : ""}.
                </>
              ) : null}
            </p>
          ) : draft.paymentReference ? (
            <p className="text-xs text-muted-foreground">
              Reference <span className="font-mono">{draft.paymentReference}</span>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <OrderB2bInvoiceSendReminderButton
            orderId={orderId}
            sourceMetadataJson={sourceMetadataJson}
            paymentStatus={paymentStatus ?? null}
          />
          <OrderB2bInvoiceMarkPaidButton
            orderId={orderId}
            sourceMetadataJson={sourceMetadataJson}
            paymentStatus={paymentStatus ?? null}
          />
          <Link
            href={`/dashboard/orders/${orderId}`}
            className="rounded-full border border-border/80 px-3 py-1 text-xs font-medium hover:bg-muted/50"
          >
            Order detail
          </Link>
        </div>
      </div>
    </div>
  );
}

export function OrderB2bInvoiceDraftBadges({
  sourceMetadataJson,
  paymentStatus,
}: {
  sourceMetadataJson: unknown;
  paymentStatus?: string | null;
}) {
  const draft = readB2bInvoiceDraftLink(sourceMetadataJson);
  if (!draft) return null;

  const paid =
    draft.status === "paid" || (paymentStatus ?? "").toUpperCase() === "PAID";
  const overdue = !paid && isB2bInvoiceOverdue(draft, Date.now());

  return (
    <>
      <span
        className={
          paid
            ? "inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-900 dark:text-emerald-100"
            : overdue
              ? "inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-900 dark:text-amber-100"
              : "inline-flex items-center rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-900 dark:text-sky-100"
        }
        title={`B2B invoice ${draft.invoiceNumber} · ${draft.status}${overdue ? " · overdue" : ""}`}
      >
        {paid ? "PAID" : overdue ? "OVERDUE" : "INV"} {draft.invoiceNumber}
      </span>
    </>
  );
}
