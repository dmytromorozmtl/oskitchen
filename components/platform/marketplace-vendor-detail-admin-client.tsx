"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { moderatePlatformVendorAction } from "@/actions/platform/marketplace-vendors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  vendorStatusBadgeVariant,
  vendorStatusLabel,
} from "@/lib/marketplace/vendor-registration-types";
import type { PlatformVendorDetail } from "@/services/marketplace/platform-vendor-moderation-service";

function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function MarketplaceVendorDetailAdminClient({
  vendor,
  canModerate,
}: {
  vendor: PlatformVendorDetail;
  canModerate: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function runAction(action: "approve" | "reject" | "suspend" | "reactivate" | "review") {
    const notes =
      action === "reject" || action === "suspend"
        ? window.prompt("Moderation notes (optional):") ?? undefined
        : undefined;

    startTransition(async () => {
      const response = await moderatePlatformVendorAction({
        vendorId: vendor.vendorId,
        action,
        notes,
      });
      if (response.ok) {
        toast.success(`Vendor ${action}d.`);
      } else {
        toast.error(response.error);
      }
    });
  }

  const uploads = vendor.documents.filter((doc) => doc.kind === "upload");
  const reviews = vendor.documents.filter((doc) => doc.kind === "review");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/platform/marketplace/vendors" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← All vendors
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-white">{vendor.companyName}</h1>
          <p className="text-sm text-zinc-400">
            {vendor.legalName} · {vendor.type.replace(/_/g, " ").toLowerCase()}
          </p>
        </div>
        <Badge variant={vendorStatusBadgeVariant(vendor.status)} className="rounded-full">
          {vendorStatusLabel(vendor.status)}
        </Badge>
      </div>

      {canModerate ? (
        <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          {["PENDING", "UNDER_REVIEW"].includes(vendor.status) ? (
            <>
              <Button disabled={pending} onClick={() => runAction("approve")}>
                Approve
              </Button>
              <Button variant="destructive" disabled={pending} onClick={() => runAction("reject")}>
                Reject
              </Button>
              <Button variant="secondary" disabled={pending} onClick={() => runAction("review")}>
                Mark under review
              </Button>
            </>
          ) : null}
          {vendor.status === "APPROVED" ? (
            <Button variant="destructive" disabled={pending} onClick={() => runAction("suspend")}>
              Suspend vendor
            </Button>
          ) : null}
          {vendor.status === "SUSPENDED" ? (
            <Button disabled={pending} onClick={() => runAction("reactivate")}>
              Reactivate vendor
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Read-only — moderation requires platform organizations write permission.
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Orders", value: String(vendor.orderCount) },
          { label: "Revenue", value: formatMoney(vendor.revenue) },
          { label: "Products", value: String(vendor.productCount) },
          { label: "Disputes", value: String(vendor.disputeCount) },
          { label: "Avg rating", value: vendor.avgRating != null ? String(vendor.avgRating) : "—" },
          { label: "Plan", value: vendor.planTier },
          { label: "Commission", value: `${vendor.commissionRate}%` },
          { label: "Stripe Connect", value: vendor.stripeAccountId ? "Linked" : "Not linked" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">Registration & contact</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Workspace</dt>
              <dd className="text-zinc-200">{vendor.workspaceName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Country</dt>
              <dd className="text-zinc-200">{vendor.country ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Contact email</dt>
              <dd className="text-zinc-200">{vendor.contactEmail ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Phone</dt>
              <dd className="text-zinc-200">{vendor.contactPhone ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Website</dt>
              <dd className="text-zinc-200">
                {vendor.website ? (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="underline">
                    {vendor.website}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Verified</dt>
              <dd className="text-zinc-200">
                {vendor.verifiedAt ? new Date(vendor.verifiedAt).toLocaleString() : "Not verified"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Registered</dt>
              <dd className="text-zinc-200">{new Date(vendor.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">Documents</h2>
          {uploads.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No uploaded compliance documents.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {uploads.map((doc, index) => (
                <li key={`${doc.fileName}-${index}`} className="rounded-lg border border-zinc-800 px-3 py-2">
                  <p className="font-medium text-zinc-200">{doc.fileName ?? "Document"}</p>
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-200/90 underline"
                    >
                      Open file
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-500">No file URL on record</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {reviews.length > 0 ? (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">Moderation history</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {reviews.map((doc, index) => (
              <li key={`${doc.uploadedAt}-${index}`} className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300">
                <p>{doc.note ?? "Review note"}</p>
                <p className="text-xs text-zinc-500">
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "Unknown time"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Recent orders</h2>
        {vendor.recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No marketplace orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-2 py-2">PO</th>
                  <th className="px-2 py-2">Buyer</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Total</th>
                  <th className="px-2 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {vendor.recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-zinc-800">
                    <td className="px-2 py-2 font-mono text-xs">{order.poNumber ?? order.id.slice(0, 8)}</td>
                    <td className="px-2 py-2">{order.buyerName}</td>
                    <td className="px-2 py-2">{order.status}</td>
                    <td className="px-2 py-2">{formatMoney(order.total, order.currency)}</td>
                    <td className="px-2 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Disputes</h2>
        {vendor.disputes.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No disputes on record.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-2 py-2">Reason</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Order</th>
                  <th className="px-2 py-2">Opened</th>
                </tr>
              </thead>
              <tbody>
                {vendor.disputes.map((dispute) => (
                  <tr key={dispute.id} className="border-t border-zinc-800">
                    <td className="px-2 py-2">{dispute.reason.replace(/_/g, " ").toLowerCase()}</td>
                    <td className="px-2 py-2">{dispute.status}</td>
                    <td className="px-2 py-2 font-mono text-xs">{dispute.purchaseOrderId.slice(0, 8)}</td>
                    <td className="px-2 py-2">{new Date(dispute.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canModerate ? (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">Internal notes</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Use approve/reject/suspend actions above; notes are stored in vendor documents audit trail.
          </p>
          <Textarea className="mt-3" placeholder="Optional note for next moderation action…" disabled />
        </section>
      ) : null}
    </div>
  );
}
