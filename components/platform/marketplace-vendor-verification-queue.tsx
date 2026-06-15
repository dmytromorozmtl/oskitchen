"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { reviewMarketplaceVendorRegistrationAction } from "@/actions/platform/marketplace-vendor-verification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  vendorStatusBadgeVariant,
  vendorStatusLabel,
} from "@/lib/marketplace/vendor-registration-types";
import type { VendorVerificationQueueRow } from "@/services/marketplace/vendor-registration-service";

export function MarketplaceVendorVerificationQueue({
  queue,
  canReview,
}: {
  queue: VendorVerificationQueueRow[];
  canReview: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (queue.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-6 text-sm text-zinc-400">
        No vendor applications awaiting verification.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {queue.map((vendor) => (
        <article
          key={vendor.vendorId}
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">{vendor.companyName}</h2>
              <p className="text-sm text-zinc-400">
                {vendor.legalName} · {vendor.type.replace(/_/g, " ").toLowerCase()}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Workspace: {vendor.workspaceName ?? "—"} · Submitted{" "}
                {new Date(vendor.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge variant={vendorStatusBadgeVariant(vendor.status)} className="rounded-full">
              {vendorStatusLabel(vendor.status)}
            </Badge>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Country</dt>
              <dd className="text-zinc-200">{vendor.country ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Contact</dt>
              <dd className="text-zinc-200">{vendor.contactEmail ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Phone</dt>
              <dd className="text-zinc-200">{vendor.contactPhone ?? "—"}</dd>
            </div>
            <div>
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
          </dl>

          {vendor.documents.filter((doc) => doc.kind === "upload").length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-zinc-300">
              {vendor.documents
                .filter((doc) => doc.kind === "upload")
                .map((doc, index) => (
                  <li key={index}>
                    {doc.fileUrl ? (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        {doc.fileName}
                      </a>
                    ) : (
                      doc.fileName
                    )}
                  </li>
                ))}
            </ul>
          ) : null}

          {canReview ? (
            <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
              <Textarea
                id={`notes-${vendor.vendorId}`}
                placeholder="Internal review notes (optional)"
                rows={2}
                className="bg-zinc-950"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  className="rounded-full border-zinc-700"
                  onClick={() => {
                    const notes = (
                      document.getElementById(`notes-${vendor.vendorId}`) as HTMLTextAreaElement | null
                    )?.value;
                    startTransition(async () => {
                      const result = await reviewMarketplaceVendorRegistrationAction({
                        vendorId: vendor.vendorId,
                        decision: "review",
                        notes,
                      });
                      if (result.ok) toast.success("Marked under review");
                      else toast.error(result.error);
                    });
                  }}
                >
                  Mark under review
                </Button>
                <Button
                  size="sm"
                  disabled={pending}
                  className="rounded-full"
                  onClick={() => {
                    const notes = (
                      document.getElementById(`notes-${vendor.vendorId}`) as HTMLTextAreaElement | null
                    )?.value;
                    startTransition(async () => {
                      const result = await reviewMarketplaceVendorRegistrationAction({
                        vendorId: vendor.vendorId,
                        decision: "approve",
                        notes,
                      });
                      if (result.ok) toast.success("Vendor approved");
                      else toast.error(result.error);
                    });
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  className="rounded-full"
                  onClick={() => {
                    const notes = (
                      document.getElementById(`notes-${vendor.vendorId}`) as HTMLTextAreaElement | null
                    )?.value;
                    startTransition(async () => {
                      const result = await reviewMarketplaceVendorRegistrationAction({
                        vendorId: vendor.vendorId,
                        decision: "reject",
                        notes,
                      });
                      if (result.ok) toast.success("Vendor rejected");
                      else toast.error(result.error);
                    });
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
