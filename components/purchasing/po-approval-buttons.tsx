"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  approvePurchaseOrder,
  rejectPurchaseOrder,
  submitPurchaseOrderForApproval,
} from "@/actions/purchasing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notifyActionResult } from "@/lib/feedback/notify-action-result";

export function POApprovalButtons({ poId, status }: { poId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectNotes, setRejectNotes] = useState("");
  const [showReject, setShowReject] = useState(false);

  function run(
    action: (fd: FormData) => Promise<unknown>,
    successMessage: string,
  ) {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("purchaseOrderId", poId);
      if (rejectNotes.trim()) fd.append("notes", rejectNotes.trim());
      const result = await action(fd);
      if (!notifyActionResult(result, { successMessage })) return;
      router.refresh();
    });
  }

  if (status === "DRAFT") {
    return (
      <Button
        type="button"
        disabled={pending}
        className="rounded-full"
        onClick={() => run(submitPurchaseOrderForApproval, "Submitted for approval")}
      >
        {pending ? "Submitting…" : "Submit for approval"}
      </Button>
    );
  }

  if (status === "READY_FOR_REVIEW") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => run(approvePurchaseOrder, "Purchase order approved")}
          >
            {pending ? "Approving…" : "Approve"}
          </Button>
          <Button type="button" variant="outline" disabled={pending} className="rounded-full" onClick={() => setShowReject((v) => !v)}>
            Reject
          </Button>
        </div>
        {showReject ? (
          <div className="flex flex-wrap items-end gap-2">
            <Input
              placeholder="Reason (optional)"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="max-w-sm rounded-xl"
            />
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              className="rounded-full"
              onClick={() => run(rejectPurchaseOrder, "Purchase order rejected")}
            >
              {pending ? "Rejecting…" : "Confirm reject"}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}
