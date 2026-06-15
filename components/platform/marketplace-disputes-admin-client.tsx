"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  escalatePlatformDisputeAction,
  loadPlatformDisputeDetailAction,
  resolvePlatformDisputeAction,
} from "@/actions/platform/marketplace-disputes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  disputeReasonLabel,
  disputeStatusBadgeVariant,
  disputeStatusLabel,
  MARKETPLACE_DISPUTE_REASONS,
  MARKETPLACE_DISPUTE_STATUSES,
  type DisputeResolutionDecision,
} from "@/lib/marketplace/dispute-types";
import {
  platformDisputeAdminFiltersToQuery,
  type PlatformDisputeAdminFilters,
} from "@/lib/platform/marketplace-dispute-admin-filters";
import type {
  PlatformDisputeDetail,
  PlatformDisputeListItem,
} from "@/services/marketplace/platform-dispute-resolution-service";

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function DisputeDetailPanel({
  dispute,
  canResolve,
  onResolved,
}: {
  dispute: PlatformDisputeDetail;
  canResolve: boolean;
  onResolved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [decision, setDecision] = useState<DisputeResolutionDecision>("refund");
  const [notes, setNotes] = useState("");
  const [splitBuyerAmount, setSplitBuyerAmount] = useState(
    String(Math.round(dispute.orderTotal / 2)),
  );

  function submitResolution() {
    startTransition(async () => {
      const response = await resolvePlatformDisputeAction({
        disputeId: dispute.id,
        decision,
        notes,
        splitBuyerAmount: decision === "split" ? Number(splitBuyerAmount) : undefined,
      });
      if (response.ok) {
        toast.success("Dispute resolved.");
        onResolved();
      } else {
        toast.error(response.error);
      }
    });
  }

  function escalate() {
    startTransition(async () => {
      const response = await escalatePlatformDisputeAction(dispute.id);
      if (response.ok) toast.success("Moved to admin review.");
      else toast.error(response.error);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Order</p>
          <p className="text-sm text-zinc-200">
            {dispute.poNumber ?? dispute.purchaseOrderId.slice(0, 8)} · {dispute.orderStatus} ·{" "}
            {formatMoney(dispute.orderTotal, dispute.currency)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            <Link href={`/platform/marketplace/vendors/${dispute.vendorId}`} className="underline">
              {dispute.vendorName}
            </Link>
            {" · "}
            {dispute.buyerName}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Description</p>
          <p className="text-sm text-zinc-300">{dispute.description}</p>
        </div>

        {dispute.photos.length > 0 ? (
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Photos</p>
            <div className="flex flex-wrap gap-2">
              {dispute.photos.map((photo) => (
                <a
                  key={photo}
                  href={photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-amber-200/90 underline"
                >
                  View photo
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Line items</p>
          <ul className="space-y-2 text-sm">
            {dispute.lineItems.map((item) => (
              <li key={`${item.sku}-${item.quantity}`} className="rounded-lg border border-zinc-800 px-3 py-2">
                {item.productName} · {item.sku} · {item.quantity} × {formatMoney(item.unitPrice, dispute.currency)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Order messages</p>
          {dispute.messages.length === 0 ? (
            <p className="text-sm text-zinc-500">No messages on this order.</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
              {dispute.messages.map((message) => (
                <li key={message.id} className="rounded-lg border border-zinc-800 px-3 py-2">
                  <p className="text-xs text-zinc-500">{message.senderType}</p>
                  <p className="text-zinc-300">{message.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {dispute.resolution ? (
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Resolution history</p>
            <ul className="space-y-2 text-sm">
              {[...(dispute.resolution.history ?? []), dispute.resolution.current].map((entry, index) => (
                <li key={`${entry.resolvedAt}-${index}`} className="rounded-lg border border-zinc-800 px-3 py-2">
                  <p className="font-medium text-zinc-200">
                    {entry.decision.replace("_", " ")} · buyer {formatMoney(entry.buyerAmount, dispute.currency)} ·
                    vendor {formatMoney(entry.vendorAmount, dispute.currency)}
                  </p>
                  <p className="text-zinc-400">{entry.notes}</p>
                  <p className="text-xs text-zinc-500">
                    {entry.resolvedByEmail ?? entry.resolvedById} ·{" "}
                    {new Date(entry.resolvedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {canResolve && dispute.status !== "RESOLVED" ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="text-sm font-semibold text-white">Admin decision</p>
            <div className="mt-3 space-y-3">
              <Select value={decision} onValueChange={(value) => setDecision(value as DisputeResolutionDecision)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">Refund buyer</SelectItem>
                  <SelectItem value="pay_vendor">Pay vendor</SelectItem>
                  <SelectItem value="split">Split payment</SelectItem>
                </SelectContent>
              </Select>
              {decision === "split" ? (
                <Input
                  type="number"
                  min={0}
                  max={dispute.orderTotal}
                  step="0.01"
                  value={splitBuyerAmount}
                  onChange={(event) => setSplitBuyerAmount(event.target.value)}
                  placeholder="Buyer refund amount"
                />
              ) : null}
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Resolution notes (required)"
              />
              <div className="flex flex-wrap gap-2">
                <Button disabled={pending} onClick={submitResolution}>
                  Resolve dispute
                </Button>
                {dispute.status !== "ADMIN_REVIEW" ? (
                  <Button variant="secondary" disabled={pending} onClick={escalate}>
                    Escalate to admin review
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MarketplaceDisputesAdminClient({
  filters,
  result,
  openCount,
  canResolve,
}: {
  filters: PlatformDisputeAdminFilters;
  result: {
    items: PlatformDisputeListItem[];
    total: number;
    page: number;
    totalPages: number;
  };
  openCount: number;
  canResolve: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailById, setDetailById] = useState<Record<string, PlatformDisputeDetail>>({});

  function navigate(next: Partial<PlatformDisputeAdminFilters>) {
    const merged = { ...filters, ...next };
    const query = platformDisputeAdminFiltersToQuery(merged);
    const qs = new URLSearchParams(query).toString();
    router.push(qs ? `/platform/marketplace/disputes?${qs}` : "/platform/marketplace/disputes");
  }

  function openDetail(disputeId: string) {
    if (expandedId === disputeId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(disputeId);
    if (detailById[disputeId]) return;

    startTransition(async () => {
      const response = await loadPlatformDisputeDetailAction(disputeId);
      if (response.ok) {
        setDetailById((prev) => ({ ...prev, [disputeId]: response.detail }));
      } else {
        toast.error(response.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
        <Badge variant="secondary" className="rounded-full">
          {openCount} open
        </Badge>
        <span>{result.total} total disputes</span>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Search PO, vendor, buyer, description…"
          defaultValue={filters.q ?? ""}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              navigate({ q: event.currentTarget.value.trim() || undefined, page: 1 });
            }
          }}
        />
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) =>
            navigate({
              status: value === "all" ? undefined : (value as PlatformDisputeAdminFilters["status"]),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {MARKETPLACE_DISPUTE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {disputeStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.reason ?? "all"}
          onValueChange={(value) =>
            navigate({
              reason: value === "all" ? undefined : (value as PlatformDisputeAdminFilters["reason"]),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reasons</SelectItem>
            {MARKETPLACE_DISPUTE_REASONS.map((reason) => (
              <SelectItem key={reason} value={reason}>
                {disputeReasonLabel(reason)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          defaultValue={filters.dateFrom ?? ""}
          onChange={(event) => navigate({ dateFrom: event.target.value || undefined, page: 1 })}
        />
        <Input
          type="date"
          defaultValue={filters.dateTo ?? ""}
          onChange={(event) => navigate({ dateTo: event.target.value || undefined, page: 1 })}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[1000px] text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Dispute</th>
              <th className="px-3 py-2">Reason</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Buyer</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Opened</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-zinc-500">
                  No disputes match the current filters.
                </td>
              </tr>
            ) : (
              result.items.map((dispute) => (
                <Fragment key={dispute.id}>
                  <tr className="border-t border-zinc-800">
                    <td className="px-3 py-2">
                      <p className="font-medium text-white">{dispute.description.slice(0, 80)}</p>
                      <p className="text-xs text-zinc-500">
                        {dispute.photoCount} photo{dispute.photoCount === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="px-3 py-2">{disputeReasonLabel(dispute.reason)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={disputeStatusBadgeVariant(dispute.status)} className="rounded-full">
                        {disputeStatusLabel(dispute.status)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{dispute.poNumber ?? dispute.purchaseOrderId.slice(0, 8)}</td>
                    <td className="px-3 py-2">
                      <Link href={`/platform/marketplace/vendors/${dispute.vendorId}`} className="hover:underline">
                        {dispute.vendorName}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{dispute.buyerName}</td>
                    <td className="px-3 py-2">{formatMoney(dispute.orderTotal, dispute.currency)}</td>
                    <td className="px-3 py-2">{new Date(dispute.openedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => openDetail(dispute.id)}>
                        {expandedId === dispute.id ? "Close" : "Review"}
                      </Button>
                    </td>
                  </tr>
                  {expandedId === dispute.id && detailById[dispute.id] ? (
                    <tr className="border-t border-zinc-800 bg-zinc-950/40">
                      <td colSpan={9} className="px-4 py-4">
                        <DisputeDetailPanel
                          dispute={detailById[dispute.id]}
                          canResolve={canResolve}
                          onResolved={() => router.refresh()}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          Page {result.page} of {result.totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={result.page <= 1}
            onClick={() => navigate({ page: result.page - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
            onClick={() => navigate({ page: result.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
