"use client";

import { useState, useTransition } from "react";

import {
  approveMappingAction,
  rejectMappingAction,
  updateProductMappingStatusFormAction,
} from "@/actions/product-mapping";
import { Button } from "@/components/ui/button";

type ProductOption = { id: string; title: string };

export function MappingRowActions({
  mappingId,
  initialProductId,
  initialStatus,
  candidates,
  hasCandidate,
}: {
  mappingId: string;
  initialProductId: string | null;
  initialStatus: string;
  candidates: ProductOption[];
  hasCandidate: boolean;
}) {
  const [productId, setProductId] = useState(initialProductId ?? "");
  const [status, setStatus] = useState(initialStatus);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <form
        className="grid gap-2 md:grid-cols-[1fr_180px_auto]"
        action={(formData) =>
          startTransition(async () => {
            setError(null);
            try {
              await updateProductMappingStatusFormAction(formData);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not save mapping.");
            }
          })
        }
      >
        <input type="hidden" name="mappingId" value={mappingId} />
        <select
          name="internalProductId"
          value={productId}
          onChange={(e) => setProductId(e.currentTarget.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">No OS Kitchen product selected</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.currentTarget.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="UNMAPPED">Unmapped</option>
          <option value="SUGGESTED">Suggested</option>
          <option value="NEEDS_REVIEW">Needs review</option>
          <option value="APPROVED">Approved</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IGNORED">Ignored</option>
          <option value="REJECTED">Rejected</option>
          <option value="CONFLICT">Conflict</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <form
          action={(formData) =>
            startTransition(async () => {
              setError(null);
              try {
                await approveMappingAction(formData);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not approve.");
              }
            })
          }
        >
          <input type="hidden" name="mappingId" value={mappingId} />
          <input type="hidden" name="internalProductId" value={productId} />
          <input type="hidden" name="confirm" value="true" />
          <Button
            type="submit"
            size="sm"
            disabled={isPending || (!hasCandidate && !productId)}
            title={!hasCandidate && !productId ? "Pick a OS Kitchen product first" : undefined}
          >
            Approve
          </Button>
        </form>

        {!showReject ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowReject(true)}>
            Reject…
          </Button>
        ) : (
          <form
            className="flex items-center gap-2"
            action={(formData) =>
              startTransition(async () => {
                setError(null);
                try {
                  await rejectMappingAction(formData);
                  setShowReject(false);
                  setReason("");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Could not reject.");
                }
              })
            }
          >
            <input type="hidden" name="mappingId" value={mappingId} />
            <input type="hidden" name="confirm" value="true" />
            <input
              type="text"
              name="reason"
              required
              minLength={2}
              maxLength={400}
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
              placeholder="Reason"
              className="rounded-md border bg-background px-2 py-1 text-xs"
            />
            <Button type="submit" size="sm" variant="destructive" disabled={isPending || reason.length < 2}>
              Reject
            </Button>
          </form>
        )}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
